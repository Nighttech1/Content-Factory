/** Synthetic test-only approvals. Never imported by application/canonical catalog. */
import { preparedCatalogDigest, preparedUnitDigest, approvePreparedCandidates, type CandidatePreparedUnit } from "../../lib/growth-center/workspace-prepared";
import type { WorkspaceCard } from "../../lib/growth-center/workspace-model";

export function syntheticPreparedCandidate(card: WorkspaceCard, version = 1): CandidatePreparedUnit {
  const unitId = `qa-${card.id}`, date = "2026-11-09", source = `https://example.org/qa-only/${card.id}`;
  const role = { CAR: "carousel-lead", REL: "reel-lead", TGP: "telegram-graphics-lead", ART: "scriptwriter-article", YTB: "scriptwriter-youtube" }[card.id.split("-")[2]] as CandidatePreparedUnit["provenance"]["department"]["role"];
  return { unitId, version, card: { ...structuredClone(card), title: `QA prepared ${version}: ${card.title}`, column: "task", script: `QA-only prepared script version ${version}`, shots: [{ order: 1, visual: "QA-only scene", spoken: "QA-only speech", onScreen: "QA-only text" }], origin: { url: source, evidence: "verified", observedAt: date, note: "Synthetic fixture, not real research." }, departmentDecision: { status: "approved", at: date, note: "Synthetic department decision for isolated QA only." }, publication: null }, brief: { goal: "QA-only goal", audience: "QA-only audience", barrier: "QA-only barrier", keyMessage: "QA-only key message", cta: "QA-only next step", deliverable: card.format, product: "QA-only club", plannedDate: null, requirements: ["Synthetic fixture only; never production content."] }, provenance: { unitId, unitVersion: version, scout: { reportId: "S-QA-ONLY", researchedAt: date, sourceCommit: "1".repeat(40) }, sources: [{ url: source, observedAt: date, note: "Synthetic public URL for QA; not fetched.", metrics: [] }], department: { role, decision: "approved", decidedAt: date, note: "Synthetic fixture; no actual department was invoked.", artifactSha256: "2".repeat(64) }, director: null } };
}
export function syntheticPreparedCatalog(cards: WorkspaceCard[], version = 1) {
  const units = cards.map(card => syntheticPreparedCandidate(card, version)), input = { version: 1 as const, catalogId: `qa-only-catalog-${version}`, sourceCommit: "1".repeat(40), units };
  const hash = preparedCatalogDigest(input);
  const result = approvePreparedCandidates({ ...input, approval: { role: "content-director", decision: "approved", reviewedAt: "2026-11-09", units: units.map(unit => ({ unitId: unit.unitId, version, sha256: preparedUnitDigest(unit) })), catalogSha256: hash } }, new Date("2026-11-10T12:00:00Z"));
  if (!result.ok) throw new Error(result.errors.join("; "));
  return result.data;
}
