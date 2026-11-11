import { z } from "zod";
import { WORKSPACE_STAGE_IDS, publicSourceUrlSchema, workspaceCardSchema, type WorkspaceCard } from "./workspace-model";

const text = z.string().min(1).max(8000);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => { const d = new Date(s + "T12:00:00Z"); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s; });
export const editorialUnitSchema = z.object({
  id: z.string().regex(/^V-2026(?:11|12)-(?:REL|CAR|ART|YTB|TGP)-\d{2,}$/), week: z.number().int().min(1).max(8), date: day, time: z.string().regex(/^\d{2}:\d{2}$/), timezone: z.literal("Europe/Moscow"),
  format: z.enum(["REL", "CAR", "ART", "YTB", "TGP"]), format_name: text, stage: z.number().int().min(1).max(6), stage_name: text, subtype: text, title: text, hook: text, outline: z.array(text).min(1).max(100), cta: text, assets: text, product: text, channels: z.array(text).min(1).max(20),
  series_id: z.string().max(200).nullable(), episode: z.number().int().min(1).max(100).nullable(), idea_origin: text, reference_url: publicSourceUrlSchema.nullable(), reference_status: text, status: z.literal("brief_ready_not_started"), publication_url: z.null(), owner: text, brief_path: z.string().max(500), metric: text, shooting_date: day.nullable(),
}).strict();
export const editorialPlanSchema = z.object({
  sync_version: z.literal(1), sequence: z.number().int().positive(), kind: z.literal("editorial_publication_plan_NOT_runtime_prepared_catalog"), revision: text, timezone: z.literal("Europe/Moscow"),
  units: z.array(editorialUnitSchema).min(1).max(200),
  weeks: z.array(z.object({ week: z.number().int().min(1).max(8), start: day, end: day, total: z.number().int().nonnegative(), upper: z.number().int().nonnegative(), lower: z.number().int().nonnegative(), formats: z.record(z.string(), z.number().int().nonnegative()), owner_minutes: z.number().int().min(0).max(180) }).strict()).length(8),
  report_markdown: z.string().min(100).max(200000),
  shooting_schedule: z.object({ timezone: z.literal("Europe/Moscow"), days: z.tuple([z.literal("вторник"), z.literal("суббота")]), note: text }).strict(),
}).passthrough().superRefine((p, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });
  if (new Set(p.units.map(u => u.id)).size !== p.units.length || new Set(p.weeks.map(w => w.week)).size !== 8) fail("Duplicate identities");
  for (const u of p.units) {
    const w = p.weeks.find(w => w.week === u.week);
    if (!w || u.date < w.start || u.date > w.end || u.date < "2026-11-11" || u.date > "2026-12-31") fail("Unit date/week mismatch");
    if (!u.id.includes("-" + u.format + "-") || !u.brief_path.endsWith(`/jobs/${u.id}/00-brief.md`)) fail("Unit identity mismatch");
    if (u.format === "REL") {
      if (!u.shooting_date || u.shooting_date > u.date || ![2, 6].includes(new Date(u.shooting_date + "T12:00:00Z").getUTCDay())) fail("Reels must be shot on Tuesday or Saturday before publication");
    } else if (u.shooting_date !== null) fail("Non-reel shooting date");
  }
  for (const w of p.weeks) {
    const us = p.units.filter(u => u.week === w.week), upper = us.filter(u => u.stage <= 2).length;
    if (us.length !== w.total || upper !== w.upper || us.length - upper !== w.lower || Object.values(w.formats).reduce((a, b) => a + b, 0) !== w.total) fail("Week totals mismatch");
    for (const f of ["REL", "CAR", "ART", "YTB", "TGP"]) if (us.filter(u => u.format === f).length !== (w.formats[f] || 0)) fail("Format total mismatch");
    if (w.week <= 6 && upper * 5 !== us.length * 4) fail("First six weeks must retain 80/20");
  }
});
export type EditorialPlan = z.infer<typeof editorialPlanSchema>;
export type EditorialUnit = z.infer<typeof editorialUnitSchema>;
export type EditorialView = { plan: EditorialPlan; status: "synced" | "bundled" | "stale"; checkedAt: string | null; appliedAt: string | null; digest: string; message: string | null; conflicts: string[] };
export function editorialCard(u: EditorialUnit, order: number): WorkspaceCard {
  return workspaceCardSchema.parse({ id: u.id, title: u.title, format: u.format_name, channels: u.channels, stageIds: [WORKSPACE_STAGE_IDS[u.stage - 1]], column: "task", order, briefPath: u.brief_path, script: `${u.hook}\n\n${u.outline.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nПризыв: ${u.cta}\nИсходники: ${u.assets}\nПроверяем: ${u.metric}`, shots: [], origin: { url: u.reference_url, evidence: "unverified", observedAt: null, note: u.reference_status }, departmentDecision: { status: "pending", note: "Директорский план. Решение отдела и публикационный апрув ещё не получены.", at: null }, publication: null });
}
