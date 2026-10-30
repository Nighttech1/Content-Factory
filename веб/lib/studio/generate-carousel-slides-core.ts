/**
 * C-154 / C-carousel-agents — shared carousel slide image generation.
 * Used by generate-slides route and agent-chat draw mode.
 * Never log API keys.
 */

import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  generateAggregatorImage,
} from "@/lib/llm/aggregator-images";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";
import {
  excerptDesignForPrompt,
  excerptPresetForPrompt,
  readSyncedActiveDesign,
} from "@/lib/settings/design-active-server";
import type { DesignPresetFile } from "@/lib/settings/design-preset";
import { createCarouselErrorMessage } from "@/lib/studio/agent-chat-soft-ack";
import { downloadSlideUrlsToWaveArtifacts } from "@/lib/studio/wave-visual-artifacts";

/** Absolute safety bounds — do not invent N when JSON/spec provides length in range. */
export const CAROUSEL_SLIDE_COUNT_MIN = 2;
export const CAROUSEL_SLIDE_COUNT_MAX = 12;

export type CarouselSlideSpec = {
  caption: string;
  visual_prompt?: string;
  /**
   * Phase 6 correct — Designer-translated prompt (type-on-PNG).
   * When set, used as the image API prompt verbatim (no invent / no bg-only).
   */
  image_prompt?: string;
};

export type GenerateCarouselSlideOut = {
  id: string;
  caption: string;
  imageUrl: string;
};

export type GenerateCarouselSlidesInput = {
  competitorId: string;
  title: string;
  captions?: string[];
  /** Per-slide visual prompts (aligned with captions / slidesSpec). */
  visualPrompts?: string[];
  /**
   * Explicit per-slide spec from validated carousel JSON.
   * When set, length = slidesSpec.length (clamped only to absolute 2–12 safety).
   */
  slidesSpec?: CarouselSlideSpec[];
  slideCount?: number;
  model?: string;
  /** Last agreed Designer description — folded into image prompts. */
  description?: string;
  /**
   * Active Settings DESIGN.md (Embla slot). Folded into image prompts.
   * Prefer client sync via POST /api/settings/design-active when omitted.
   */
  designMarkdown?: string;
  /** Active DesignPresetFile — CSS var line for prompts + artifact folder name. */
  presetFile?: DesignPresetFile | null;
  /** Create carousel: no picsum mock success. */
  noMock?: boolean;
  /**
   * Copy/download live slide images into
   * generatedMedia/wave-visual-deconstructor/{preset}/ (budget ≤40).
   */
  persistToWaveArtifacts?: boolean;
};

export type GenerateCarouselSlidesResult =
  | {
      ok: true;
      sourceMode: "live" | "mock";
      model: string;
      slides: GenerateCarouselSlideOut[];
      artifactDir?: string;
      budget?: { count: number; max: number };
    }
  | {
      ok: false;
      source: "error";
      error: { code: string; message: string };
    };

/**
 * Clamp to absolute safety [2, 12].
 * When `explicit` is in range, returns exact value (no invent-default 4).
 * When `explicit` is missing/NaN → `fallback` (Razbor legacy default 4 only).
 */
export function clampSlideCount(
  explicit: unknown,
  fallback: number | null = 4,
): number {
  const num = typeof explicit === "number" ? explicit : Number(explicit);
  if (!Number.isFinite(num)) {
    if (fallback == null || !Number.isFinite(fallback)) {
      return CAROUSEL_SLIDE_COUNT_MIN;
    }
    return Math.min(
      CAROUSEL_SLIDE_COUNT_MAX,
      Math.max(CAROUSEL_SLIDE_COUNT_MIN, Math.round(fallback)),
    );
  }
  return Math.min(
    CAROUSEL_SLIDE_COUNT_MAX,
    Math.max(CAROUSEL_SLIDE_COUNT_MIN, Math.round(num)),
  );
}

function picsum(seed: string, w = 720, h = 1200): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function buildCaptions(
  title: string,
  captions: string[] | undefined,
  count: number,
  description?: string,
): string[] {
  const cleaned = (captions ?? [])
    .map((c) => (typeof c === "string" ? c.trim() : ""))
    .filter(Boolean);
  if (cleaned.length >= count) return cleaned.slice(0, count);

  const fromDesc = (description ?? "")
    .split(/\n+/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 8)
    .slice(0, count);

  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    if (cleaned[i]) {
      out.push(cleaned[i]!);
      continue;
    }
    if (fromDesc[i]) {
      out.push(fromDesc[i]!);
      continue;
    }
    if (i === 0) out.push(`Cover · ${title}`);
    else if (i === count - 1) out.push(`Finale · Vernatun CTA · ${title}`);
    else out.push(`Beat ${i} · ${title}`);
  }
  return out;
}

function buildPrompt(
  title: string,
  caption: string,
  index: number,
  total: number,
  description?: string,
  visualPrompt?: string,
  designExcerpt?: string,
  /** Phase 6 correct — full type-on-PNG prompt from Designer */
  imagePrompt?: string,
): string {
  const baked = imagePrompt?.trim();
  if (baked) {
    // Correct pipeline: Designer image_prompt is SoT — do not invent / strip text.
    return baked;
  }

  const designLine = designExcerpt?.trim()
    ? `Active DESIGN.md tokens (follow): ${designExcerpt.trim()}`
    : `Brand: Vernatun Armenian club — dark luxury night atmosphere, warm cognac and soft gold accents, glass reflections.`;

  const vp = visualPrompt?.trim();
  if (vp) {
    return [
      `Premium Instagram carousel background only, vertical 4:5 portrait (1080×1350).`,
      designLine,
      `No readable text, no typography overlays, no UI chrome, no watermarks, no logos of other brands.`,
      `Visual brief: ${vp}`,
      `Topic context: ${title}.`,
      `Slide ${index + 1} of ${total}.`,
    ].join(" ");
  }

  const role =
    index === 0
      ? "cover hook slide"
      : index === total - 1
        ? "finale CTA slide"
        : `value slide ${index + 1}`;
  const lines = [
    `Premium Instagram carousel ${role}, vertical 4:5 portrait.`,
    designLine,
    `Topic: ${title}.`,
    `Slide text intent (do not render as tiny unreadable UI chrome): ${caption}.`,
    `Cinematic lighting, elegant club interior or terrace mood, high-end editorial photo, no watermarks, no logos of other brands.`,
  ];
  const agreed = description?.trim();
  if (agreed) {
    lines.push(`Agreed carousel description (follow closely): ${agreed}`);
  }
  return lines.join(" ");
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]!, i);
    }
  }
  const n = Math.min(Math.max(1, concurrency), items.length || 1);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

function mockSlides(
  competitorId: string,
  captions: string[],
  model: string,
): Extract<GenerateCarouselSlidesResult, { ok: true }> {
  const slides = captions.map((caption, i) => ({
    id: `ours-${competitorId}-slide-${i}`,
    caption,
    imageUrl: picsum(`cf-c154-${competitorId}-${i}`, 720, 1200),
  }));
  return { ok: true, sourceMode: "mock", model, slides };
}

function errorResult(code: string): Extract<GenerateCarouselSlidesResult, { ok: false }> {
  return {
    ok: false,
    source: "error",
    error: { code, message: createCarouselErrorMessage(code) },
  };
}

function resolveSpecs(
  input: GenerateCarouselSlidesInput,
  title: string,
  description: string,
): {
  captions: string[];
  visualPrompts: (string | undefined)[];
  imagePrompts: (string | undefined)[];
} {
  const slidesSpec = Array.isArray(input.slidesSpec) ? input.slidesSpec : null;

  if (slidesSpec && slidesSpec.length > 0) {
    const count = clampSlideCount(slidesSpec.length, null);
    const sliced = slidesSpec.slice(0, count);
    // If JSON length was clamped up (rare <2), pad from last
    while (sliced.length < count) {
      const last = sliced[sliced.length - 1] ?? {
        caption: title,
        visual_prompt: undefined,
      };
      sliced.push({ ...last });
    }
    return {
      captions: sliced.map((s, i) =>
        (s.caption?.trim() || `Beat ${i + 1} · ${title}`).trim(),
      ),
      visualPrompts: sliced.map((s) =>
        typeof s.visual_prompt === "string" ? s.visual_prompt.trim() : undefined,
      ),
      imagePrompts: sliced.map((s) =>
        typeof s.image_prompt === "string" && s.image_prompt.trim()
          ? s.image_prompt.trim()
          : undefined,
      ),
    };
  }

  const hasExplicitCount =
    typeof input.slideCount === "number" && Number.isFinite(input.slideCount);
  const hasCaptions =
    Array.isArray(input.captions) && input.captions.length > 0;

  const slideCount = clampSlideCount(
    hasExplicitCount
      ? input.slideCount
      : hasCaptions
        ? input.captions!.length
        : undefined,
    // Invent default 4 only when neither count nor captions nor slidesSpec
    4,
  );

  const captions = buildCaptions(
    title,
    Array.isArray(input.captions) ? input.captions : undefined,
    slideCount,
    description || undefined,
  );

  const visualPrompts = captions.map((_, i) => {
    const vp = input.visualPrompts?.[i];
    return typeof vp === "string" && vp.trim() ? vp.trim() : undefined;
  });

  return {
    captions,
    visualPrompts,
    imagePrompts: captions.map(() => undefined),
  };
}

/**
 * Generate carousel slide images. Razbor default soft-mocks; Create/noMock → error.
 */
export async function runGenerateCarouselSlides(
  input: GenerateCarouselSlidesInput,
): Promise<GenerateCarouselSlidesResult> {
  const competitorId = input.competitorId.trim() || "create-carousel";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  const title =
    input.title.trim() ||
    (description ? description.slice(0, 80).replace(/\s+/g, " ") : "");
  if (!title) {
    return errorResult("invalid_request");
  }

  const { captions, visualPrompts, imagePrompts } = resolveSpecs(
    input,
    title,
    description,
  );
  const model =
    (typeof input.model === "string" && input.model.trim()) ||
    process.env.CAROUSEL_IMAGE_MODEL?.trim() ||
    DEFAULT_CAROUSEL_IMAGE_MODEL;
  const noMock = Boolean(input.noMock);
  let preset: DesignPresetFile | null = input.presetFile ?? null;
  if (!preset) {
    const synced = await readSyncedActiveDesign();
    preset = synced?.presetFile ?? null;
  }
  const designExcerpt = excerptDesignForPrompt(
    typeof input.designMarkdown === "string" ? input.designMarkdown : "",
  );
  const presetExcerpt = excerptPresetForPrompt(preset);
  const combinedDesign = [presetExcerpt, designExcerpt]
    .filter(Boolean)
    .join(" ");

  if (!resolveAggregatorEnv()) {
    if (noMock) return errorResult("missing_key");
    return mockSlides(competitorId, captions, model);
  }

  const prompts = captions.map((caption, i) =>
    buildPrompt(
      title,
      caption,
      i,
      captions.length,
      description || undefined,
      visualPrompts[i],
      combinedDesign || undefined,
      imagePrompts[i],
    ),
  );

  const urls = await mapPool(prompts, 2, async (prompt) =>
    generateAggregatorImage({ prompt, model }),
  );

  const liveCount = urls.filter((u) => typeof u === "string" && u).length;
  if (liveCount === 0) {
    if (noMock) return errorResult("generate_slides_fail");
    return mockSlides(competitorId, captions, model);
  }

  const shouldPersist =
    input.persistToWaveArtifacts === true ||
    (input.persistToWaveArtifacts !== false &&
      process.env.WAVE_VISUAL_COPY_ARTIFACTS === "1") ||
    (noMock && process.env.WAVE_VISUAL_COPY_ARTIFACTS !== "0");

  async function maybePersist(
    slideList: GenerateCarouselSlideOut[],
  ): Promise<{
    artifactDir?: string;
    budget?: { count: number; max: number };
  }> {
    if (!shouldPersist || slideList.length < 1) return {};
    const presetId = preset?.preset ?? "dark_editorial";
    const saved = await downloadSlideUrlsToWaveArtifacts({
      presetId,
      imageUrls: slideList.map((s) => s.imageUrl),
    });
    if (saved.stopped && saved.written.length < 1) {
      return {
        budget: { count: saved.budget.count, max: saved.budget.max },
      };
    }
    return {
      artifactDir: saved.dir,
      budget: { count: saved.budget.count, max: saved.budget.max },
    };
  }

  if (noMock) {
    const liveSlides: GenerateCarouselSlideOut[] = [];
    captions.forEach((caption, i) => {
      const imageUrl = urls[i];
      if (typeof imageUrl === "string" && imageUrl) {
        liveSlides.push({
          id: `ours-${competitorId}-slide-${i}`,
          caption,
          imageUrl,
        });
      }
    });
    if (liveSlides.length < 2) {
      return errorResult("generate_slides_fail");
    }
    const extra = await maybePersist(liveSlides);
    return {
      ok: true,
      sourceMode: "live",
      model,
      slides: liveSlides,
      ...extra,
    };
  }

  const slides: GenerateCarouselSlideOut[] = captions.map((caption, i) => ({
    id: `ours-${competitorId}-slide-${i}`,
    caption,
    imageUrl:
      urls[i] ??
      picsum(`cf-c154-partial-${competitorId}-${i}`, 720, 1200),
  }));

  const extra = await maybePersist(
    slides.filter((s) => !s.imageUrl.includes("picsum.photos")),
  );

  return {
    ok: true,
    sourceMode: "live",
    model,
    slides,
    ...extra,
  };
}
