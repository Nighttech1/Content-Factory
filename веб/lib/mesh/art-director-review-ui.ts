/**
 * FE helpers — Art Director review from draft.payload (Variant A).
 * Display only; never enqueues remake.
 */

import { ART_DIRECTOR_AGENT_ID } from "@/lib/studio/art-director-review";

export { ART_DIRECTOR_AGENT_ID };

export type ArtDirectorRemarkUi = {
  slideIndex: number;
  category: string;
  severity: "P0" | "P1" | "P2" | string;
  note: string;
};

export type ArtDirectorReviewUi = {
  verdict: "approve" | "remarks";
  summary: string;
  remarks: ArtDirectorRemarkUi[];
  sequenceNotes?: string;
  score?: number;
  model?: string;
  source?: string;
  reviewedAt?: string;
  remakeEnqueued?: false;
  draftId?: string;
  draftTitle?: string;
};

function asRemark(raw: unknown): ArtDirectorRemarkUi | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const note = typeof o.note === "string" ? o.note.trim() : "";
  if (!note) return null;
  const slideIndex =
    typeof o.slideIndex === "number" && Number.isFinite(o.slideIndex)
      ? o.slideIndex
      : 1;
  const severity =
    o.severity === "P0" || o.severity === "P1" || o.severity === "P2"
      ? o.severity
      : "P2";
  const category =
    typeof o.category === "string" && o.category.trim()
      ? o.category.trim()
      : "layout";
  return { slideIndex, category, severity, note };
}

/** Normalize payload.artDirectorReview or POST verdict body. */
export function parseArtDirectorReviewUi(
  raw: unknown,
  meta?: { draftId?: string; draftTitle?: string },
): ArtDirectorReviewUi | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const verdict = o.verdict === "approve" || o.verdict === "remarks"
    ? o.verdict
    : null;
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  if (!verdict || !summary) return null;

  const fromRemarks = Array.isArray(o.remarks) ? o.remarks : [];
  const fromIssues = Array.isArray(o.issues) ? o.issues : [];
  const remarks = [...fromRemarks, ...fromIssues]
    .map(asRemark)
    .filter((r): r is ArtDirectorRemarkUi => r !== null);

  return {
    verdict,
    summary,
    remarks: verdict === "approve" ? [] : remarks,
    sequenceNotes:
      typeof o.sequenceNotes === "string" && o.sequenceNotes.trim()
        ? o.sequenceNotes.trim()
        : undefined,
    score: typeof o.score === "number" ? o.score : undefined,
    model: typeof o.model === "string" ? o.model : undefined,
    source: typeof o.source === "string" ? o.source : undefined,
    reviewedAt: typeof o.reviewedAt === "string" ? o.reviewedAt : undefined,
    remakeEnqueued: false,
    draftId: meta?.draftId,
    draftTitle: meta?.draftTitle,
  };
}

/** True when remarks include P0/P1 — RED perimeter on mesh card. */
export function artDirectorReviewHasHardErrors(
  review: ArtDirectorReviewUi | null | undefined,
): boolean {
  if (!review) return false;
  if (review.verdict !== "remarks") return false;
  return review.remarks.some(
    (r) => r.severity === "P0" || r.severity === "P1",
  );
}

type DraftListRow = {
  id?: string;
  title?: string;
  updatedAt?: string;
  payload?: unknown;
};

/** Pick newest draft that has artDirectorReview on payload. */
export function pickLatestArtDirectorReviewFromDrafts(
  drafts: DraftListRow[],
): ArtDirectorReviewUi | null {
  const scored: { at: number; review: ArtDirectorReviewUi }[] = [];
  for (const d of drafts) {
    if (!d || typeof d !== "object") continue;
    const payload =
      d.payload && typeof d.payload === "object"
        ? (d.payload as Record<string, unknown>)
        : null;
    if (!payload?.artDirectorReview) continue;
    const review = parseArtDirectorReviewUi(payload.artDirectorReview, {
      draftId: typeof d.id === "string" ? d.id : undefined,
      draftTitle: typeof d.title === "string" ? d.title : undefined,
    });
    if (!review) continue;
    const at = d.updatedAt ? Date.parse(d.updatedAt) : 0;
    scored.push({ at: Number.isFinite(at) ? at : 0, review });
  }
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.at - a.at);
  return scored[0]!.review;
}
