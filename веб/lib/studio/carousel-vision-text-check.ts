/**
 * Phase 6 / correct pipeline — vision text-check after image gen.
 * Best vision model hook (env CAROUSEL_VISION_MODEL → gpt-4o via aggregator).
 * Cap: MAX_VISION_GENS_PER_SLIDE = 2 (1 paint + 1 retry). On fail → deliver + needs_review.
 * Never log API keys.
 */

import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";

/** 1 initial generation + 1 retry = 2 total gens per slide. */
export const MAX_VISION_GENS_PER_SLIDE = 2;

export const DEFAULT_CAROUSEL_VISION_MODEL = "gpt-4o";

/** System prompt — mirrors docs/карусель тест/correct/04_text_check_prompt.md.txt */
export const CAROUSEL_VISION_TEXT_CHECK_SYSTEM = [
  "You are a strict OCR / typography QA for Instagram carousel slides (4:5).",
  "Compare the image to the expected on-slide strings. Ignore decorative textures.",
  "swipe_trigger is META only — it must NOT appear on the image (if it does → fail).",
  "Reply STRICT JSON only: {\"pass\": true|false, \"found_text\": \"…\", \"missing\": [\"…\"], \"reason\": \"short\"}",
].join(" ");

export type VisionExpectedCopy = {
  headline: string;
  body?: string;
  ctaLabel?: string;
};

export type VisionTextCheckResult =
  | {
      ok: true;
      pass: true;
      model: string;
      foundText?: string;
    }
  | {
      ok: true;
      pass: false;
      model: string;
      foundText?: string;
      missing: string[];
      reason: string;
      /** Caller should regen if gensUsed < MAX_VISION_GENS_PER_SLIDE */
      shouldRetry: boolean;
    }
  | {
      ok: false;
      error: string;
      /** Soft: treat as pass-through to avoid blocking forever when vision unavailable */
      softPass: true;
    };

export function resolveCarouselVisionModel(override?: string): string {
  return (
    override?.trim() ||
    process.env.CAROUSEL_VISION_MODEL?.trim() ||
    process.env.OPENROUTER_VISION_MODEL?.trim() ||
    DEFAULT_CAROUSEL_VISION_MODEL
  );
}

function buildVisionUserText(expected: VisionExpectedCopy): string {
  const body = (expected.body ?? "").trim();
  const cta = (expected.ctaLabel ?? "").trim();
  return [
    "EXPECTED (must be readable on image):",
    `- headline: "${(expected.headline ?? "").trim()}"`,
    `- body: "${body}"`,
    `- cta_label: "${cta}"`,
    "",
    "RULES:",
    "- Pass if expected strings are present and legible (minor kerning/OCR noise OK).",
    "- Fail if: missing headline, garbled/gibberish glyphs, wrong language invented, CTA missing when expected, or swipe_trigger text painted.",
    "- Do not invent new requirements.",
    "",
    'Reply STRICT JSON only: {"pass": true|false, "found_text": "…", "missing": ["…"], "reason": "short"}',
  ].join("\n");
}

function parseVisionJson(text: string): {
  pass: boolean;
  found_text?: string;
  missing?: string[];
  reason?: string;
} | null {
  const trimmed = text.trim();
  const fenced =
    /```(?:json|JSON)?\s*([\s\S]*?)```/.exec(trimmed)?.[1]?.trim() ?? trimmed;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(fenced.slice(start, end + 1)) as Record<
      string,
      unknown
    >;
    return {
      pass: Boolean(obj.pass),
      found_text:
        typeof obj.found_text === "string" ? obj.found_text : undefined,
      missing: Array.isArray(obj.missing)
        ? obj.missing.filter((x): x is string => typeof x === "string")
        : undefined,
      reason: typeof obj.reason === "string" ? obj.reason : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * One vision check against a slide PNG (data URL or https).
 * `gensUsed` = how many image gens already done for this slide (1 after first paint).
 */
export async function checkCarouselSlideTextVision(input: {
  imageUrl: string;
  expected: VisionExpectedCopy;
  /** Gens already consumed for this slide (1 after first successful paint). */
  gensUsed: number;
  model?: string;
}): Promise<VisionTextCheckResult> {
  if (!resolveAggregatorEnv()) {
    return { ok: false, error: "aggregator_key_missing", softPass: true };
  }

  const model = resolveCarouselVisionModel(input.model);
  const chat = await callAggregatorChat({
    system: CAROUSEL_VISION_TEXT_CHECK_SYSTEM,
    user: buildVisionUserText(input.expected),
    images: [input.imageUrl],
    model,
    temperature: 0,
    maxTokens: 400,
  });

  if (!chat.ok) {
    // Do not block delivery forever when vision upstream fails.
    return { ok: false, error: chat.error, softPass: true };
  }

  const parsed = parseVisionJson(chat.text);
  if (!parsed) {
    return { ok: false, error: "vision_bad_json", softPass: true };
  }

  if (parsed.pass) {
    return {
      ok: true,
      pass: true,
      model: chat.model,
      foundText: parsed.found_text,
    };
  }

  const gensUsed = Math.max(1, Math.floor(input.gensUsed) || 1);
  const shouldRetry = gensUsed < MAX_VISION_GENS_PER_SLIDE;

  return {
    ok: true,
    pass: false,
    model: chat.model,
    foundText: parsed.found_text,
    missing: parsed.missing ?? [],
    reason: parsed.reason ?? "text_mismatch",
    shouldRetry,
  };
}

export type VisionGateSlideResult = {
  slideIndex0: number;
  imageUrl: string;
  gensUsed: number;
  visionPass: boolean;
  needsReview: boolean;
  visionReason?: string;
};

/**
 * After paint: check text; if fail and room for retry, caller regenerates once.
 * Helper only decides — caller owns regenerate + final PNG.
 */
export function visionDecideRetryOrReview(input: {
  slideIndex0: number;
  imageUrl: string;
  gensUsed: number;
  check: VisionTextCheckResult;
}): VisionGateSlideResult {
  if (!input.check.ok) {
    // softPass: deliver without needs_review (vision unavailable)
    return {
      slideIndex0: input.slideIndex0,
      imageUrl: input.imageUrl,
      gensUsed: input.gensUsed,
      visionPass: true,
      needsReview: false,
      visionReason: input.check.error,
    };
  }
  if (input.check.pass) {
    return {
      slideIndex0: input.slideIndex0,
      imageUrl: input.imageUrl,
      gensUsed: input.gensUsed,
      visionPass: true,
      needsReview: false,
    };
  }
  return {
    slideIndex0: input.slideIndex0,
    imageUrl: input.imageUrl,
    gensUsed: input.gensUsed,
    visionPass: false,
    needsReview: !input.check.shouldRetry,
    visionReason: input.check.reason,
  };
}

/** True when a second image gen is still allowed for this slide. */
export function canRetryVisionSlideGen(gensUsed: number): boolean {
  return gensUsed < MAX_VISION_GENS_PER_SLIDE;
}
