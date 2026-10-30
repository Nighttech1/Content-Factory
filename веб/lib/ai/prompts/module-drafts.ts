/**
 * Thin draft prompt helpers for Modules 1–3 (C-20).
 * Deterministic mock builders + system strings for future LLM path.
 * Version: module-drafts@v1
 */

export const MODULE_DRAFT_PROMPT_VERSION = "module-drafts@v1" as const;

/* ——— M1 carousel-engine ——— */

export const CAROUSEL_DRAFT_SYSTEM = `You are Designer Carousel for Vernatun Content Factory (Module 1).
Version: ${MODULE_DRAFT_PROMPT_VERSION}.
Write 3–8 carousel slides (1080×1350). Hook on cover; one idea per middle slide; CTA last.
RU primary + short HY labels. Output JSON slides only. No secrets.`;

export function buildCarouselDraftMock(topic: string, count: number) {
  const n = Math.min(8, Math.max(3, count));
  const t = topic.trim() || "untitled";
  return Array.from({ length: n }, (_, i) => {
    const slideType = i === 0 ? "cover" : i === n - 1 ? "cta" : "point";
    return {
      index: i,
      slideType,
      titleRu:
        slideType === "cover"
          ? t.slice(0, 72)
          : slideType === "cta"
            ? "Сохрани и поделись"
            : `Пункт ${i}`,
      bodyRu:
        slideType === "cover"
          ? `Черновик карусели: ${t}`
          : slideType === "cta"
            ? "Напиши в комментариях — что откликнулось."
            : `Ключевая мысль #${i} по теме «${t}».`,
    };
  });
}

/* ——— M2 aesthetic-graphics ——— */

export const GRAPHICS_DRAFT_SYSTEM = `You are Designer Graphics for Vernatun Content Factory (Module 2).
Version: ${MODULE_DRAFT_PROMPT_VERSION}.
Produce 1–3 quote/cheat/card payloads for a single square image.
Short punchy copy; brand tokens later. JSON only. No secrets.`;

export function buildGraphicsDraftMock(topic: string, cardCount = 1) {
  const n = Math.min(3, Math.max(1, cardCount));
  const t = topic.trim() || "untitled";
  return Array.from({ length: n }, (_, i) => ({
    index: i,
    kind: i === 0 ? "quote" : "cheat",
    titleRu: i === 0 ? t.slice(0, 60) : `Карточка ${i}`,
    bodyRu: `Эстетичный тезис #${i + 1} про «${t.slice(0, 80)}».`,
  }));
}

/* ——— M3 cartoon-reels ——— */

export const CARTOON_DRAFT_SYSTEM = `You are Designer Cartoon for Vernatun Content Factory (Module 3).
Version: ${MODULE_DRAFT_PROMPT_VERSION}.
Produce Remotion/Lottie-friendly scene beats + captions for 9:16.
Hook beat first; 3–6 scenes. JSON only. No secrets.`;

export function buildCartoonDraftMock(topic: string, beatCount = 4) {
  const n = Math.min(6, Math.max(3, beatCount));
  const t = topic.trim() || "untitled";
  return Array.from({ length: n }, (_, i) => ({
    index: i,
    beat: i === 0 ? "hook" : i === n - 1 ? "cta" : "point",
    captionRu:
      i === 0
        ? `Смотри: ${t.slice(0, 50)}`
        : i === n - 1
          ? "Подпишись — продолжение завтра"
          : `Сцена ${i}: ${t.slice(0, 60)}`,
    durationFrames: 45,
  }));
}
