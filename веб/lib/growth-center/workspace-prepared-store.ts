import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { preparedUnitSchema, preparedUnitDigest, preparedSha256, validatePreparedCatalog, type PreparedCatalog, type PreparedDetails, type PreparedCatalogStatus } from "./workspace-prepared";
import type { WorkspaceCard } from "./workspace-model";
import type { WorkspaceState } from "./workspace-store";

const entrySchema = z.object({ unit: preparedUnitSchema, digest: z.string().regex(/^[a-f0-9]{64}$/), appliedAt: z.string().datetime(), baselineFingerprint: z.string(), appliedFingerprint: z.string() }).strict();
const sidecarSchema = z.object({ version: z.literal(1), catalogId: z.string().nullable(), catalogDigest: z.string().nullable(), entries: z.array(entrySchema), history: z.array(entrySchema), activeCardIds: z.array(z.string()), conflicts: z.array(z.object({ unitId: z.string(), cardId: z.string(), reason: z.string() }).strict()) }).strict();
type Sidecar = z.infer<typeof sidecarSchema>;
export type PreparedViewData = { preparedDetails: Record<string, PreparedDetails>; activeCardIds: string[]; archivedCardCount: number; catalogStatus: PreparedCatalogStatus };
const views = new WeakMap<WorkspaceState, PreparedViewData>();
const empty = (): Sidecar => ({ version: 1, catalogId: null, catalogDigest: null, entries: [], history: [], activeCardIds: [], conflicts: [] });
const editable = (card: WorkspaceCard) => ({ title: card.title, format: card.format, channels: card.channels, stageIds: card.stageIds, briefPath: card.briefPath, script: card.script, shots: card.shots, origin: card.origin, departmentDecision: card.departmentDecision });
export const preparedCardFingerprint = (card: WorkspaceCard) => preparedSha256(editable(card));
export function preparedViewData(state: WorkspaceState): PreparedViewData {
  return views.get(state) ?? { preparedDetails: {}, activeCardIds: [], archivedCardCount: state.cards.length, catalogStatus: { state: "empty", catalogId: null, message: "Нет утверждённых материалов." } };
}
function attach(state: WorkspaceState, sidecar: Sidecar) {
  const details: Record<string, PreparedDetails> = {};
  for (const id of sidecar.activeCardIds) {
    const entry = sidecar.entries.find(entry => entry.unit.card.id === id), card = state.cards.find(card => card.id === id);
    if (!entry || !card) continue;
    details[id] = { brief: entry.unit.brief, provenance: entry.unit.provenance, localAdaptation: preparedCardFingerprint(card) !== entry.appliedFingerprint };
  }
  views.set(state, { preparedDetails: details, activeCardIds: sidecar.activeCardIds.filter(id => Boolean(details[id])), archivedCardCount: state.cards.length - Object.keys(details).length, catalogStatus: { state: sidecar.conflicts.length ? "conflict" : sidecar.activeCardIds.length ? "ready" : "empty", catalogId: sidecar.catalogId, message: sidecar.conflicts.length ? "Некоторые материалы не применены: сохранены изменения владельца." : sidecar.activeCardIds.length ? null : "Нет утверждённых материалов." } });
}
export function planPreparedReconciliation(state: WorkspaceState, sidecar: Sidecar, catalog: PreparedCatalog, seedCards: WorkspaceCard[], now: Date) {
  const next = structuredClone(sidecar), after = structuredClone(state);
  if (catalog.catalogId === null) { attach(state, sidecar); return { changed: false, state, sidecar, imported: 0 }; }
  if (sidecar.catalogDigest === catalog.contentSha256) { attach(state, sidecar); return { changed: false, state, sidecar, imported: 0 }; }
  next.conflicts = []; const active = new Set<string>(); let imported = 0;
  for (const unit of catalog.units) {
    const digest = preparedUnitDigest(unit), prior = next.entries.find(entry => entry.unit.unitId === unit.unitId), card = after.cards.find(card => card.id === unit.card.id);
    const sameVersion = [...next.entries, ...next.history].find(entry => entry.unit.unitId === unit.unitId && entry.unit.version === unit.version);
    if (sameVersion && sameVersion.digest !== digest) throw new Error("prepared_unit_version_hash_clash");
    if (prior && prior.unit.card.id !== unit.card.id) throw new Error("prepared_unit_identity_changed");
    if (prior && prior.unit.version === unit.version && prior.digest !== digest) throw new Error("prepared_unit_version_hash_clash");
    if (prior && prior.unit.version >= unit.version) { active.add(prior.unit.card.id); if (prior.unit.version > unit.version) next.conflicts.push({ unitId: unit.unitId, cardId: prior.unit.card.id, reason: "catalog_downgrade_preserved" }); continue; }
    const baseline = prior ? prior.appliedFingerprint : seedCards.find(seed => seed.id === unit.card.id) ? preparedCardFingerprint(seedCards.find(seed => seed.id === unit.card.id)!) : null;
    if (card && (baseline === null || preparedCardFingerprint(card) !== baseline)) {
      next.conflicts.push({ unitId: unit.unitId, cardId: unit.card.id, reason: "owner_edit_conflict" });
      if (prior) active.add(prior.unit.card.id);
      continue;
    }
    const replacement: WorkspaceCard = { ...unit.card, column: card?.column ?? "task", order: card?.order ?? after.cards.filter(card => card.column === "task").length, publication: card?.publication ?? null };
    if (card) Object.assign(card, replacement); else after.cards.push(replacement);
    if (prior) { next.history.push(prior); next.entries = next.entries.filter(entry => entry.unit.unitId !== unit.unitId); }
    next.entries.push({ unit, digest, appliedAt: now.toISOString(), baselineFingerprint: baseline ?? "new-card", appliedFingerprint: preparedCardFingerprint(replacement) });
    active.add(replacement.id); imported++;
  }
  // Downgrade/missing older catalogs never erase units already applied by a newer release.
  for (const entry of next.entries) if (!catalog.units.some(unit => unit.unitId === entry.unit.unitId)) active.add(entry.unit.card.id);
  next.activeCardIds = [...active]; next.catalogId = catalog.catalogId; next.catalogDigest = catalog.contentSha256;
  if (imported > 0) { after.revision++; after.updatedAt = now.toISOString(); }
  attach(after, next);
  return { changed: true, state: after, sidecar: next, imported };
}
export async function writePreparedAtomic(filename: string, value: unknown) {
  await fs.mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
  const temp = `${filename}.${randomUUID()}.tmp`, handle = await fs.open(temp, "wx", 0o600);
  try { await handle.writeFile(JSON.stringify(value)); await handle.sync(); } finally { await handle.close(); }
  try { await fs.rename(temp, filename); const parent = await fs.open(path.dirname(filename), "r"); try { await parent.sync(); } finally { await parent.close(); } }
  catch (error) { await fs.unlink(temp).catch(() => undefined); throw error; }
}
export function createPreparedReconciler(directory: string, catalogInput: unknown, seedCards: WorkspaceCard[], now: () => Date) {
  const folder = path.join(directory, "prepared"), metadata = path.join(folder, "state.json"), journal = path.join(folder, "transaction.json");
  async function readSidecar() {
    try {
      const value = sidecarSchema.parse(JSON.parse(await fs.readFile(metadata, "utf8")));
      if (new Set(value.entries.map(entry => entry.unit.unitId)).size !== value.entries.length || new Set(value.entries.map(entry => entry.unit.card.id)).size !== value.entries.length || new Set(value.activeCardIds).size !== value.activeCardIds.length) throw new Error("prepared_sidecar_identity_invalid");
      for (const entry of [...value.entries, ...value.history]) if (entry.digest !== preparedUnitDigest(entry.unit) || entry.appliedFingerprint !== preparedCardFingerprint(entry.unit.card)) throw new Error("prepared_sidecar_digest_invalid");
      if (value.activeCardIds.some(id => !value.entries.some(entry => entry.unit.card.id === id))) throw new Error("prepared_sidecar_reference_invalid");
      return value;
    }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty(); throw new Error("prepared_sidecar_invalid"); }
  }
  return {
    async recover(current: WorkspaceState, validateState: (value: unknown) => WorkspaceState, persistState: (state: WorkspaceState) => Promise<void>): Promise<WorkspaceState> {
      let raw;
      try { raw = JSON.parse(await fs.readFile(journal, "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return current; throw new Error("prepared_journal_invalid"); }
      const parsed = z.object({ version: z.literal(1), beforeExists: z.boolean(), beforeSha256: z.string(), afterSha256: z.string(), stateAfter: z.unknown(), metadataAfter: sidecarSchema }).strict().parse(raw);
      const after = validateState(parsed.stateAfter), currentHash = preparedSha256(current);
      const exists = await fs.access(path.join(directory, "state.json")).then(() => true, () => false);
      if (preparedSha256(after) !== parsed.afterSha256 || !(!parsed.beforeExists && !exists || [parsed.beforeSha256, parsed.afterSha256].includes(currentHash))) throw new Error("prepared_recovery_conflict");
      await writePreparedAtomic(metadata, parsed.metadataAfter); await persistState(after); await fs.unlink(journal);
      return after;
    },
    async reconcile(state: WorkspaceState, persistState: (state: WorkspaceState) => Promise<void>) {
      const checked = validatePreparedCatalog(catalogInput, now()); if (!checked.ok) throw new Error("prepared_catalog_invalid");
      const sidecar = await readSidecar(), plan = planPreparedReconciliation(state, sidecar, checked.data, seedCards, now());
      if (!plan.changed) return plan.state;
      await fs.mkdir(folder, { recursive: true, mode: 0o700 });
      await writePreparedAtomic(path.join(folder, `backup-${state.revision}-${randomUUID()}.json`), { state, metadata: sidecar });
      const beforeExists = await fs.access(path.join(directory, "state.json")).then(() => true, () => false);
      await writePreparedAtomic(journal, { version: 1, beforeExists, beforeSha256: preparedSha256(state), afterSha256: preparedSha256(plan.state), stateAfter: plan.state, metadataAfter: plan.sidecar });
      await writePreparedAtomic(metadata, plan.sidecar); await persistState(plan.state); await fs.unlink(journal);
      return plan.state;
    },
    async details(state: WorkspaceState) { attach(state, await readSidecar()); return preparedViewData(state); },
  };
}
export type PreparedReconciler = ReturnType<typeof createPreparedReconciler>;
