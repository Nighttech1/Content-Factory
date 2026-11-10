import { createHash } from "node:crypto";
import { z } from "zod";
import { publicSourceUrlSchema, workspaceCardSchema } from "./workspace-model";

const text = z.string().trim().min(1).max(8000);
const identifier = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/);
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const commit = z.string().regex(/^[a-f0-9]{40}$/);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => { const d = new Date(value + "T00:00:00Z"); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value; });
const role = z.enum(["reel-lead", "carousel-lead", "telegram-graphics-lead", "scriptwriter-article", "scriptwriter-youtube"]);
export const preparedBriefSchema = z.object({ goal: text, audience: text, barrier: text, keyMessage: text, cta: text, deliverable: text, product: text, plannedDate: day.nullable(), requirements: z.array(text).min(1).max(50) }).strict();
export type PreparedBrief = z.infer<typeof preparedBriefSchema>;
const scoutSchema = z.object({ reportId: identifier, researchedAt: day, sourceCommit: commit }).strict();
const sourceSchema = z.object({ url: publicSourceUrlSchema, observedAt: day, note: text, metrics: z.array(z.object({ name: text, value: z.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER), unit: text, observedAt: day }).strict()).max(30) }).strict();
const departmentSchema = z.object({ role, decision: z.literal("approved"), decidedAt: day, note: text, artifactSha256: sha }).strict();
const directorSchema = z.object({ role: z.literal("content-director"), decision: z.literal("approved"), reviewedAt: day, catalogSha256: sha }).strict();
export const contentProvenanceSchema = z.object({ unitId: identifier, unitVersion: z.number().int().positive().max(100000), scout: scoutSchema, sources: z.array(sourceSchema).min(1).max(30), department: departmentSchema, director: directorSchema }).strict();
export type ContentProvenance = z.infer<typeof contentProvenanceSchema>;
export const preparedUnitSchema = z.object({ unitId: identifier, version: z.number().int().positive().max(100000), card: workspaceCardSchema, brief: preparedBriefSchema, provenance: contentProvenanceSchema }).strict();
export type PreparedUnit = z.infer<typeof preparedUnitSchema>;
export const candidatePreparedUnitSchema = preparedUnitSchema.omit({ provenance: true }).extend({ provenance: contentProvenanceSchema.omit({ director: true }).extend({ director: z.null().default(null) }).strict() }).strict();
export type CandidatePreparedUnit = z.infer<typeof candidatePreparedUnitSchema>;
export const directorApprovalSchema = z.object({ role: z.literal("content-director"), decision: z.literal("approved"), reviewedAt: day, units: z.array(z.object({ unitId: identifier, version: z.number().int().positive(), sha256: sha }).strict()).min(1).max(1000), catalogSha256: sha }).strict();
export type DirectorApproval = z.infer<typeof directorApprovalSchema>;
const approvedSchema = z.object({ version: z.literal(1), catalogId: identifier, sourceCommit: commit, contentSha256: sha, units: z.array(preparedUnitSchema).min(1).max(1000), approval: directorApprovalSchema }).strict();
export type ApprovedPreparedCatalog = z.infer<typeof approvedSchema>;
const emptySchema = z.object({ version: z.literal(1), catalogId: z.null(), sourceCommit: z.null(), contentSha256: z.null(), units: z.array(z.never()).length(0), approval: z.null() }).strict();
export type EmptyPreparedCatalog = z.infer<typeof emptySchema>;
export type PreparedCatalog = ApprovedPreparedCatalog | EmptyPreparedCatalog;
export type PreparedDetails = { brief: PreparedBrief; provenance: ContentProvenance; localAdaptation?: boolean };
export type PreparedCatalogStatus = { state: "empty" | "ready" | "conflict"; catalogId: string | null; message: string | null };

/** Canonical ordering is independent of JSON property order; external evidence hashes remain bound. */
export function canonicalPreparedJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalPreparedJson).join(",") + "]";
  const object = value as Record<string, unknown>;
  return "{" + Object.keys(object).sort().map(key => JSON.stringify(key) + ":" + canonicalPreparedJson(object[key])).join(",") + "}";
}
export function preparedSha256(value: unknown): string { return createHash("sha256").update(canonicalPreparedJson(value)).digest("hex"); }
export function preparedUnitDigest(unit: PreparedUnit | CandidatePreparedUnit): string {
  const { director: _director, ...provenance } = unit.provenance;
  void _director;
  return preparedSha256({ unitId: unit.unitId, version: unit.version, card: unit.card, brief: unit.brief, provenance });
}
export function preparedCatalogDigest(value: { version: 1; catalogId: string; sourceCommit: string; units: Array<PreparedUnit | CandidatePreparedUnit> }): string {
  return preparedSha256({ version: value.version, catalogId: value.catalogId, sourceCommit: value.sourceCommit, units: value.units.map(unit => ({ unitId: unit.unitId, version: unit.version, sha256: preparedUnitDigest(unit) })) });
}
function unitErrors(unit: PreparedUnit | CandidatePreparedUnit, today: string) {
  const errors: string[] = [], p = unit.provenance;
  if (unit.unitId !== p.unitId || unit.version !== p.unitVersion) errors.push(`${unit.unitId}: provenance identity mismatch.`);
  if (!/^V-\d{6}-(CAR|REL|ART|YTB|TGP)-\d{2,}$/.test(unit.card.id)) errors.push(`${unit.unitId}: invalid production ID.`);
  if (!unit.card.briefPath.includes(`/jobs/${unit.card.id}/`)) errors.push(`${unit.unitId}: brief path mismatch.`);
  if (unit.card.origin.evidence !== "verified" || !unit.card.origin.url || !unit.card.origin.observedAt || !p.sources.some(source => source.url === unit.card.origin.url && source.observedAt === unit.card.origin.observedAt)) errors.push(`${unit.unitId}: matching verified source URL/date required.`);
  if (unit.card.departmentDecision.status !== "approved" || unit.card.departmentDecision.at !== p.department.decidedAt || !unit.card.departmentDecision.note.trim()) errors.push(`${unit.unitId}: department decision mismatch.`);
  if (unit.card.publication !== null || unit.card.column !== "task") errors.push(`${unit.unitId}: prepared catalog cannot publish or move production work.`);
  const dates = [p.scout.researchedAt, p.department.decidedAt, ...p.sources.flatMap(source => [source.observedAt, ...source.metrics.map(metric => metric.observedAt)]), ...(p.director ? [p.director.reviewedAt] : [])];
  if (dates.some(date => date > today)) errors.push(`${unit.unitId}: future evidence date.`);
  if (p.department.decidedAt < p.scout.researchedAt || p.director && p.director.reviewedAt < p.department.decidedAt) errors.push(`${unit.unitId}: provenance chronology mismatch.`);
  const suffix = unit.card.id.split("-")[2];
  const expected: Record<string, string> = { CAR: "carousel-lead", REL: "reel-lead", TGP: "telegram-graphics-lead", ART: "scriptwriter-article", YTB: "scriptwriter-youtube" };
  if (expected[suffix] !== p.department.role) errors.push(`${unit.unitId}: wrong department head for format ID.`);
  return errors;
}
export function validatePreparedCandidate(input: unknown, now = new Date()): { ok: true; data: CandidatePreparedUnit } | { ok: false; errors: string[] } {
  const parsed = candidatePreparedUnitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`) };
  const errors = unitErrors(parsed.data, new Date(now.getTime() + 3 * 3600000).toISOString().slice(0, 10));
  return errors.length ? { ok: false, errors } : { ok: true, data: parsed.data };
}
export function validatePreparedCatalog(input: unknown, now = new Date()): { ok: true; data: PreparedCatalog } | { ok: false; errors: string[] } {
  const empty = emptySchema.safeParse(input); if (empty.success) return { ok: true, data: empty.data };
  const parsed = approvedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`) };
  const catalog = parsed.data, today = new Date(now.getTime() + 3 * 3600000).toISOString().slice(0, 10), errors: string[] = [];
  if (new Set(catalog.units.map(unit => unit.unitId)).size !== catalog.units.length || new Set(catalog.units.map(unit => unit.card.id)).size !== catalog.units.length) errors.push("Duplicate unit/card IDs.");
  if (catalog.contentSha256 !== preparedCatalogDigest(catalog) || catalog.approval.catalogSha256 !== catalog.contentSha256) errors.push("Catalog digest mismatch.");
  if (catalog.approval.reviewedAt > today || catalog.approval.units.length !== catalog.units.length || new Set(catalog.approval.units.map(unit => unit.unitId)).size !== catalog.units.length) errors.push("Director approval coverage/date mismatch.");
  for (const unit of catalog.units) {
    errors.push(...unitErrors(unit, today));
    const proof = catalog.approval.units.find(proof => proof.unitId === unit.unitId);
    if (!proof || proof.version !== unit.version || proof.sha256 !== preparedUnitDigest(unit)) errors.push(`${unit.unitId}: approval unit digest/version mismatch.`);
    if (unit.provenance.scout.sourceCommit !== catalog.sourceCommit || unit.provenance.director.reviewedAt !== catalog.approval.reviewedAt || unit.provenance.director.catalogSha256 !== catalog.contentSha256) errors.push(`${unit.unitId}: source/director provenance mismatch.`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, data: catalog };
}
/** Preview never manufactures approval. The director artifact must already exist. */
export function approvePreparedCandidates(input: { catalogId: string; sourceCommit: string; units: unknown[]; approval: unknown }, now = new Date()): { ok: true; data: ApprovedPreparedCatalog } | { ok: false; errors: string[] } {
  const units: CandidatePreparedUnit[] = [];
  for (const raw of input.units) { const result = validatePreparedCandidate(raw, now); if (!result.ok) return result; units.push(result.data); }
  const approval = directorApprovalSchema.safeParse(input.approval); if (!approval.success) return { ok: false, errors: ["Explicit director approval artifact required."] };
  const contentSha256 = preparedCatalogDigest({ version: 1, catalogId: input.catalogId, sourceCommit: input.sourceCommit, units });
  const candidate = { version: 1, catalogId: input.catalogId, sourceCommit: input.sourceCommit, contentSha256, units: units.map(unit => ({ ...unit, provenance: { ...unit.provenance, director: { role: "content-director", decision: "approved", reviewedAt: approval.data.reviewedAt, catalogSha256: contentSha256 } } })), approval: approval.data };
  const result = validatePreparedCatalog(candidate, now);
  if (!result.ok) return result;
  return result.data.catalogId === null ? { ok: false, errors: ["Nonempty approved catalog required."] } : { ok: true, data: result.data };
}
export function getPreparedDetails(details: Record<string, PreparedDetails>, cardId: string): PreparedDetails | null { return details[cardId] ?? null; }
