/**
 * Phase 6 / correct pipeline — code critic 05 (NOT an LLM).
 * SUPPLEMENTS zod STRICT; never replaces parseAndAssertCarouselJsonStrict.
 * Backend: Scriptwriter retry ≤ SCRIPTWRITER_CRITIC_MAX_RETRIES (2).
 */

import type { CarouselHandoffJson } from "@/lib/studio/carousel-json-contract";

/** Backend must stop Scriptwriter re-prompt after this many critic fails. */
export const SCRIPTWRITER_CRITIC_MAX_RETRIES = 2;

export const CAROUSEL_CRITIC_05_RETRY_HINT =
  "Rewrite STRICT JSON (S57 layered_html): captivating cover primary ≤8 words; secondary_copy REQUIRED every slide — MUCH WIDER on body (≥220 chars AND ≥5 clauses / or ≥4 short paragraphs: steps, example, micro-story); META swipe_trigger every slide (never on-slide/HTML); cta_type 1–4 (HTML button on cta_slide); visual_prompt SCENE ONLY + RICH (≥3 concrete elements; Armenian motifs OPTIONAL only if topic asks — no laundry list); auto N=7 for «N способов»; character only from catalog when hero set. Resubmit (Scriptwriter retry ≤2).";

/** Body-slide secondary_copy richness bar (wave 2026-10-18 layout-copy · secondary_copy_wide). */
export const SECONDARY_COPY_MIN_CHARS_BODY = 220;
/** AND with char bar — Architect: ≥5 substantive clauses (or ≥4 short paragraphs). */
export const SECONDARY_COPY_MIN_CLAUSES_BODY = 5;
/** Alt to clause count: ≥4 short paragraphs (≥2 newlines with content). */
export const SECONDARY_COPY_MIN_PARAGRAPHS_BODY = 4;

/** Vague / one-liner visual_prompt markers (soft-fail → warning). */
const THIN_VISUAL_PROMPT_MARKERS = [
  /^красивый\s+фон\.?$/i,
  /^aesthetic\s+vibe\.?$/i,
  /^атмосфера(\s+клуба)?\.?$/i,
  /^premium\s+abstract\.?$/i,
  /^elegant\s+(dark\s+)?editorial\.?$/i,
  /^beautiful\s+background\.?$/i,
  /^nice\s+scene\.?$/i,
  /^mood\s+shot\.?$/i,
];

/**
 * Soft richness check: thin one-liner VP → warning (ok stays true).
 * Heuristic: very short OR single vague sentence without multi-element density.
 */
export function isThinVisualPrompt(visualPrompt: string): boolean {
  const vp = visualPrompt.trim();
  if (!vp) return true;
  if (THIN_VISUAL_PROMPT_MARKERS.some((re) => re.test(vp))) return true;
  // One vague sentence under ~90 chars without separators → thin
  const separators = (vp.match(/[,;·•/]| and | и | with | с /gi) ?? []).length;
  const words = vp.split(/\s+/).filter(Boolean).length;
  if (words < 12 && separators < 2) return true;
  if (vp.length < 60) return true;
  return false;
}

export type Critic05Issue = {
  code: string;
  message: string;
  slide?: number;
};

export type Critic05Result =
  | { ok: true; warnings: Critic05Issue[] }
  | {
      ok: false;
      reasons: Critic05Issue[];
      retryHint: string;
    };

const FLAT_HOOK_PATTERNS = [
  /^лучший\s+вечер/i,
  /^секрет\s+успеха/i,
  /^подпишись$/i,
  /^топ[-\s]?5/i,
  /^о\s+нашем\s+клубе/i,
  /^добро\s+пожаловать/i,
  /^5\s+советов/i,
  /^welcome$/i,
  /^запись\s+открыта/i,
];

const PURPLE_SLOP_MARKERS = [
  /(?:^|[^a-zа-я])purple\s+gradient/i,
  /фиолетовый\s+градиент/i,
  /premium\s+abstract/i,
  /красивый\s+фон/i,
  /neon\s+purple/i,
  /stock\s+inter/i,
];

function hasPurpleSlop(visualPrompt: string): boolean {
  const t = visualPrompt.trim();
  if (!t) return false;
  if (
    /\bno\s+purple\b/i.test(t) ||
    /без\s+фиолет/i.test(t) ||
    /\bno\s+stock\s+inter\b/i.test(t) ||
    /\bwithout\s+purple\b/i.test(t)
  ) {
    return false;
  }
  return PURPLE_SLOP_MARKERS.some((re) => re.test(t));
}

/** Count clause-ish units (sentences / semicolon / dash / list beats). */
export function countSecondaryCopyClauses(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  const parts = t
    .split(/(?<=[.!?…])\s+|;\s+|—\s+|–\s+|:\s+|\n+|(?<=,)\s+(?=[А-ЯA-Z«"])/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 8);
  // Dense RU blobs often use few periods — count ~35-char chunks as soft beats
  if (parts.length < 3 && t.length >= 220) {
    const soft = Math.floor(t.length / 45);
    return Math.max(parts.length, soft);
  }
  return Math.max(parts.length, t.length >= 40 ? 1 : 0);
}

/** Short paragraphs (double newline or single newlines with ≥20 chars each). */
export function countSecondaryCopyParagraphs(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  const paras = t
    .split(/\n\s*\n|\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 20);
  return paras.length;
}

/** True when secondary is thinner than richness bar (body HARD; cover/cta soft threshold). */
export function isThinSecondaryCopy(
  secondary: string,
  layoutVariant?: string,
): boolean {
  const s = secondary.trim();
  if (!s) return true;
  const role = (layoutVariant ?? "").toLowerCase();
  if (/cover|cta/.test(role)) {
    return s.length < 60;
  }
  // body HARD: ≥220 chars AND (≥5 clauses OR ≥4 short paragraphs OR dense word count)
  const charsOk = s.length >= SECONDARY_COPY_MIN_CHARS_BODY;
  const clausesOk =
    countSecondaryCopyClauses(s) >= SECONDARY_COPY_MIN_CLAUSES_BODY;
  const parasOk =
    countSecondaryCopyParagraphs(s) >= SECONDARY_COPY_MIN_PARAGRAPHS_BODY;
  const words = s.split(/\s+/).filter(Boolean).length;
  const denseOk = charsOk && words >= 45;
  return !(charsOk && (clausesOk || parasOk || denseOk));
}

function coverCopy(json: CarouselHandoffJson): string {
  const cover =
    json.slides.find((s) => /cover/i.test(s.layout_variant)) ??
    json.slides[0];
  return (cover?.primary_copy ?? json.hook ?? "").trim();
}

export type Critic05Options = {
  /** Agent/sheet mode — optional soft checks. */
  mode?: "meetings" | "useful" | string | null;
  /** Landscapes catalog numbers present in Settings. */
  characterCatalogNumbers?: number[];
  /** Forced hero from sheet; null/undefined = no character. */
  hero?: number | null;
};

/**
 * Deterministic quality rules AFTER zod STRICT passed.
 * Exposes retryHint for Backend Scriptwriter loop (max 2).
 */
export function runCarouselCritic05(
  json: CarouselHandoffJson,
  opts?: Critic05Options,
): Critic05Result {
  const reasons: Critic05Issue[] = [];
  const warnings: Critic05Issue[] = [];

  const hook = coverCopy(json);
  if (!hook) {
    reasons.push({ code: "flat_hook", message: "empty cover/hook" });
  } else if (FLAT_HOOK_PATTERNS.some((re) => re.test(hook))) {
    reasons.push({
      code: "flat_hook",
      message: `flat cover: «${hook}»`,
    });
  } else if (hook.split(/\s+/).filter(Boolean).length > 10) {
    reasons.push({
      code: "flat_hook",
      message: "cover too long (>~8–10 words sense)",
    });
  }

  for (const s of json.slides) {
    const primary = (s.primary_copy ?? "").trim();
    const secondary = (s.secondary_copy ?? "").trim();
    const primaryWords = primary.split(/\s+/).filter(Boolean).length;

    if (!secondary) {
      reasons.push({
        code: "empty_secondary",
        message: `secondary_copy REQUIRED (2–3× richer: steps/example/micro-instruction) slide ${s.slide_number}`,
        slide: s.slide_number,
      });
    } else if (isThinSecondaryCopy(secondary, s.layout_variant)) {
      const role = (s.layout_variant ?? "").toLowerCase();
      const isCoverOrCta = /cover|cta/.test(role);
      if (isCoverOrCta) {
        warnings.push({
          code: "thin_secondary_copy",
          message: `thin secondary_copy on slide ${s.slide_number} (${secondary.length} chars) — enrich with concrete detail`,
          slide: s.slide_number,
        });
      } else {
        reasons.push({
          code: "thin_secondary_copy",
          message: `secondary_copy too thin on slide ${s.slide_number} — need ≥${SECONDARY_COPY_MIN_CHARS_BODY} chars AND ≥${SECONDARY_COPY_MIN_CLAUSES_BODY} clauses (or ≥${SECONDARY_COPY_MIN_PARAGRAPHS_BODY} paras / dense ≥45 words); got ${secondary.length} chars / ${countSecondaryCopyClauses(secondary)} clauses`,
          slide: s.slide_number,
        });
      }
    }

    if (primary && primaryWords > 8) {
      reasons.push({
        code: "primary_too_long",
        message: `primary_copy >8 words on slide ${s.slide_number} («${primary}»)`,
        slide: s.slide_number,
      });
    }

    const swipe = (s.swipe_trigger ?? "").trim();
    if (!swipe) {
      reasons.push({
        code: "empty_swipe",
        message: `empty swipe_trigger slide ${s.slide_number}`,
        slide: s.slide_number,
      });
    } else if (
      (primary && swipe.toLowerCase() === primary.toLowerCase()) ||
      (secondary && swipe.toLowerCase() === secondary.toLowerCase())
    ) {
      reasons.push({
        code: "swipe_on_slide",
        message: `swipe_trigger equals on-slide copy on slide ${s.slide_number}`,
        slide: s.slide_number,
      });
    }

    const vp = (s.visual_prompt ?? "").trim();
    if (hasPurpleSlop(vp)) {
      reasons.push({
        code: "purple_slop",
        message: `purple-slop visual_prompt slide ${s.slide_number}`,
        slide: s.slide_number,
      });
    }
    // Soft-fail: thin / one-liner visual_prompt (richness ≥3 elements)
    if (vp && isThinVisualPrompt(vp)) {
      warnings.push({
        code: "thin_visual_prompt",
        message: `thin visual_prompt slide ${s.slide_number} — need ≥3 concrete scene elements + lighting/composition detail (Armenian motifs optional only if topic asks; not one-liner)`,
        slide: s.slide_number,
      });
    }
    // Soft warn: visual_prompt asking for text/logo (S57 scene-only)
    if (
      /\b(paint|add|draw|bake)\s+(text|letters?|logo|headline|typography)\b/i.test(
        vp,
      ) ||
      /\b(on[- ]?slide\s+copy|watermark|ui\s+badges?)\b/i.test(vp)
    ) {
      warnings.push({
        code: "visual_prompt_text_leak",
        message: `visual_prompt may ask for text/logo on slide ${s.slide_number} — must be SCENE ONLY`,
        slide: s.slide_number,
      });
    }
  }

  const n = json.slides.length;
  if (n >= 2) {
    const first = json.slides[0]!;
    const last = json.slides[n - 1]!;
    if (!/cover/i.test(first.layout_variant)) {
      warnings.push({
        code: "count_roles",
        message: "first slide layout_variant should be cover-like",
        slide: first.slide_number,
      });
    }
    if (!/cta/i.test(last.layout_variant)) {
      warnings.push({
        code: "count_roles",
        message: "last slide layout_variant should be cta-like",
        slide: last.slide_number,
      });
    }
  }

  const mode = (opts?.mode ?? "").trim().toLowerCase();
  if (mode === "meetings") {
    const topic =
      json.idea?.trim() ||
      json.hook?.trim() ||
      json.caption?.trim() ||
      "";
    if (!topic) {
      reasons.push({
        code: "mode_meetings",
        message: "meetings mode requires topic/idea/hook/caption",
      });
    }
  }

  const hero =
    typeof opts?.hero === "number" && Number.isFinite(opts.hero)
      ? opts.hero
      : null;
  if (hero != null && hero > 0) {
    const catalog = opts?.characterCatalogNumbers ?? [];
    if (catalog.length === 0 || !catalog.includes(hero)) {
      reasons.push({
        code: "hero_catalog",
        message: `hero=${hero} not found in CHARACTER_CATALOG`,
      });
    }
  }

  if (reasons.length > 0) {
    return {
      ok: false,
      reasons,
      retryHint: CAROUSEL_CRITIC_05_RETRY_HINT,
    };
  }

  return { ok: true, warnings };
}

/**
 * Should Backend re-prompt Scriptwriter?
 * retryCount = number of critic failures already consumed (0 before first fail).
 */
export function shouldRetryScriptwriterAfterCritic(
  retryCount: number,
): boolean {
  return retryCount < SCRIPTWRITER_CRITIC_MAX_RETRIES;
}
