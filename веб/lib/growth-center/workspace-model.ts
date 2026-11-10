import { z } from "zod";

export const WORKSPACE_STAGE_IDS = ["awareness", "desire", "registration", "attendance", "return", "membership"] as const;
export const BOARD_COLUMNS = ["task", "shooting", "development", "approval", "release"] as const;
export type WorkspaceStageId = typeof WORKSPACE_STAGE_IDS[number];
export type BoardColumn = typeof BOARD_COLUMNS[number];
const text = z.string().trim().min(1).max(4000);
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const url = z.string().max(2000).refine(value => {
  try {
    const u = new URL(value), host = u.hostname.toLowerCase();
    if (!["https:", "http:"].includes(u.protocol) || u.username || u.password || !host.includes(".") || /(?:^|\.)(?:localhost|local|internal|test)$/.test(host) || host.includes(":")) return false;
    if (/^\d+(?:\.\d+){3}$/.test(host)) {
      const [a, b, c] = host.split(".").map(Number);
      if (a === 0 || a === 10 || a === 127 || a >= 224 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0 || b === 88 && c === 99) || a === 198 && (b === 18 || b === 19 || b === 51 && c === 100) || a === 203 && b === 0 && c === 113) return false;
    }
    return true;
  } catch { return false; }
}, "Нужна публичная HTTP(S) ссылка без логина и пароля.");
export const countsSchema = z.object({ awareness: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(), desire: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(), registration: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(), attendance: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(), return: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(), membership: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable() }).strict();
export type Counts = z.infer<typeof countsSchema>;
export const emptyCounts = (): Counts => ({ awareness: null, desire: null, registration: null, attendance: null, return: null, membership: null });
export const shotsSchema = z.array(z.object({ order: z.number().int().nonnegative().max(1000), visual: text, spoken: z.string().max(4000), onScreen: z.string().max(2000) }).strict()).max(100);
export const originSchema = z.object({ url: url.nullable(), evidence: z.enum(["unverified", "verified"]), observedAt: date.nullable(), note: z.string().max(4000) }).strict().refine(value => value.evidence !== "verified" || Boolean(value.url && value.observedAt && value.note.trim()), "Проверенный источник требует ссылку, дату и пояснение.");
export const departmentDecisionSchema = z.object({ status: z.enum(["pending", "approved", "remarks"]), note: z.string().max(4000), at: date.nullable() }).strict();
export const workspaceCardSchema = z.object({ id, title: text, format: text, channels: z.array(text).min(1).max(20), stageIds: z.array(z.enum(WORKSPACE_STAGE_IDS)).min(1).max(6), column: z.enum(BOARD_COLUMNS), order: z.number().int().nonnegative(), briefPath: z.string().regex(/^projects\/vernatun\/departments\/[a-z-]+\/jobs\/V-\d{6}-[A-Z]+-\d{2,}\/00-brief\.md$/), script: z.string().max(30000).nullable(), shots: shotsSchema, origin: originSchema, departmentDecision: departmentDecisionSchema, publication: z.object({ url, publishedAt: date }).strict().nullable() }).strict();
export type WorkspaceCard = z.infer<typeof workspaceCardSchema>;
export const weekSnapshotSchema = z.object({ weekKey: date, cutoffAt: z.string().datetime(), version: z.number().int().positive(), counts: countsSchema, source: text, capturedAt: z.string().datetime(), kind: z.enum(["freeze", "correction"]), supersedesVersion: z.number().int().positive().nullable(), reason: text.nullable() }).strict();
export type WeekSnapshot = z.infer<typeof weekSnapshotSchema>;
export type GitBackupStatus = { state: "not_configured" | "pending" | "synced" | "error"; commitSha: string | null; message: string | null };
export type ScoutRequest = { id: string; cardId: string; status: "queued" | "git_pending" | "git_saved"; createdAt: string; gitPath: string; commitSha: string | null };
export type WorkspaceCapabilities = { authConfigured: boolean; authenticated: boolean; writeEnabled: boolean; gitConfigured: boolean; schedulerEnabled: boolean; csrfToken: string | null };
export type WorkspaceView = { version: 1; revision: number; weekKey: string; counts: Counts; countSource: string; cards: WorkspaceCard[]; snapshots: WeekSnapshot[]; scoutRequests: ScoutRequest[]; git: GitBackupStatus; capabilities: WorkspaceCapabilities; commandReceipt?: { requestId: string; appliedRevision: number; replayed: boolean; scoutRequestId?: string } };
const base = z.object({ expectedRevision: z.number().int().nonnegative(), requestId: id });
const patch = z.object({ title: text.optional(), script: z.string().max(30000).nullable().optional(), shots: shotsSchema.optional(), origin: originSchema.optional(), departmentDecision: departmentDecisionSchema.optional(), publication: z.object({ url, publishedAt: date }).strict().nullable().optional() }).strict().refine(value => Object.keys(value).length > 0, "Пустое изменение.");
export const workspaceCommandSchema = z.discriminatedUnion("type", [
  base.extend({ type: z.literal("save_counts"), counts: countsSchema, source: text }).strict(),
  base.extend({ type: z.literal("move_card"), cardId: id, column: z.enum(BOARD_COLUMNS), beforeCardId: id.nullable() }).strict(),
  base.extend({ type: z.literal("update_card"), cardId: id, patch }).strict(),
  base.extend({ type: z.literal("request_scout"), cardId: id }).strict(),
  base.extend({ type: z.literal("correct_snapshot"), weekKey: date, counts: countsSchema, source: text, reason: text }).strict(),
  base.extend({ type: z.literal("retry_git") }).strict(),
]);
export type WorkspaceCommand = z.infer<typeof workspaceCommandSchema>;
export function validateWorkspaceCommand(input: unknown): { ok: true; data: WorkspaceCommand } | { ok: false; errors: string[] } {
  const result = workspaceCommandSchema.safeParse(input);
  return result.success ? { ok: true, data: result.data } : { ok: false, errors: result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`) };
}
export function getStageCards(view: WorkspaceView, stage: WorkspaceStageId): WorkspaceCard[] {
  return view.cards.filter(card => card.stageIds.includes(stage)).sort((a, b) => BOARD_COLUMNS.indexOf(a.column) - BOARD_COLUMNS.indexOf(b.column) || a.order - b.order || a.id.localeCompare(b.id));
}
export function getWeeklySeries(view: WorkspaceView, stage: WorkspaceStageId) {
  const latest = new Map<string, WeekSnapshot>();
  for (const snapshot of view.snapshots) if (!latest.has(snapshot.weekKey) || latest.get(snapshot.weekKey)!.version < snapshot.version) latest.set(snapshot.weekKey, snapshot);
  return [...latest.values()].sort((a, b) => a.weekKey.localeCompare(b.weekKey)).map(snapshot => ({ weekKey: snapshot.weekKey, cutoffAt: snapshot.cutoffAt, value: snapshot.counts[stage], version: snapshot.version, kind: snapshot.kind, source: snapshot.source, capturedAt: snapshot.capturedAt }));
}

/** Moscow currently has a fixed UTC+03 offset; server timestamps are persisted as UTC. */
export function moscowWeekKey(now: Date): string {
  const local = new Date(now.getTime() + 3 * 3600000);
  const day = (local.getUTCDay() + 6) % 7;
  local.setUTCDate(local.getUTCDate() - day);
  return local.toISOString().slice(0, 10);
}
export function weekCutoff(weekKey: string): string { return new Date(Date.parse(weekKey + "T00:00:00+03:00") + 6 * 86400000 + (23 * 60 + 59) * 60000).toISOString(); }
export function nextWeekKey(weekKey: string): string { return new Date(Date.parse(weekKey + "T12:00:00Z") + 7 * 86400000).toISOString().slice(0, 10); }
