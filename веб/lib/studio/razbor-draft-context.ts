/**
 * C-razbor-draft-edit — serialize existing Черновик for agent-chat context.
 * FE injects into systemPrompt + passes as carouselJson (loose draft shape).
 */

import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";

/** Loose draft carousel payload for LLM context (not strict Create handoff schema). */
export type RazborDraftCarouselContext = {
  draftId: string;
  title: string;
  scenario?: string;
  sourceCompetitorId: string;
  slideCount: number;
  slides: Array<{
    slide_number: number;
    id: string;
    imageUrl: string;
    primary_copy: string;
    visual_prompt: string;
    swipe_trigger: string;
  }>;
  caption: string;
  hashtags: string[];
  requested_slide_count: number;
  contentType: "carousel";
};

export function isRazborDraftEditMode(
  previewDraft?: CarouselDraft | null,
): boolean {
  if (!previewDraft?.id?.trim()) return false;
  return true;
}

export function buildRazborDraftCarouselContext(
  draft: CarouselDraft,
): RazborDraftCarouselContext {
  const slides = draft.slides.map((s, i) => ({
    slide_number: i + 1,
    id: s.id,
    imageUrl: s.imageUrl,
    primary_copy: s.caption?.trim() || `Слайд ${i + 1}`,
    visual_prompt: s.imageUrl
      ? `Existing slide image: ${s.imageUrl}`
      : `Slide ${i + 1} of draft ${draft.id}`,
    swipe_trigger: "Discuss/edit existing draft slide — do not invent new N",
  }));

  return {
    draftId: draft.id,
    title: draft.title,
    scenario: draft.scenario,
    sourceCompetitorId: draft.sourceCompetitorId,
    slideCount: slides.length,
    slides,
    caption: draft.scenario?.trim() || draft.title,
    hashtags: [],
    requested_slide_count: Math.max(1, slides.length),
    contentType: "carousel",
  };
}

/** System overlay so Scriptwriter/Designer see the live draft without inventing a new one. */
export function buildRazborDraftEditSystemOverlay(
  draft: CarouselDraft,
): string {
  const ctx = buildRazborDraftCarouselContext(draft);
  return [
    "## Existing carousel draft (edit session)",
    `draft.id = ${ctx.draftId} — UPSERT only; never mint a new Черновик id.`,
    `title: ${ctx.title}`,
    ctx.scenario ? `scenario:\n${ctx.scenario}` : "scenario: (empty)",
    "",
    "### carouselJson / slides",
    JSON.stringify(ctx, null, 2),
    "",
    "User is editing this draft. Keep slide URLs/context; propose edits against this JSON.",
  ].join("\n");
}
