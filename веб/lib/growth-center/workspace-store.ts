import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { getGrowthCenterData } from "./server";
import type { GrowthCenterDataset } from "./model";
import { WORKSPACE_STAGE_IDS, countsSchema, emptyCounts, moscowWeekKey, nextWeekKey, weekCutoff, weekSnapshotSchema, workspaceCardSchema, workspaceCommandSchema, type WorkspaceCard, type WorkspaceCapabilities, type WorkspaceCommand, type WorkspaceView } from "./workspace-model";

export class WorkspaceError extends Error {
  constructor(public code: string, public status = 400, public revision?: number) { super(code); }
}
const iso = z.string().datetime();
const sessionSchema = z.object({ id: z.string(), csrfToken: z.string(), expiresAt: iso }).strict();
const scoutSchema = z.object({ id: z.string(), cardId: z.string(), status: z.enum(["queued", "git_pending", "git_saved"]), createdAt: iso, gitPath: z.string(), commitSha: z.string().nullable() }).strict();
const outboxSchema = z.object({ id: z.string(), kind: z.enum(["backup", "scout"]), revision: z.number().int(), path: z.string(), payload: z.string(), state: z.enum(["pending", "synced", "error"]), commitSha: z.string().nullable(), error: z.string().nullable(), attempts: z.number().int().nonnegative() }).strict();
const receiptSchema = z.object({ requestId: z.string(), digest: z.string(), appliedRevision: z.number().int(), scoutRequestId: z.string().optional() }).strict();
const stateSchema = z.object({ version: z.literal(1), revision: z.number().int().nonnegative(), createdAt: iso, updatedAt: iso, cards: z.array(workspaceCardSchema), facts: z.array(z.object({ weekKey: z.string(), counts: countsSchema, source: z.string(), createdAt: iso }).strict()), snapshots: z.array(weekSnapshotSchema), scoutRequests: z.array(scoutSchema), outbox: z.array(outboxSchema), receipts: z.array(receiptSchema), sessions: z.array(sessionSchema) }).strict();
export type WorkspaceState = z.infer<typeof stateSchema>;
export type WorkspaceOutboxItem = z.infer<typeof outboxSchema>;
export type WorkspaceSession = z.infer<typeof sessionSchema>;
export type WorkspaceStoreOptions = { directory?: string; now?: () => Date; seed?: GrowthCenterDataset };
export type ScoutRequestPayload = { version: 1; id: string; cardId: string; createdAt: string; card: Pick<WorkspaceCard, "title" | "format" | "channels" | "stageIds" | "briefPath" | "origin">; question: string; expectedResearch: string; evidenceCriteria: string[]; unknowns: string[]; manualTrigger: string };

function safeState(raw: unknown): WorkspaceState {
  const result = stateSchema.safeParse(raw);
  if (!result.success) throw new WorkspaceError("workspace_store_invalid", 503);
  const state = result.data;
  if (new Set(state.cards.map(card => card.id)).size !== state.cards.length || new Set(state.receipts.map(r => r.requestId)).size !== state.receipts.length) throw new WorkspaceError("workspace_store_invalid", 503);
  return state;
}
function initialState(seed: GrowthCenterDataset, now: Date): WorkspaceState {
  return { version: 1, revision: 0, createdAt: now.toISOString(), updatedAt: now.toISOString(), cards: seed.content.map((card, order) => ({ id: card.id, title: card.title, format: card.format, channels: card.channel, stageIds: card.stageIds.filter(id => (WORKSPACE_STAGE_IDS as readonly string[]).includes(id)) as WorkspaceCard["stageIds"], column: card.status === "published" ? "release" : ["review", "approved"].includes(card.status) ? "approval" : "task", order, briefPath: card.briefPath, script: null, shots: [], origin: { url: null, evidence: "unverified", observedAt: null, note: "Нужна разведка: источник идеи не подтверждён." }, departmentDecision: { status: "pending", note: "Решение профильного отдела ещё не внесено.", at: null }, publication: card.publication ? { url: card.publication.url, publishedAt: card.publication.publishedAt } : null })), facts: [], snapshots: [], scoutRequests: [], outbox: [], receipts: [], sessions: [] };
}
function sealState(state: WorkspaceState, now: Date): boolean {
  let key = moscowWeekKey(new Date(state.createdAt));
  let changed = false;
  // Each missing week is reconstructed solely from events that existed by its cutoff.
  for (let n = 0; Date.parse(weekCutoff(key)) <= now.getTime(); n++, key = nextWeekKey(key)) {
    if (n > 5200) throw new WorkspaceError("workspace_history_range_invalid", 503);
    if (state.snapshots.some(snapshot => snapshot.weekKey === key && snapshot.kind === "freeze")) continue;
    const cutoffAt = weekCutoff(key);
    const event = state.facts.filter(event => event.weekKey === key && event.createdAt <= cutoffAt).at(-1);
    state.snapshots.push({ weekKey: key, cutoffAt, version: 1, counts: event?.counts ?? emptyCounts(), source: event?.source ?? "Нет измерения этой недели к моменту отсечения.", capturedAt: now.toISOString(), kind: "freeze", supersedesVersion: null, reason: null });
    changed = true;
  }
  return changed;
}
function backupPayload(state: WorkspaceState) {
  return { version: state.version, revision: state.revision, createdAt: state.createdAt, updatedAt: state.updatedAt, cards: state.cards, facts: state.facts, snapshots: state.snapshots, scoutRequests: state.scoutRequests };
}
function enqueueBackup(state: WorkspaceState) {
  if (state.outbox.some(item => item.kind === "backup" && item.revision === state.revision)) return;
  state.outbox.push({ id: `backup-${state.revision}`, kind: "backup", revision: state.revision, path: `projects/vernatun/content-plan/workspace-history/${state.revision}.json`, payload: JSON.stringify(backupPayload(state), null, 2) + "\n", state: "pending", commitSha: null, error: null, attempts: 0 });
}
const hashCommand = (command: WorkspaceCommand) => createHash("sha256").update(JSON.stringify(command)).digest("hex");

export function createWorkspaceStore(options: WorkspaceStoreOptions = {}) {
  const directory = options.directory ?? process.env.GROWTH_WORKSPACE_DATA_DIR ?? path.join(process.cwd(), "data", "local", "growth-workspace");
  if (!path.isAbsolute(directory)) throw new WorkspaceError("workspace_storage_not_configured", 503);
  const filename = path.join(directory, "state.json"), lockfile = path.join(directory, "state.lock");
  const clock = options.now ?? (() => new Date());
  let mutex: Promise<unknown> = Promise.resolve();
  async function readDisk() {
    try { return safeState(JSON.parse(await fs.readFile(filename, "utf8"))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return initialState(options.seed ?? getGrowthCenterData(), clock()); if (error instanceof WorkspaceError) throw error; throw new WorkspaceError("workspace_store_unreadable", 503); }
  }
  async function persist(state: WorkspaceState) {
    safeState(state);
    const temp = path.join(directory, `.state-${randomUUID()}.tmp`);
    const handle = await fs.open(temp, "wx", 0o600);
    try { await handle.writeFile(JSON.stringify(state)); await handle.sync(); } finally { await handle.close(); }
    try { await fs.rename(temp, filename); const parent = await fs.open(directory, "r"); try { await parent.sync(); } finally { await parent.close(); } }
    catch (error) { await fs.unlink(temp).catch(() => undefined); throw error; }
  }
  async function transaction<T>(change: (state: WorkspaceState) => Promise<{ value: T; changed: boolean }> | { value: T; changed: boolean }): Promise<T> {
    const run = async () => {
      await fs.mkdir(directory, { recursive: true, mode: 0o700 });
      let lock;
      for (let attempt = 0; attempt < 80; attempt++) {
        try {
          lock = await fs.open(lockfile, "wx", 0o600);
          try { await lock.writeFile(JSON.stringify({ pid: process.pid, at: Date.now() })); }
          catch (error) { await lock.close(); lock = undefined; await fs.unlink(lockfile).catch(() => undefined); throw error; }
          break;
        }
        catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
          try {
            const owner = JSON.parse(await fs.readFile(lockfile, "utf8"));
            if (Number.isSafeInteger(owner.pid) && owner.pid > 0 && Date.now() - owner.at > 30000) {
              try { process.kill(owner.pid, 0); } catch (failure) { if ((failure as NodeJS.ErrnoException).code === "ESRCH") await fs.unlink(lockfile).catch(() => undefined); }
            }
          } catch { /* Another process may still be writing its lock. Never reset the store. */ }
          await new Promise(resolve => setTimeout(resolve, 25));
        }
      }
      if (!lock) throw new WorkspaceError("workspace_busy", 409);
      try { const state = await readDisk(); const result = await change(state); if (result.changed) await persist(state); return result.value; }
      catch (error) { if (error instanceof WorkspaceError) throw error; throw new WorkspaceError("workspace_save_failed", 503); }
      finally { await lock.close(); await fs.unlink(lockfile).catch(() => undefined); }
    };
    const pending = mutex.then(run, run); mutex = pending.catch(() => undefined); return pending;
  }
  const api = {
    read: readDisk,
    async mutate(command: WorkspaceCommand) {
      const parsed = workspaceCommandSchema.safeParse(command);
      if (!parsed.success) throw new WorkspaceError("invalid_command");
      command = parsed.data;
      return transaction(state => {
        const previous = state.receipts.find(receipt => receipt.requestId === command.requestId);
        if (previous) {
          if (previous.digest !== hashCommand(command)) throw new WorkspaceError("idempotency_conflict", 409, state.revision);
          return { value: { state, receipt: { requestId: previous.requestId, appliedRevision: previous.appliedRevision, replayed: true, ...(previous.scoutRequestId ? { scoutRequestId: previous.scoutRequestId } : {}) } }, changed: false };
        }
        if (command.expectedRevision !== state.revision) throw new WorkspaceError("revision_conflict", 409, state.revision);
        const now = clock(), timestamp = now.toISOString();
        if (command.type === "save_counts" && now.getTime() >= Date.parse(weekCutoff(moscowWeekKey(now)))) throw new WorkspaceError("week_closed", 409, state.revision);
        if (command.type === "retry_git") {
          for (const item of state.outbox) if (item.state === "error") { item.state = "pending"; item.error = null; }
          state.receipts.push({ requestId: command.requestId, digest: hashCommand(command), appliedRevision: state.revision });
          return { value: { state, receipt: { requestId: command.requestId, appliedRevision: state.revision, replayed: false } }, changed: true };
        }
        sealState(state, now);
        let scoutRequestId: string | undefined;
        if (command.type === "save_counts") state.facts.push({ weekKey: moscowWeekKey(now), counts: command.counts, source: command.source, createdAt: timestamp });
        if (command.type === "move_card") {
          const card = state.cards.find(card => card.id === command.cardId);
          if (!card) throw new WorkspaceError("card_not_found", 404);
          if (command.beforeCardId === card.id) throw new WorkspaceError("invalid_card_position");
          const peers = state.cards.filter(candidate => candidate.id !== card.id && candidate.column === command.column).sort((a, b) => a.order - b.order);
          let position = peers.length;
          if (command.beforeCardId !== null) { position = peers.findIndex(peer => peer.id === command.beforeCardId); if (position < 0) throw new WorkspaceError("invalid_card_position"); }
          const old = card.column; card.column = command.column; peers.splice(position, 0, card); peers.forEach((peer, i) => { peer.order = i; });
          if (old !== command.column) state.cards.filter(peer => peer.column === old).sort((a, b) => a.order - b.order).forEach((peer, i) => { peer.order = i; });
        }
        if (command.type === "update_card") {
          const card = state.cards.find(card => card.id === command.cardId); if (!card) throw new WorkspaceError("card_not_found", 404);
          const today = new Date(now.getTime() + 3 * 3600000).toISOString().slice(0, 10);
          if (command.patch.origin?.observedAt && command.patch.origin.observedAt > today || command.patch.departmentDecision?.at && command.patch.departmentDecision.at > today || command.patch.publication?.publishedAt && command.patch.publication.publishedAt > today) throw new WorkspaceError("future_evidence_date");
          Object.assign(card, command.patch);
        }
        if (command.type === "request_scout") {
          const card = state.cards.find(card => card.id === command.cardId); if (!card) throw new WorkspaceError("card_not_found", 404);
          scoutRequestId = `scout-${randomUUID()}`;
          const gitPath = `projects/vernatun/departments/scout/requests/growth/${scoutRequestId}/00-request.json`;
          state.scoutRequests.push({ id: scoutRequestId, cardId: card.id, status: "queued", createdAt: timestamp, gitPath, commitSha: null });
          const payload: ScoutRequestPayload = { version: 1, id: scoutRequestId, cardId: card.id, createdAt: timestamp, card: { title: card.title, format: card.format, channels: card.channels, stageIds: card.stageIds, briefPath: card.briefPath, origin: card.origin }, question: "Проверь происхождение идеи и применимость формата к указанному этапу клуба Вернатун.", expectedResearch: "Сохрани проверяемый отчёт с датированными первичными источниками, ограничениями и решением по карточке; не производи контент.", evidenceCriteria: ["Публичная ссылка и дата наблюдения", "Отдельно факты, оценки и неизвестное", "Метрики популярности только с датой и проверяемым источником"], unknowns: ["Эффект на целевую аудиторию клуба не измерен", ...(card.origin.evidence === "unverified" ? ["Источник идеи не подтверждён"] : [])], manualTrigger: "Не запускать без сообщения владельца «обновляй инфу»" };
          state.outbox.push({ id: scoutRequestId, kind: "scout", revision: state.revision + 1, path: gitPath, payload: JSON.stringify(payload, null, 2) + "\n", state: "pending", commitSha: null, error: null, attempts: 0 });
        }
        if (command.type === "correct_snapshot") {
          const prior = state.snapshots.filter(snapshot => snapshot.weekKey === command.weekKey).sort((a, b) => b.version - a.version)[0];
          if (!prior) throw new WorkspaceError("snapshot_not_found", 404);
          state.snapshots.push({ weekKey: prior.weekKey, cutoffAt: prior.cutoffAt, version: prior.version + 1, counts: command.counts, source: command.source, capturedAt: timestamp, kind: "correction", supersedesVersion: prior.version, reason: command.reason });
        }
        state.revision++; state.updatedAt = timestamp;
        const receipt = { requestId: command.requestId, digest: hashCommand(command), appliedRevision: state.revision, ...(scoutRequestId ? { scoutRequestId } : {}) };
        state.receipts.push(receipt); enqueueBackup(state);
        return { value: { state, receipt: { requestId: receipt.requestId, appliedRevision: receipt.appliedRevision, replayed: false, ...(scoutRequestId ? { scoutRequestId } : {}) } }, changed: true };
      });
    },
    async sealDueWeeks() { return transaction(async state => { const existed = await fs.access(filename).then(() => true, () => false); const changed = sealState(state, clock()); if (changed) { state.revision++; state.updatedAt = clock().toISOString(); enqueueBackup(state); } return { value: state, changed: changed || !existed }; }); },
    async addSession(session: WorkspaceSession) { return transaction(state => { state.sessions = state.sessions.filter(item => item.expiresAt > clock().toISOString()); if (state.sessions.length >= 50) throw new WorkspaceError("session_limit", 429); state.sessions.push(session); return { value: undefined, changed: true }; }); },
    async findSession(id: string) { return (await readDisk()).sessions.find(session => session.id === id && session.expiresAt > clock().toISOString()) ?? null; },
    async revokeSession(id: string) { return transaction(state => { const count = state.sessions.length; state.sessions = state.sessions.filter(session => session.id !== id); return { value: undefined, changed: count !== state.sessions.length }; }); },
    async markDelivery(id: string, result: { commitSha?: string; error?: string; configured?: boolean }) { return transaction(state => { const item = state.outbox.find(item => item.id === id); if (!item || item.state === "synced") return { value: undefined, changed: false }; item.attempts++; item.state = result.commitSha ? "synced" : result.error ? "error" : "pending"; item.commitSha = result.commitSha ?? null; item.error = result.error ?? null; const scout = state.scoutRequests.find(request => request.id === item.id); if (scout) { scout.status = result.commitSha ? "git_saved" : result.configured ? "git_pending" : "queued"; scout.commitSha = result.commitSha ?? null; } return { value: undefined, changed: true }; }); },
  };
  return api;
}
export type WorkspaceStore = ReturnType<typeof createWorkspaceStore>;
export function workspaceView(state: WorkspaceState, capabilities: WorkspaceCapabilities, now = new Date()): WorkspaceView {
  const key = moscowWeekKey(now), fact = state.facts.filter(fact => fact.weekKey === key).at(-1);
  const backups = state.outbox.filter(item => item.kind === "backup"), latest = backups.at(-1);
  const pending = state.outbox.some(item => item.state !== "synced"), failed = state.outbox.some(item => item.state === "error");
  const git = !capabilities.gitConfigured ? { state: "not_configured" as const, commitSha: null, message: "На сервере сохранено; GitHub не настроен." } : failed ? { state: "error" as const, commitSha: null, message: "Не все резервные копии или запросы Скауту отправлены в GitHub. Повтори отправку." } : latest && !pending ? { state: "synced" as const, commitSha: latest.commitSha, message: "Все отправки подтверждены; указан commit последней резервной копии." } : { state: "pending" as const, commitSha: null, message: "GitHub ожидает отправки." };
  return { version: 1, revision: state.revision, weekKey: key, counts: fact?.counts ?? emptyCounts(), countSource: fact?.source ?? "Измерения текущей недели ещё не внесены.", cards: state.cards, snapshots: state.snapshots, scoutRequests: state.scoutRequests, git, capabilities };
}
let defaultStore: WorkspaceStore | undefined;
export function getWorkspaceStore() { return defaultStore ??= createWorkspaceStore(); }
