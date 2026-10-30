/**
 * C-carousel-json-scriptwriter + C-audit-02 Phase1 + Phase 6 correct + Phase 7 S57 —
 * Create carousel system-prompt overlays (AI Bridge).
 * Scriptwriter = Dramaturgy & Hook Engine (strict JSON).
 * **Product (S57):** Layered Visual Engine — image model = BACKGROUND ONLY;
 * HTML/CSS + Puppeteer owns typography, Brand logo, CTA 1–4 button, character cut-outs.
 * Vision text-check OFF on layered_html. Legacy Phase4 E2E / Phase6 correct = archaeology only.
 * Live user turns stay raw (C-155); overlays go into agent-start / mode system only.
 *
 * Dedupe (D-p-1): paired invariants appear ONCE in agent-start Rules;
 * role overlays are deltas; mesh seed = short identity.
 */

import {
  buildDesignTokensPayload,
  formatActiveDesignMdForPrompt,
  resolveActiveDesignMarkdown,
  type ActiveDesignResolveInput,
  type ActiveDesignResolveResult,
} from "@/lib/settings/design-library";
import {
  designPresetToCssVars,
  PNG_BUDGET_MAX,
  type DesignPresetFile,
  type LayoutMap,
} from "@/lib/settings/design-preset";
import {
  CAROUSEL_JSON_SCHEMA_HINT,
  DESIGNER_IMAGE_PROMPTS_SCHEMA_HINT,
} from "@/lib/studio/carousel-json-contract";
import { toCarouselStylePreset } from "@/types/design";

/**
 * Dual character paint path (wave layout-copy).
 * Alias: job `character_path` === runtime `characterPaint` / `html_layout.characterPaint`.
 */
export type CharacterPaintPath = "in_image" | "overlay_cutout" | "none";

/**
 * Product default character paint (wave 2026-10-18-vision-style-copy + going forward).
 * `overlay_cutout` remains legacy OK — never the factory default.
 */
export const DEFAULT_CHARACTER_PAINT: CharacterPaintPath = "in_image";

/**
 * Job flag — vision image-ref style-copy vs legacy token-card inject.
 * - `vision_ref` = etalon slide as multimodal reference; skip FULL token-card dump
 * - `token_card` = prior design-inject / layout-copy path (FULL role table ON)
 */
export type StyleCopyMode = "vision_ref" | "token_card";

/** Composite bg fit for partial / inset etalon photos (Backend executes). */
export type BgFit = "cover" | "contain" | "mask";

/**
 * Multimodal reference signal for Backend describe+draw (never dump base64 into text).
 * Backend maps → aggregator image parts: path | url | base64.
 */
export type DrawReferenceImageSignal = {
  kind: "path" | "url" | "base64";
  path?: string;
  url?: string;
  /** Length hint only — do NOT paste binary into the LLM text prompt. */
  base64LengthHint?: number;
  mime?: "image/png" | "image/jpeg";
  /** Slot from active 4-frame pack: cover · midA · midB · cta */
  slot?: "cover" | "midA" | "midB" | "cta" | string;
};

export type CreateCarouselAgentRole = "scriptwriter" | "designer";
export type CreateCarouselPromptMode = "chat" | "handoff" | "describe" | "draw";
/** Phase5 bake-off arm — sequential cover-first paint (S54). */
export type CreateCarouselDrawMode = "default" | "anchor_ref";
/**
 * Product pipeline gate.
 * - `layered_html` / `default` = S57 ship (bg + HTML Puppeteer)
 * - `correct` = Phase6 archaeology (type-on-PNG + vision) — NOT product default
 */
export type CreateCarouselPipeline = "default" | "correct" | "layered_html";

/** True when job/smoke uses vision etalon reference as style SoT. */
export function isVisionStyleCopyMode(
  mode?: StyleCopyMode | string | null,
): boolean {
  return (mode ?? "").trim().toLowerCase() === "vision_ref";
}

/** Resolve character paint with product default `in_image`. */
export function resolveCharacterPaintPath(
  paint?: CharacterPaintPath | null,
): CharacterPaintPath {
  return paint ?? DEFAULT_CHARACTER_PAINT;
}

/** Env / mode gate for Phase5 ANCHOR REF draw (bakeoff script sets this). */
export function isCarouselAnchorRef(drawMode?: CreateCarouselDrawMode): boolean {
  if (drawMode === "anchor_ref") return true;
  const v = process.env.CAROUSEL_DRAW_MODE?.trim().toLowerCase();
  return v === "anchor_ref" || v === "anchor_ref_pipeline";
}

/**
 * Phase 6 correct pipeline gate — explicit archaeology only.
 * Product default is layered_html (see isCarouselLayeredHtmlPipeline).
 */
export function isCarouselCorrectPipeline(
  pipeline?: CreateCarouselPipeline,
): boolean {
  if (pipeline === "correct") return true;
  if (pipeline === "layered_html" || pipeline === "default") return false;
  const v = process.env.CAROUSEL_PIPELINE?.trim().toLowerCase();
  return v === "correct" || v === "correct_doc" || v === "phase6";
}

/**
 * S57 product gate — LAYERED HTML (bg image + HTML/CSS Puppeteer).
 * ON when: opts/env `layered_html` | `layered` | `s57` | `default` | **missing env**.
 * OFF when: explicit `correct` / `e2e_diffusion` archaeology.
 */
export function isCarouselLayeredHtmlPipeline(
  pipeline?: CreateCarouselPipeline | string,
): boolean {
  if (
    pipeline === "layered_html" ||
    pipeline === "default" ||
    pipeline === "layered" ||
    pipeline === "s57"
  ) {
    return true;
  }
  if (
    pipeline === "correct" ||
    pipeline === "e2e_diffusion" ||
    pipeline === "anchor_ref"
  ) {
    return false;
  }
  const v = process.env.CAROUSEL_PIPELINE?.trim().toLowerCase();
  if (!v) return true; // product default
  if (
    v === "layered_html" ||
    v === "layered" ||
    v === "s57" ||
    v === "default" ||
    v === "html"
  ) {
    return true;
  }
  if (
    v === "correct" ||
    v === "correct_doc" ||
    v === "phase6" ||
    v === "e2e_diffusion" ||
    v === "e2e"
  ) {
    return false;
  }
  // Unknown → prefer product layered
  return true;
}

/** Resolved product renderMode stamp for traces / artifacts. */
export function resolveCarouselRenderMode(
  pipeline?: CreateCarouselPipeline,
): "layered_html" | "correct_pipeline" | "e2e_diffusion" | "anchor_ref" {
  if (isCarouselAnchorRef()) return "anchor_ref";
  if (isCarouselLayeredHtmlPipeline(pipeline)) return "layered_html";
  if (isCarouselCorrectPipeline(pipeline)) return "correct_pipeline";
  return "e2e_diffusion";
}

/**
 * Auto-suggest slides=7 for «N способов / советов / ошибок» / ways / tips topics.
 * Scriptwriter may bump higher. Returns null when rule does not apply.
 */
export function suggestAutoSlideCountForTopic(topic: string): number | null {
  const t = (topic ?? "").trim();
  if (!t) return null;
  const nWays =
    /\d+\s*(?:способов|советов|ошибок|правил|habits?|ways?|tips?|mistakes?)/i.test(
      t,
    ) ||
    /(?:^|\b)(?:n|N)\s*(?:ways?|tips?)\b/i.test(t) ||
    /(?:несколько|N)\s+(?:способов|советов|ошибок)/i.test(t);
  return nWays ? 7 : null;
}

/** HARD ban appended to every layered bg image prompt (export for Backend). */
export const BACKGROUND_ONLY_HARD_BAN =
  "CRITICAL HARD BAN: NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY, NO LOGOS, NO WATERMARKS, NO UI BADGES, NO CAPTIONS, NO BRAND MARKS — pure photographic or illustrated SCENE BACKGROUND only. Typography, brand logo, CTA button, and character cut-outs are added later in HTML — do NOT paint them.";

/**
 * Same text/logo ban for `character_paint=in_image` — allows conductor in scene,
 * still forbids letters/logos (HTML owns type/CTA/logo).
 */
export const BACKGROUND_IN_IMAGE_HARD_BAN =
  "CRITICAL HARD BAN: NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY, NO LOGOS, NO WATERMARKS, NO UI BADGES, NO CAPTIONS, NO BRAND MARKS. Character conductor MAY appear IN the scene (to-camera presenter speaking the slide — NOT a story actor). Typography, brand logo, and CTA button are HTML layers — do NOT paint letters or logos.";

/**
 * Append HARD NO TEXT / NO LOGO guard (idempotent). Export for Backend composite.
 */
export function appendBackgroundOnlyGuard(
  prompt: string,
  characterPaint?: CharacterPaintPath,
): string {
  const ban =
    characterPaint === "in_image"
      ? BACKGROUND_IN_IMAGE_HARD_BAN
      : BACKGROUND_ONLY_HARD_BAN;
  const base = (prompt ?? "").trim();
  if (!base) return ban;
  const hasNoText = /\bno\s+text\b/i.test(base);
  const hasNoLogo = /\bno\s+logo/i.test(base);
  if (hasNoText && hasNoLogo) return base;
  return `${base}\n\n${ban}`;
}

/**
 * Strip text/logo leakage phrases, then append HARD ban.
 * Export for Backend before image API call.
 */
export function sanitizeBackgroundImagePrompt(
  prompt: string,
  characterPaint?: CharacterPaintPath,
): string {
  let p = (prompt ?? "").trim();
  if (!p) return appendBackgroundOnlyGuard("", characterPaint);
  p = p
    .replace(
      /\bpaint\s+(exact\s+)?(readable\s+)?(headline|body|text|typography|cta)\b[^.!?]*/gi,
      "",
    )
    .replace(
      /\b(add|include|render|draw|bake)\s+(the\s+)?(text|letters?|logo|watermark|typography|caption|headline|body)\b[^.!?]*/gi,
      "",
    )
    .replace(/\bleave\s+text\s+blank\b[^.!?]*/gi, "")
    .replace(/\bintegrated\s+typography\b[^.!?]*/gi, "")
    .replace(/\btype[- ]on[- ]png\b[^.!?]*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return appendBackgroundOnlyGuard(p, characterPaint);
}

/**
 * Assert prompt is background-only (has ban; no text/logo paint instructions).
 * Export for Backend — reject before image gen when ok=false.
 */
export function assertBackgroundOnlyPrompt(
  prompt: string,
): { ok: true } | { ok: false; reason: string } {
  const t = (prompt ?? "").trim();
  if (!t) return { ok: false, reason: "empty background prompt" };
  const leaks = [
    /paint\s+exact\s+readable/i,
    /\bheadline\s*:\s*["«]/i,
    /\bbody\s*:\s*["«]/i,
    /\badd\s+(the\s+)?(text|logo|watermark|letters)\b/i,
    /\btypography\s+in\s+(the\s+)?(image|pixels)\b/i,
    /\bon[- ]?slide\s+copy\b/i,
    /\bintegrated\s+typography\b/i,
    /\bleave\s+text\s+blank\s+for\s+html\b/i,
  ];
  for (const re of leaks) {
    if (re.test(t)) {
      return {
        ok: false,
        reason: `background prompt leaks text/logo instruction (${re})`,
      };
    }
  }
  if (!/\bno\s+text\b/i.test(t) || !/\bno\s+logo/i.test(t)) {
    return {
      ok: false,
      reason: "missing HARD ban NO TEXT / NO LOGO on background prompt",
    };
  }
  return { ok: true };
}

/**
 * Build layered bg image prompt from Scriptwriter visual_prompt (scene only).
 * Always sanitized + HARD ban. Export for Backend draw path.
 */
export function buildLayeredBackgroundImagePrompt(input: {
  visualPrompt: string;
  paletteJson?: string;
  slideIndex0?: number;
  /**
   * Dual paint: `in_image` may keep conductor in scene prompt;
   * `overlay_cutout` / `none` = scene WITHOUT character (cutout is HTML).
   */
  characterPaint?: CharacterPaintPath;
}): string {
  const vp = (input.visualPrompt ?? "").trim();
  const palette = (input.paletteJson ?? "").trim();
  const paint = resolveCharacterPaintPath(input.characterPaint);
  const characterLine =
    paint === "in_image"
      ? "Character paint path=in_image: you MAY include the Vernatun conductor character IN this scene (facing camera, presenting — NOT a story actor cooking/working inside the plot). Still NO letters/logos/watermarks."
      : "Characters as cut-outs and brand logo are HTML layers — do NOT bake faces of catalog heroes or logos into this plate. Scene WITHOUT character.";
  const parts = [
    "Premium Instagram carousel BACKGROUND PLATE ONLY, vertical 4:5 portrait 1080×1350, expensive editorial atmosphere, photoreal or illustrated scene.",
    `Scene from Scriptwriter visual_prompt (light / materials / composition / mood ONLY): ${vp || "Elegant dark editorial atmosphere with warm cognac key light"}.`,
    palette
      ? `Approx mood colors from palette JSON (atmosphere only — no type): ${palette}.`
      : "",
    characterLine,
    typeof input.slideIndex0 === "number"
      ? `Slide ${input.slideIndex0 + 1} background plate.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  return sanitizeBackgroundImagePrompt(parts, paint);
}

/**
 * Cutout / pose gen prompt for overlay_cutout path (separate image before HTML layer).
 * Conductor speaks slide text — not a scene participant.
 */
export function buildCharacterCutoutPrompt(input: {
  characterCatalogLine?: string;
  slideRole?: "cover" | "body_slide" | "cta_slide" | string;
  primaryCopy?: string;
  secondaryCopyExcerpt?: string;
}): string {
  const catalog = (input.characterCatalogLine ?? "").trim() || "Vernatun girl conductor from Персонажи catalog";
  const role = (input.slideRole ?? "body_slide").trim();
  const primary = (input.primaryCopy ?? "").trim();
  const secondary = (input.secondaryCopyExcerpt ?? "").trim().slice(0, 120);
  return [
    "Isolated character CUTOUT plate for HTML overlay on Instagram carousel 4:5.",
    `Subject: ${catalog}.`,
    "HARD: output EXACTLY ONE pose of the girl — a single full-body or 3/4 figure.",
    "HARD BAN: do NOT output a character SHEET, pose grid, 2×3/3×2 collage, multi-pose white box, contact sheet, or several figures in one frame.",
    "If a reference image is a multi-pose sheet: copy identity/outfit/style ONLY — invent ONE conductor stance (not the whole grid).",
    "ROLE = CONDUCTOR between image and viewer: faces / addresses camera, presenter stance, speaks the slide text (metaphor for presentation).",
    "NOT a story participant inside the scene (not cooking as kitchen helper, not sitting as coworker in a meeting plot).",
    `Slide role: ${role}.`,
    primary ? `She presents headline intent: «${primary}».` : "",
    secondary ? `Body beat hint (do not paint letters): ${secondary}…` : "",
    "Prefer TRUE transparent alpha OR solid flat soft light-gray studio (#E8E8E8) for chroma. HARD BAN: Photoshop checkerboard / transparency grid painted as pixels. Sharp silhouette edges. No on-slide typography, no logos, no watermarks.",
    "Cover + cta_slide cutouts are MANDATORY when character_paint=overlay_cutout.",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Placeholder bag for correct/02–06 injection (Create ⊕ sheet). */
export type CorrectPipelinePlaceholders = {
  brandName?: string;
  /**
   * Sanitized / stubbed logo for LLM text prompts only.
   * Never send giant base64 into system messages.
   */
  logoRef?: string;
  /**
   * Raw Settings Brand logoRef for Puppeteer composite `<img>`.
   * Backend fills; AI Bridge / LLM overlays must not consume this field.
   */
  logoRefRaw?: string;
  designPaletteJson?: string;
  characterCatalog?: string;
  mode?: "meetings" | "useful" | string;
};

/** Parsed DESIGN palette typography.scale (px). */
export type DesignTypographyScale = {
  cover?: number;
  h2?: number;
  body?: number;
  caption?: number;
};

/** Parsed DESIGN palette colors (hex/CSS). */
export type DesignPaletteColors = {
  bg?: string;
  surface?: string;
  text?: string;
  muted?: string;
  accent?: string;
  accentSoft?: string;
};

/** Parsed DESIGN palette fonts per role. */
export type DesignPaletteFonts = {
  title?: string;
  body?: string;
  content?: string;
  mono?: string;
};

/** Full palette slice for Designer inject (wave 2026-10-18-design-inject). */
export type DesignPaletteTokens = {
  scale: DesignTypographyScale | null;
  colors: DesignPaletteColors | null;
  fonts: DesignPaletteFonts | null;
};

function asCssColor(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function asFontFamily(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function asPositivePx(v: unknown): number | undefined {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return undefined;
  return v;
}

/**
 * Extract typography.scale from DESIGN palette JSON (placeholders / tokens dump).
 * Accepts `{ typography: { scale } }` or nested tokens payload shapes.
 */
export function parseTypographyScaleFromPaletteJson(
  paletteJson?: string | null,
): DesignTypographyScale | null {
  return parseDesignPaletteFromJson(paletteJson).scale;
}

/**
 * Extract FULL palette (colors + fonts + scale) from `{{DESIGN_PALETTE_JSON}}` /
 * `buildDesignTokensPayload` dump.
 */
export function parseDesignPaletteFromJson(
  paletteJson?: string | null,
): DesignPaletteTokens {
  const empty: DesignPaletteTokens = {
    scale: null,
    colors: null,
    fonts: null,
  };
  const raw = (paletteJson ?? "").trim();
  if (!raw || raw === "{}") return empty;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const typography = parsed.typography as Record<string, unknown> | undefined;
    const textBlock = parsed.textBlock as Record<string, unknown> | undefined;
    const colorsRaw =
      (parsed.colors as Record<string, unknown> | undefined) ?? undefined;

    const scaleRaw =
      (typography?.scale as DesignTypographyScale | null | undefined) ??
      (textBlock?.scale as DesignTypographyScale | null | undefined) ??
      null;
    let scale: DesignTypographyScale | null = null;
    if (scaleRaw && typeof scaleRaw === "object") {
      const out: DesignTypographyScale = {};
      for (const key of ["cover", "h2", "body", "caption"] as const) {
        const n = asPositivePx(scaleRaw[key]);
        if (n != null) out[key] = n;
      }
      if (Object.keys(out).length) scale = out;
    }

    let colors: DesignPaletteColors | null = null;
    if (colorsRaw && typeof colorsRaw === "object") {
      const c: DesignPaletteColors = {
        bg: asCssColor(colorsRaw.bg),
        surface: asCssColor(colorsRaw.surface),
        text: asCssColor(colorsRaw.text),
        muted: asCssColor(colorsRaw.muted),
        accent: asCssColor(colorsRaw.accent),
        accentSoft: asCssColor(colorsRaw.accentSoft),
      };
      if (Object.values(c).some(Boolean)) colors = c;
    }

    const display =
      asFontFamily(typography?.display) ??
      asFontFamily(textBlock?.displayFamily);
    const body =
      asFontFamily(typography?.body) ?? asFontFamily(textBlock?.bodyFamily);
    const mono = asFontFamily(typography?.mono);
    const fonts: DesignPaletteFonts | null =
      display || body || mono
        ? {
            title: display,
            body,
            content: body ?? mono,
            mono,
          }
        : null;

    return { scale, colors, fonts };
  } catch {
    return empty;
  }
}

/** Short palette → bg mood line for image_prompt harmony. */
export function buildPaletteMoodGuidance(
  colors?: DesignPaletteColors | null,
): string {
  const text = (colors?.text ?? "").toLowerCase();
  const accent = (colors?.accent ?? "").toLowerCase();
  const bg = (colors?.bg ?? "").toLowerCase();
  const blob = `${text} ${accent} ${bg}`;
  if (/#?(?:[89a-f][0-9a-f]{2}[89a-f]|[a-f]{2}[0-9a-f]{4}).*|#b[89a-f]|lavender|violet|purple|lilac/i.test(blob)) {
    return "cool mist / dusk violet atmosphere — lavender/cool type vs soft cool bg (not flat black mud)";
  }
  if (/#?(?:[c-f][89a-f]|e[89a-f]|f[0-9a-f]).*gold|cognac|amber|warm|#c4|#d4|#e8/i.test(blob)) {
    return "warm cognac / amber key light — gold accents on charcoal or dusk surfaces (not purple-slop)";
  }
  if (/#0{2,}|#1[0-3]|#2[0-2]|charcoal|black|ink/i.test(bg) || !bg) {
    return "deep editorial dark with controlled key light matching type hex contrast";
  }
  return "match scene lighting/materials to type hex (text vs bg harmony — readable contrast, no mud)";
}

/**
 * FULL DESIGN TOKEN CARD for Designer — colors + fonts + sizes per role.
 * Positive scale only (wave 2026-10-18-design-inject). Replaces negative «do NOT assume 64px».
 * Composite owns final px; html_layout = placement + variety + fontFit reduce-only.
 */
export function formatFullDesignTokensInjectBlock(
  tokens?: DesignPaletteTokens | DesignTypographyScale | null,
  opts?: { sourceLabel?: string; paletteJsonExcerpt?: string | null },
): string {
  const src =
    opts?.sourceLabel ?? "active DESIGN.md / DesignPreset (FULL tokens)";

  let scale: DesignTypographyScale | null = null;
  let colors: DesignPaletteColors | null = null;
  let fonts: DesignPaletteFonts | null = null;

  if (tokens && typeof tokens === "object" && "scale" in tokens) {
    const t = tokens as DesignPaletteTokens;
    scale = t.scale;
    colors = t.colors;
    fonts = t.fonts;
  } else if (tokens && typeof tokens === "object") {
    scale = tokens as DesignTypographyScale;
  }

  // Expand from raw JSON when caller only had scale or incomplete tokens
  if (opts?.paletteJsonExcerpt) {
    const parsed = parseDesignPaletteFromJson(opts.paletteJsonExcerpt);
    scale = scale ?? parsed.scale;
    colors = colors ?? parsed.colors;
    fonts = fonts ?? parsed.fonts;
  }

  const titlePx = scale?.cover;
  const h2Px = scale?.h2;
  const bodyPx = scale?.body;
  const contentPx = scale?.caption ?? scale?.h2;
  const titleFamily = fonts?.title ?? "(from DESIGN display)";
  const bodyFamily = fonts?.body ?? "(from DESIGN body)";
  const contentFamily = fonts?.content ?? bodyFamily;
  const textColor = colors?.text ?? "(DESIGN colors.text)";
  const mutedColor = colors?.muted ?? "(DESIGN colors.muted)";
  const accentColor = colors?.accent ?? "(DESIGN colors.accent)";
  const bgColor = colors?.bg ?? "(DESIGN colors.bg)";
  const mood = buildPaletteMoodGuidance(colors);

  const lines = [
    "## FULL DESIGN TOKENS (HARD) — colors · fonts · sizes per role",
    "",
    `- Source: ${src}`,
    "- **Positive scale only** — use the printed family + px + hex below. Composite owns final CSS px.",
    "- **html_layout = placement** (template / anchor / highlights / chrome / fontFit). Do **not** invent a parallel type system.",
    "- Drive **HTML type** AND **image_prompt mood** from these colors (text vs bg harmony).",
    "",
    "### Role table (title / body / content)",
    `| Role | Family | Size | Color |`,
    `| --- | --- | --- | --- |`,
    `| **title** (cover/headline) | ${titleFamily} | ${titlePx != null ? `**${titlePx}px** (scale.cover)` : "(composite fallback)"} | ${textColor} |`,
    `| **body** (secondary / paragraphs) | ${bodyFamily} | ${bodyPx != null ? `**${bodyPx}px** (scale.body)` : h2Px != null ? `**${h2Px}px** (scale.h2)` : "(composite fallback)"} | ${textColor} |`,
    `| **content** (chrome / captions) | ${contentFamily} | ${contentPx != null ? `**${contentPx}px** (scale.caption\\|h2)` : "(composite fallback)"} | ${mutedColor} |`,
    `| **accent** | — | — | ${accentColor} (highlights / CTA chrome) |`,
    `| **muted** | — | — | ${mutedColor} |`,
    `| **bg / surface** | — | — | bg ${bgColor}${colors?.surface ? ` · surface ${colors.surface}` : ""} |`,
    `| **slideNumber** | **body** tokens | body size | body color — **separate HTML block** (pretty \`N / M\`), NOT paragraph numbering inside copy |`,
    `| **brandName** | content/body OK | content size | text/muted — name **right of** logo icon |`,
    "",
    "### Palette → bg mood (image_prompt)",
    `- Match scene lighting/materials to type colors: **${mood}**.`,
    `- Example: cool/lavender type → cool mist / dusk violet — **not** flat black mud; warm gold type → cognac key light.`,
    "",
    "### Positive print (one-liners)",
    `- Title = ${titlePx != null ? `${titlePx}px` : "DESIGN cover px"} ${titleFamily}; Body = ${bodyPx != null ? `${bodyPx}px` : "DESIGN body px"} ${bodyFamily}; Content = ${contentPx != null ? `${contentPx}px` : "DESIGN content px"} ${contentFamily}.`,
    `- Slide number uses **Body** paragraph tokens in its **own** HTML slot.`,
  ];

  if (opts?.paletteJsonExcerpt?.trim() && opts.paletteJsonExcerpt.trim() !== "{}") {
    const excerpt = opts.paletteJsonExcerpt.trim();
    const clipped =
      excerpt.length > 1800 ? `${excerpt.slice(0, 1800)}\n…[truncated]` : excerpt;
    lines.push(
      "",
      "### Active DESIGN excerpt / palette JSON (expanded)",
      "```json",
      clipped,
      "```",
    );
  }

  return lines.join("\n");
}

/**
 * @deprecated Prefer `formatFullDesignTokensInjectBlock` — kept as alias for prior guards/imports.
 * Now prints the FULL DESIGN TOKEN CARD (positive scale + colors + fonts).
 */
export function formatTypeScaleInjectBlock(
  scale?: DesignTypographyScale | null,
  opts?: { sourceLabel?: string; paletteJsonExcerpt?: string | null },
): string {
  return formatFullDesignTokensInjectBlock(scale ?? null, opts);
}

/** Static richness rules for Scriptwriter visual_prompt (scene-only still HARD). */
export const VISUAL_PROMPT_RICHNESS_HARD = [
  "### visual_prompt RICHNESS (HARD · motifs_optional)",
  "- **≥3 concrete scene elements** every slide (minimum: light + material + object/place) + lighting/composition detail.",
  "- **Armenian / Vernatun cultural taste = OPTIONAL** — only when the user topic naturally asks for it.",
  "- **FORBIDDEN laundry list:** do **NOT** force khachkar / apricot / Ararat / pomegranate / carpet on every post.",
  "- Vary worlds by topic (city, food, language, ritual, abstract editorial…) — not the same motif checklist.",
  "- **SCENE ONLY** keep: no letters, logos, watermarks, UI badges, on-slide copy.",
  "- **FAIL one-liner / vague:** «красивый фон», «aesthetic vibe», «атмосфера клуба», «premium abstract» alone.",
  "- Critic may **soft-fail** thin VP (warning) — rewrite denser before Draft when flagged.",
].join("\n");

/**
 * MUCH WIDER secondary_copy (HARD · 2026-10-18 layout-copy).
 * Supersedes soft ≥120 / 2–3× bar. Backend critic/zod enforces after this lock.
 */
export const SECONDARY_COPY_MUCH_WIDER_HARD = [
  "### secondary_copy MUCH WIDER (HARD · secondary_copy_wide · layout-copy)",
  "- `secondary_copy` **REQUIRED** on **every** slide — not headline paraphrase.",
  "- **Body / point / proof slides (HARD critic bar):**",
  "  - length **≥220 characters** AND clause_count **≥5**",
  "    (split on «.» «!» «?» «;» — or **≥4 short paragraphs** as alt).",
  "  - Write **2–3× denser paragraphs** than thin IG stubs: value beat + example + micro-steps.",
  "- **Cover / CTA:** may be shorter but still **multi-beat** (not one-line stub).",
  "- **FAIL:** 1–3 short sentences; ≤120 chars on body; vague water («это важно», «попробуй сам»).",
  "",
  "#### PASS examples (body — invent your own; match topic)",
  "- «Сначала выпиши три продукта, которые уже есть дома. Потом собери один обед за 15 минут без магазина — например омлет с зеленью и хлеб. Если осталось время, заморозь порцию на завтра. Так ты экономишь и деньги, и нервы в будни. Последний шаг: фото результата в заметки — через неделю увидишь паттерн.»",
  "- «Шаг 1: закрой вкладки-отвлекатели. Шаг 2: поставь таймер на 25 минут только на одну задачу. Шаг 3: после сигнала — 5 минут растяжки у окна. Если сорвался — не ругай себя, просто перезапусти таймер. За день три таких блока дают больше, чем «весь день в потоке».»",
  "",
  "#### FAIL examples (thin air)",
  "- «Это важно. Попробуй сам. У тебя получится.»",
  "- «Готовь просто и полезно.»",
].join("\n");

/**
 * Conductor role + dual character_path (HARD · locks 4–5).
 * Alias: character_path ↔ characterPaint / html_layout.characterPaint.
 */
export const CHARACTER_CONDUCTOR_DUAL_PAINT_HARD = [
  "### Character = CONDUCTOR + dual paint (HARD · conductor_role · dual_smoke_paths)",
  "- Character stands **between** the image and the viewer — presents / **speaks** slide text.",
  "- Pose: facing / addressing camera (presenter stance). **NOT** a story actor inside the plot",
  "  (not kitchen helper cooking the story; not coworker sitting in the meeting narrative).",
  "",
  "#### Paths (job `character_path` = runtime `characterPaint`)",
  "| Path | Id | Image model | HTML |",
  "| --- | --- | --- | --- |",
  "| **A In-scene (PRODUCT DEFAULT)** | `in_image` | MAY paint conductor **WITH** scene (to-camera) | type/logo/CTA still HTML |",
  "| **B Cutout (LEGACY)** | `overlay_cutout` | bg **WITHOUT** character | cutout OVER bg; **cover + last (cta) mandatory** |",
  "| Off | `none` | scene only | no character |",
  "",
  "- Product / smoke default = `in_image` conductor (NOT overlay_cutout).",
  "- `visual_prompt` for overlay_cutout: describe environment only — never «girl cooking in frame as protagonist».",
  "- `visual_prompt` for in_image: environment + conductor presenter (still SCENE ONLY letters ban).",
].join("\n");

/**
 * Vision style-copy HARD block (wave 2026-10-18-vision-style-copy).
 * Wording avoids ban-grep traps (no stock font names, no role-table dump headers).
 */
export const VISION_STYLE_COPY_HARD = [
  "## VISION STYLE-COPY (styleCopyMode=vision_ref)",
  "",
  "- Trace marker: `styleCopyMode=vision_ref` · `inject_skipped: token_card_role_table` · `true`.",
  "- The **attached image** is the STYLE + COMPOSITION source of truth (Backend multimodal / reference-first).",
  "- **HARD-COPY from the picture:**",
  "  · overall composition and balance",
  "  · text zones (where type lives) and hierarchy (title > body > accents)",
  "  · accent treatments (highlights, chips, underlines — as visible)",
  "  · logo presence + placement OR absence",
  "  · CTA chrome presence + placement OR absence",
  "  · numbering presence + style OR absence",
  "  · photo-vs-plate / frame share (how much of the canvas is photo vs solid/plate)",
  "- **HARD-COPY layout grammar from the attached etalon** (Phase 2): plate vs photo share,",
  "  object/hero zone, empty-space rhythm, lighting polarity — **only if the etalon shows them**.",
  "  Do **not** force stock orange/white palette, house-object lock, or Photoreal/CGI restyle.",
  "- Topic content = **subject swap only** (materials/mood/object) — not a competing layout system.",
  "- Swap **ONLY** Vernatun content: our headline, body, secondary_copy, CTA catalog 1–4",
  "  (+ optional Brand emblem + HTML wordmark via `logo.textColor`). Do **not** invent style from a spreadsheet.",
  "- character_paint=`in_image` (product default): optional conductor on **cover + last (cta)** —",
  "  same drawing language as etalon (not Pixar / not forced 3D invent); NOT a lifestyle story actor.",
  "- BAN on this path: token-card role spreadsheet · stock type-scale px table · stock default font-family inject.",
  "- BAN: always full-bleed cover when the reference shows solid plate + object zone.",
  "- Prefer `html_layout.bgFit` matching etalon (`contain` / `mask` / `cover`).",
  "- Emit `html_layout` with `layoutMapSource=vision_ref` and `bgFit` matching the reference.",
  "  Optional `photoZone` {x,y,w,h} 0..1 when inset/mask.",
  "- Logo wordmark color: **DO NOT force** `logo.textColor` before the background exists —",
  "  Designer may omit it; Backend picks contrast AFTER bg (or a later Designer pass).",
  "- Prefer templates that keep etalon type rhythm — do NOT invent stock variety against the picture.",
  "- layoutMap JSON is **NOT** required for PASS on this path (optional legacy only).",
].join("\n");

/**
 * HIGVEN-3 practice wave (2026-10-18) — parallel Designer pack + no character.
 * Appended when vision_ref + characterPaint=none (smoke / wave override).
 */
export const HIGVEN_3_PARALLEL_PACK_HARD = [
  "## HIGVEN-3 PARALLEL PACK (HARD · wave 2026-10-18-pipeline-practice-higven-3)",
  "",
  "- Trace: `wave=pipeline-practice-higven-3` · `characterPaint=none` · `N=3` · pack=`higven_01`.",
  "- **ONE Designer reply** MUST include BOTH per slide:",
  "  · `image_prompt` (bg scene only — NO TEXT / NO LOGOS / NO WATERMARKS)",
  "  · `html_layout` (anchors + type rhythm from attached HIGVEN etalon)",
  "- After that ONE reply: Backend runs GPT Image bg **in parallel with** renderer payload prep.",
  "- **FORBIDDEN:** second Designer call «only for logo.textColor» after bg.",
  "- `logo.textColor` MAY be set **in the same pack** from etalon zone contrast plan — optional;",
  "  full Vernatun PNG (`vernatun-logo.png`) already has wordmark baked → prefer HTML `<img>` only.",
  "- **characterPaint=`none`:** NO girl · NO conductor · NO cutout · NO in_image person.",
  "- Visual grammar HARD-COPY from HIGVEN etalon: dark industrial plates · safety-orange accents",
  "  · bold hierarchy (title ≫ body) · desaturated machinery/architecture mood · clean left type bands.",
  "- **ANTI-LIFESTYLE (HARD):** BAN warm beige plaster walls · soft food-magazine table spreads ·",
  "  sunny lifestyle kitchen as the composition system. Topic food objects OK as **hero inset**",
  "  on a **dark charcoal/black plate** or desaturated industrial photo field — not a cream editorial.",
  "- Prefer: solid dark or white HIGVEN plate + high-contrast left type + orange accent keyword;",
  "  photo zone inset/right like etalon crane/hook frames (subject swapped to Vernatun topic).",
  "- Slides exactly **3**: cover · body · cta. CTA catalog **1–4** HTML button on last only.",
  "- Brand content = Vernatun Sheet topic (not HIGVEN copy). Logo = full PNG `<img>` (`vernatun-logo.png`).",
  "- **Logo placement LOCKS:** cover + cta → `logo.placement=top-left`; body → `bottom-left`.",
  "  Type-stack MUST clear the brand box (composite adds safe padding under top logo).",
  "- **Contrast LOCK:** primary/secondary = high-contrast white (or near-white) on dark plates —",
  "  never dark gray body copy on charcoal. Prefer `scrim=soft|heavy` under type.",
].join("\n");

/**
 * Short subject for vision_ref IMAGE prompt — content only, not layout invent.
 * Caps length; strips common full-room lifestyle openers that fight plate etalons.
 */
export function extractVisionRefVisualSubject(
  visualPrompt: string,
  primaryCopy?: string,
  maxLen = 120,
): string {
  let s = (visualPrompt ?? "").trim() || (primaryCopy ?? "").trim();
  if (!s) return "topic hero object matching carousel subject";
  s = s
    .replace(
      /^(светлая|тёмная|уютная|просторная)\s+(кухня|комната|гостиная|квартира)[^.!?]*/gi,
      "",
    )
    .replace(/\bfull[- ]?bleed\s+(kitchen|room|lifestyle)\b[^.!?]*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) s = (primaryCopy ?? "").trim() || "topic hero object";
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
}

/**
 * Phase 2 vision_ref bg prompt — HARD-COPY attached etalon (IMAGE-PROMPT-AUDIT canon).
 * No forced #FF5A1F / idx%2 white-orange / Photoreal-CGI / house-object lock.
 */
export function buildVisionRefBackgroundImagePrompt(input: {
  visualPrompt: string;
  primaryCopy?: string;
  paletteJson?: string;
  slideIndex0?: number;
  slideTotal?: number;
  characterPaint?: CharacterPaintPath;
  /** When true, force conductor into plate (cover/cta). */
  forceConductor?: boolean;
}): string {
  const paint = resolveCharacterPaintPath(input.characterPaint);
  const idx = input.slideIndex0 ?? 0;
  const total = input.slideTotal ?? 6;
  const isCover = idx === 0;
  const isCta = idx >= total - 1;
  const subject = extractVisionRefVisualSubject(
    input.visualPrompt,
    input.primaryCopy,
  );
  const wantConductor =
    paint === "in_image" &&
    (input.forceConductor === true || isCover || isCta);
  const conductorBlock = wantConductor
    ? "optional conductor matching catalog identity — same drawing language as etalon, not 3D Pixar invent"
    : "no character on this plate";
  const parts = [
    "You are generating ONE Instagram carousel BACKGROUND plate (vertical 4:5).",
    "ATTACHED IMAGE = STYLE + COMPOSITION source of truth (etalon slide for this slot).",
    "HARD-COPY from the attached image: overall layout balance and empty vs filled zones; how much of the frame is solid plate / color field vs photo or object; object placement and scale (inset / partial / full-bleed ONLY if the etalon does that); lighting mood and material language of the etalon (do NOT invent a new design system).",
    `OUR CONTENT (subject only — not layout): Topic object / scene subject: ${subject}. Slide ${idx + 1} of ${total}. ${conductorBlock}.`,
    "STRICT BANS (pixels): NO text, letters, numbers, captions, watermarks; NO logos, brand marks, UI badges, buttons; NO slideshow chrome.",
    "DO NOT: force a stock orange/white palette table; force “always solid plate + one 3D house-like object” if the etalon shows otherwise; force photoreal/CGI/Pixar restyle against the etalon’s drawing language; expand the subject into a busy full-room lifestyle set unless the etalon is that set.",
    paint === "none"
      ? "HIGVEN mood HARD: dark charcoal/black or stark white plate fields, safety-orange accent energy in the SCENE lighting/materials (not letters), desaturated industrial/architectural atmosphere; BAN cream beige lifestyle magazine walls as the whole canvas."
      : "",
    "Return a single background image that a human would recognize as the SAME layout grammar as the attached etalon, with our subject swapped in.",
  ]
    .filter(Boolean)
    .join(" ");
  return sanitizeBackgroundImagePrompt(parts, paint);
}

/**
 * Backend multimodal contract note — text prompt must NOT contain megabytes of ASCII image.
 * Backend attaches path|url|base64 as provider image parts for describe + draw.
 */
export function formatVisionReferenceImageContractBlock(
  ref?: DrawReferenceImageSignal | null,
): string {
  const lines = [
    "## REFERENCE IMAGE WIRE (HARD · Backend multimodal)",
    "",
    "- Etalon slide MUST be attached as an **image part** (path | url | base64) to Designer **describe** and **draw**.",
    "- Do **NOT** paste binary / data-URL blobs into this text prompt.",
    "- Prefer local slice path → else https url → else base64 multimodal part.",
  ];
  if (ref?.kind === "path" && ref.path) {
    lines.push(
      `- Signal: kind=path · slot=${ref.slot ?? "(Backend mapSlideToRefSlot)"} · path=\`${ref.path}\``,
    );
  } else if (ref?.kind === "url" && ref.url) {
    lines.push(
      `- Signal: kind=url · slot=${ref.slot ?? "(Backend mapSlideToRefSlot)"} · url=\`${ref.url}\``,
    );
  } else if (ref?.kind === "base64") {
    lines.push(
      `- Signal: kind=base64 · slot=${ref.slot ?? "(Backend mapSlideToRefSlot)"} · mime=${ref.mime ?? "image/png"} · bytes≈${ref.base64LengthHint ?? "?"}`,
      "- Backend must attach as multimodal image part (not ASCII dump).",
    );
  } else {
    lines.push(
      "- Signal: Backend fills per-slide slot (cover|midA|midB|cta) before describe/draw — see job `styleCopySlots`.",
    );
  }
  return lines.join("\n");
}

/**
 * Brand Vernatun content channel only — no role-table / type-scale dump (vision_ref).
 */
export function formatBrandVernatunContentChannel(
  placeholders?: CorrectPipelinePlaceholders | null,
): string {
  const brand = (placeholders?.brandName ?? "").trim() || "Vernatun";
  const logo = (placeholders?.logoRef ?? "").trim();
  const logoLine = logo
    ? `- Optional Brand logo (sanitized stub for LLM; composite uses raw Settings logo): ${logo.slice(0, 200)}${logo.length > 200 ? "…" : ""}`
    : "- Optional Brand logo: from Settings Бренд when present (HTML layer).";
  return [
    "## Brand Vernatun — CONTENT SWAP ONLY (vision_ref)",
    "",
    `- Publisher brand name: **${brand}**`,
    logoLine,
    "- Swap OUR headline / body / secondary_copy / CTA catalog **1–4** into the hard-copied composition.",
    "- Do **not** invent style from a token spreadsheet — style comes from the attached etalon image.",
    "- CTA = HTML button on `cta_slide` only. `swipe_trigger` = meta never painted.",
  ].join("\n");
}

/**
 * Grep-ban strings that MUST be absent from vision_ref Designer dumps (Tester G3).
 * Exported for guards — keep in sync with architect-spec §5.3.
 */
export const VISION_REF_PROMPT_BAN_SUBSTRINGS = [
  "FULL DESIGN TOKEN",
  "typography.scale",
  "Manrope",
  "Cormorant",
  "buildDesignTokensPayload",
] as const;

/** Title = Npx pattern — ban positive scale one-liners on vision_ref. */
export const VISION_REF_TITLE_PX_BAN_RE = /Title\s*=\s*\d+\s*px/i;

/**
 * Assert vision_ref Designer prompt is clean of token-card / stock-font inject.
 */
export function assertVisionRefPromptBanClean(
  prompt: string,
): { ok: true } | { ok: false; reason: string } {
  const t = prompt ?? "";
  for (const s of VISION_REF_PROMPT_BAN_SUBSTRINGS) {
    if (t.toLowerCase().includes(s.toLowerCase())) {
      return { ok: false, reason: `vision_ref ban hit: ${s}` };
    }
  }
  if (VISION_REF_TITLE_PX_BAN_RE.test(t)) {
    return { ok: false, reason: "vision_ref ban hit: Title = Npx scale line" };
  }
  return { ok: true };
}

/**
 * Format layoutMap grammar block for Designer inject (mirror anchors/chrome/numbering).
 */
export function formatLayoutMapInjectBlock(
  layoutMap?: LayoutMap | null,
): string {
  if (!layoutMap || !Array.isArray(layoutMap.slides) || !layoutMap.slides.length) {
    return [
      "## LAYOUT MAP (none on active preset)",
      "",
      "- No vision layoutMap — invent layout with **variety** (rotate anchors; taste layered-html-refs #3).",
      "- Default logo chrome = bottom-RIGHT; pretty N/M OK when no map says absent.",
    ].join("\n");
  }

  const numberingAbsent = layoutMap.numberingGlobal === "absent";
  const lines: string[] = [
    "## LAYOUT MAP (HARD · mirror grammar · layoutMapSource=preset)",
    "",
    `- numberingGlobal: **${layoutMap.numberingGlobal}**`,
    numberingAbsent
      ? "- **OMIT** slide-number HTML entirely (`.slide-num` / pretty N/M) — refs had no numbers."
      : `- Render slide numbers as **${layoutMap.numberingGlobal}** in own HTML slot (body tokens).`,
    layoutMap.grammarNote
      ? `- grammarNote: ${layoutMap.grammarNote}`
      : "",
    "",
    "**COPY** text anchors + logo/CTA chrome from map. Invent **only** copy, scene bg, CTA catalog 1–4.",
    "**FORBIDDEN:** fighting map anchors; inventing numbers when numberingGlobal=absent; inventing parallel layout markup.",
    "",
    "| # | role | textAnchor | numbering | logoChrome | ctaChrome |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  layoutMap.slides.forEach((s, i) => {
    const num = s.numbering.present
      ? `present ${s.numbering.format ?? "pretty_N_M"}${s.numbering.slot ? ` @${s.numbering.slot}` : ""}`
      : "absent";
    const logo = s.logoChrome.present
      ? `present ${s.logoChrome.slot ?? "bottom-left"}`
      : "absent";
    const cta = s.ctaChrome.present
      ? `present ${s.ctaChrome.slot ?? "bottom"}`
      : "absent";
    lines.push(
      `| ${i + 1} | ${s.role} | ${s.textAnchor.x}/${s.textAnchor.y} | ${num} | ${logo} | ${cta} |`,
    );
  });

  lines.push(
    "",
    "```json",
    JSON.stringify(layoutMap, null, 2),
    "```",
  );
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

/** Character paint inject for Designer / draw helpers. */
export function formatCharacterPaintInjectBlock(
  characterPaint?: CharacterPaintPath | null,
): string {
  const path = resolveCharacterPaintPath(characterPaint);
  if (path === "none") {
    return [
      "## CHARACTER PAINT: none",
      "- No conductor. Scene-only bg. No cutout HTML.",
    ].join("\n");
  }
  if (path === "in_image") {
    return [
      "## CHARACTER PAINT: in_image (HARD · PRODUCT DEFAULT)",
      "- Image model MAY paint Vernatun conductor **WITH** the scene (to-camera presenter).",
      "- She **speaks** the text — not a story participant inside the plot.",
      "- HTML still owns typography / Brand logo / CTA 1–4.",
      "- Do NOT also require a separate cutout layer.",
    ].join("\n");
  }
  return [
    "## CHARACTER PAINT: overlay_cutout (HARD · LEGACY conductor)",
    "- Bg image = scene **WITHOUT** character (no baking person into plate).",
    "- Character sheet → HTML/Puppeteer cutout **OVER** bg.",
    "- Conductor **speaks** slide text; pose to camera.",
    "- **Cover + last (cta_slide) cutout MANDATORY**; mid slides optional when taste needs.",
    "- Not product default — only when job explicitly sets overlay_cutout.",
  ].join("\n");
}
const PLACEHOLDER_KEYS = [
  "BRAND_NAME",
  "LOGO_REF",
  "DESIGN_PALETTE_JSON",
  "CHARACTER_CATALOG",
  "MODE",
] as const;

/**
 * Replace {{BRAND_NAME}} … {{MODE}} in overlay text.
 * Missing values → empty string (Scriptwriter must not invent brand facts).
 */
export function fillCorrectPipelinePlaceholders(
  template: string,
  values: CorrectPipelinePlaceholders,
): string {
  // Strip accidental data:image base64 — huge payloads → aggregator HTTP 400.
  const logoRaw = (values.logoRef ?? "").trim();
  const logoSafe = /^data:image\//i.test(logoRaw)
    ? `[brand logo present as ${logoRaw.slice(5, logoRaw.indexOf(";")) || "image"}; omit binary]`
    : logoRaw.length > 400
      ? `${logoRaw.slice(0, 200)}…[truncated]`
      : logoRaw;
  const map: Record<(typeof PLACEHOLDER_KEYS)[number], string> = {
    BRAND_NAME: (values.brandName ?? "").trim(),
    LOGO_REF: logoSafe,
    DESIGN_PALETTE_JSON: (values.designPaletteJson ?? "").trim() || "{}",
    CHARACTER_CATALOG: (values.characterCatalog ?? "").trim() || "[]",
    MODE: (values.mode ?? "").trim() || "useful",
  };
  let out = template;
  for (const key of PLACEHOLDER_KEYS) {
    out = out.split(`{{${key}}}`).join(map[key]);
  }
  return out;
}

/**
 * Phase5 — ANCHOR REF inject (Designer draw when bakeoff / CAROUSEL_DRAW_MODE=anchor_ref).
 * Still E2E DIFFUSION (type ON PNG). HARD export path for S54.
 */
export const CREATE_CAROUSEL_ANCHOR_REF_DRAW_OVERLAY = [
  "## ANCHOR REF (HARD) — reference-first carousel paint · Phase5 / S54",
  "",
  "- **Step 1:** Paint **COVER first** — full E2E diffusion: scene + typography + CTA **on PNG**.",
  "- **Step 2–N:** Match approved cover: palette, type feel, texture, lighting, margins.",
  "- Prefer image API **reference / edits** with cover PNG when aggregator supports it;",
  "  else restate **MASTER STYLE (LOCKED)** verbatim + only beat/copy/CTA change.",
  "- **FORBIDDEN:** new art direction per slide; HTML/Playwright text overlay as primary;",
  "  leave text blank «for HTML».",
  "- `swipe_trigger` = never painted. Safe-zone still applies.",
  "- Export paths MUST include pipeline label:",
  "  `generatedMedia/карусель тест/bakeoff-20261017/pipeline=anchor_ref_pipeline/{theme}/slide_0N.png`",
  "",
  "### MASTER STYLE (LOCKED) for slides 2–N",
  "Open every follow-up prompt with a frozen block from cover:",
  "palette · lighting · materials/texture · typography treatment · camera/composition grammar.",
  "MATCH cover visual world. Only change: this slide's beat, headline, body, CTA intent.",
].join("\n");

/**
 * S54 bake-off Scriptwriter topic lock — Armenian LANGUAGE (not coffee/jazz product).
 * Appended by bakeoff / when Architect selects LANGUAGE pack.
 */
export const CREATE_CAROUSEL_S54_LANGUAGE_TOPIC_GUIDANCE = [
  "## S54 LANGUAGE topics (HARD · bake-off)",
  "",
  "Theme = Armenian **LANGUAGE** / heritage speech — rotate distinct briefs:",
  "- Маштоц / алфавит as home",
  "- дети диаспоры говорят по-армянски",
  "- армянский в городе / вывески / устная речь",
  "",
  "**ЗАПРЕТ** default coffee / jazz / клубный ритуал product lock for this pack.",
  "Vernatun = publisher brand only. Cover = curiosity gap ≤6–8 words. CTA catalog 1–4.",
].join("\n");

/** Build frozen MASTER STYLE kit text from cover intent + approx brand colors. */
export function buildMasterStyleLockedBlock(input: {
  coverVisualPrompt: string;
  approxColorsLine: string;
  coverPrimary?: string;
  coverSecondary?: string;
}): string {
  const vp = (input.coverVisualPrompt || "").trim() || "Vernatun dark editorial heritage mood";
  const primary = (input.coverPrimary || "").trim();
  return [
    "MASTER STYLE (LOCKED from cover — do not reinvent):",
    `- palette: ${input.approxColorsLine}`,
    `- lighting: match cover — warm cognac / soft gold editorial key from: ${vp.slice(0, 160)}`,
    `- materials / texture: same paper/stone/ink/glass feel as cover scene`,
    `- typography treatment: expensive Instagram integrated type (sharp glyphs; same weight/contrast feel as cover${primary ? ` «${primary}»` : ""})`,
    `- camera / composition grammar: same framing language, margins, and depth-of-field family as cover`,
    "MATCH approved cover: palette, type feel, texture, lighting, margins.",
    "Only change: this slide's beat, headline, body, CTA intent (and scene detail that serves the beat).",
  ].join("\n");
}

/** Cover-first preamble for slide 1 image prompt. */
export function buildAnchorRefCoverPromptPrefix(): string {
  return [
    "ANCHOR REF COVER (paint FIRST — establishes visual world for the whole carousel).",
    "Full E2E diffusion: scene + EXACT readable typography + CTA chrome IN pixels.",
    "This cover becomes the visual anchor for slides 2–N.",
  ].join(" ");
}

/** Follow-up preamble wrapping locked MASTER STYLE + exact new copy. */
export function buildAnchorRefFollowupPromptPrefix(masterStyleBlock: string): string {
  return [
    "ANCHOR REF FOLLOW-UP — Match approved cover visual world.",
    masterStyleBlock,
    "New exact on-slide copy below in quotes — paint those strings; do not invent a new art direction.",
  ].join("\n");
}

/**
 * C-audit-02 D-p-2 — single shared HARD surface for Scriptwriter + Designer.
 * Injected once in agent-start Rules (not repeated in mesh seed / pack).
 */
export const CREATE_CAROUSEL_PAIRED_INVARIANTS = [
  "## Paired invariants (HARD · once · S57 layered_html)",
  "",
  "1. **N sync:** user/sheet N = `requested_slide_count` = `slides.length`. **Auto N=7** when topic is «N способов / советов / ошибок» (ways/tips) — Scriptwriter may bump higher. Else ask if N missing. Never hardcode 4/5/8 as only truth.",
  "2. **Cover hook:** curiosity gap ≤6–8 words. PASS craft (style-only, not topic): «Цифра молчит?» / «Буква дышит?» / «Город спит?». FAIL flat: «Лучший вечер», «Секрет успеха», «Подпишись», «О нашем клубе».",
  "3. **Copy split (HARD · secondary_copy_wide):** `primary_copy` ≤8 words every slide; `secondary_copy` **REQUIRED** on **every** slide — **MUCH wider** than thin stubs (2–3× paragraphs with examples/micro-steps). Body slides: **≥220 chars AND ≥5 clauses** (or ≥4 short paragraphs). Cover/CTA multi-beat OK shorter. 1–3 short sentences = FAIL. Both go to **HTML layer**.",
  "",
  "### TOPIC = user only (HARD · S52)",
  "- Тема/сюжет карусели = **только** из сообщения пользователя (или явного smoke brief).",
  "- Обложка НЕ называет другой город/страну как МЕСТО вместо города темы (тема «…в Москве» → не «Вкус Еревана»; «вкус Армении/Еревана» можно только как перенос вкуса В город темы).",
  "- Brand **Vernatun** OK как publisher. **ЗАПРЕТ** default topic: кофе / джаз / клубный ритуал / «вечер в клубе».",
  "- Golden few-shots с кофе = **style craft only**, never product theme lock.",
  "",
  "### swipe_trigger = META only (HARD)",
  "- На **каждом** слайде обязателен `swipe_trigger`: engagement QA «зачем листать».",
  "- **META only:** never on-slide copy, never HTML text, never image paint. **НИКОГДА** не клади в `primary_copy` / `secondary_copy`.",
  "",
  "### CTA flags 1–3 (HARD · из листа 2 таблицы)",
  "- **1** — приглашение обсудить ИМЕННО ТЕМУ этой карусели вживую на встрече разговорного клуба Vernatun (детали/запись — в шапке профиля). Финал привязан к теме: «обсудим это на встрече клуба», не абстрактная вербовка.",
  "- **2** — делитесь в комментариях (вопрос зрителю → ответ под постом).",
  "- **3** — хочешь получать такие полезные подборки? → сохрани и подпишись.",
  "- User/sheet number → `cta_type` (1|2|3). Нет флага → по умолчанию 2 (комментарии).",
  "- **ВЕСЬ сценарий пишется ПОД финальный CTA (с его учётом):** обложка-hook и каждый mid подводят читателя именно к этому действию; финальный слайд = этот CTA, без подмены другим призывом. Напр. флаг 2 → по ходу провоцируй мнение/выбор, чтобы на финале естественно захотелось написать в комментах; флаг 3 → по ходу подчёркивай «полезно сохранить», финал = сохрани+подпишись; флаг 1 → финал зовёт на живую встречу клуба (детали в профиле).",
  "- Финальный слайд ДЕРЖИТ тему карусели (не уходит в вербовку в клуб, если флаг ≠ 1).",
  "- Product render: CTA-кнопка на `cta_slide` — текст CTA в copy слайда по флагу.",
  "",
  "### visual_prompt = SCENE ONLY (HARD · S57)",
  "- Concrete non-empty every slide: light / materials / composition / mood.",
  "- **FORBIDDEN in visual_prompt:** letters, logos, watermarks, UI badges, on-slide copy, «paint headline…».",
  "- Generic/empty / purple abstract = FAIL.",
  "",
  VISUAL_PROMPT_RICHNESS_HARD,
  "",
  "### Product renderMode (HARD)",
  "- Ship path = **`layered_html`**: image bg (no text/logo) + HTML/CSS Puppeteer (type + Brand logo + CTA + optional character cut-outs).",
  "- Vision text-check = **OFF**. Type-on-PNG / `correct_pipeline` paint = **not** product success.",
  "",
  "4. **Razbor when present:** must-consume hook/mid/CTA + trainerTasks; ignore = FAIL.",
  "5. **No auto-handoff:** Scriptwriter never self-transfers to Designer; wait for UI «Передать задание».",
  "6. **Critic before Draft:** invalid JSON / weak hook / missing secondary_copy / incomplete CTA = FAIL — no soft-mock success.",
].join("\n");

/** Scriptwriter role delta — paired invariants injected separately (once). */
export const CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY = [
  "## Роль — Сценарист карусели (Dramaturgy & Hook Engine) · S57 layered_html",
  "",
  "Ты пишешь **строгий JSON** для Instagram-карусели 4:5 Vernatun — не рилс, не инфобиз-лендинг.",
  "Product path = **layered_html**: тексты/CTA/логотип уйдут в HTML-слой; image model рисует только фон из `visual_prompt`.",
  "Цель: вирусный cover + REQUIRED secondary body + CTA 1–4 + meta swipe.",
  "Entry = Create chat **или** Google Sheet row (таблица дополняет чат, не заменяет).",
  "",
  "### Placeholders (injected at job start)",
  "- Brand: `{{BRAND_NAME}}` · logo: `{{LOGO_REF}}` (для HTML — не для image prompt)",
  "- Palette: `{{DESIGN_PALETTE_JSON}}`",
  "- Characters: `{{CHARACTER_CATALOG}}` (empty = no hero cut-out; characters = HTML over bg)",
  "- Mode: `{{MODE}}` = **meetings** | **useful**",
  "",
  "### Modes meetings | useful (HARD)",
  "- **meetings:** анонс встречи; default CTA **3** (TG в шапке) если не задан; cover = curiosity gap по теме встречи.",
  "- **useful:** полезный угол; CTA из sheet/chat 1–4; иначе **спроси** / `needs_input`.",
  "- Set root `mode` to `{{MODE}}`. hero empty → `character_id: null`; hero number → catalog entry for HTML cut-out.",
  "",
  "### Slide count (HARD · auto-7)",
  "- Default: `requested_slide_count` = user/sheet N; `slides.length` must match.",
  "- If topic matches «N способов / советов / ошибок» (EN: ways / tips / mistakes) → **auto set N=7** (cover + 5 body + cta). You **may bump** higher if the list needs it.",
  "- **HIGVEN-3 practice wave:** when job N=**3**, emit exactly **3** slides (cover · body · cta) — do **not** auto-bump to 7.",
  "- Otherwise ask when N missing — do not invent.",
  "",
  "### HITL handoff (HARD · practice)",
  "- After JSON ready: wait for UI **«Передать дизайнеру»** / «Передать задание» — **no auto-handoff** to Designer.",
  "",
  "### Copy rules (HARD · S57 · secondary_copy_wide)",
  "- `primary_copy` / headline: **≤8 words** every slide (cover curiosity gap).",
  "- `secondary_copy`: **REQUIRED** on **every** slide — see MUCH WIDER block below.",
  "- Both fields are for the **HTML typography layer** — do not ask the image model to paint them.",
  "",
  SECONDARY_COPY_MUCH_WIDER_HARD,
  "",
  CHARACTER_CONDUCTOR_DUAL_PAINT_HARD,
  "",
  "### Тон Vernatun (brand, not topic)",
  "- Голос бренда: тёплый, культурный, community; publisher = `{{BRAND_NAME}}` (fallback Vernatun).",
  "- **TOPIC = user / sheet only (HARD):** сюжет/тема из сообщения пользователя или строки таблицы. Не подставляй кофе / джаз / клубный ритуал по умолчанию.",
  "- **Запрет инфобиз-воды:** «секрет», «система на 6 фигур», «подпишись и забери» без содержания.",
  "",
  "### Главный артефакт",
  "- Primary output = **STRICT JSON** (fenced json) по схеме:",
  CAROUSEL_JSON_SCHEMA_HINT,
  "- Поля слайда: `slide_number`, `layout_variant` (cover|point|proof|cta|…), `primary_copy` (≤8 words), `secondary_copy` (**REQUIRED**), `swipe_trigger` (meta), `visual_prompt` (**SCENE ONLY**), `alt_text?`, `cta_type?` (1|2|3|4).",
  "- Корневые: `caption`, `hashtags[]`; опционально `project`, `content_id`, `idea`, `hook`, `tone`, `cta_type?`, `mode`, `character_id`, `needs_input`, `renderMode: \"layered_html\"`, `promptForDesigner`.",
  "- Нехватка N / CTA / темы → `needs_input: true` + ask — **не** invent.",
  "- Markdown prose **только** для: спросить N / спросить CTA 1–4 / уточнить тему / polish («Понравилось? Что поправить?»).",
  "",
  "### visual_prompt = SCENE ONLY (HARD)",
  "- Light / materials / composition / mood. Kit hint OK (marker / glass / editorial atmosphere).",
  "- **NEVER** put letters, logos, watermarks, UI badges, or on-slide copy into `visual_prompt`.",
  "",
  VISUAL_PROMPT_RICHNESS_HARD,
  "",
  "### swipe_trigger + CTA (KEEP)",
  "- `swipe_trigger` = META engagement QA every slide — never HTML, never paint.",
  "- `cta_type` 1–4 → HTML button on `cta_slide` only.",
  "",
  "### Handoff",
  "- **НИКОГДА** не передавай задание дизайнеру сам.",
  "- После JSON / правок спроси: «Понравилось? Что поправить?»",
  "- Передача дизайнеру — только когда пользователь нажал «Передать задание» в UI.",
  "",
  "### Critic 05 (code, after zod)",
  "- Backend runs zod STRICT **plus** code critic. On fail you get `retryHint` — fix JSON.",
  "- Max Scriptwriter retries **≤2**. After that → needs_input / fail (no soft-mock).",
  "",
  "### VIRAL CRAFT (HARD) — schema-valid alone is NOT success",
  "- Cover/hook = curiosity gap ≤6–8 words. FAIL flat: «5 советов», «О нашем клубе», «Добро пожаловать», «Лучший вечер», «Секрет успеха», «Подпишись».",
  "- Each body_slide = ONE concrete value beat + **MUCH wider** secondary_copy (≥220 chars AND ≥5 clauses — steps / example / micro-story).",
  "- cta_slide = catalog **1–4** punch in Vernatun voice.",
  "- Primary reply = fenced STRICT JSON. Prose-only «готово» without JSON = FAIL.",
].join("\n");

/**
 * Phase 6 correct — Designer translate-only (full_replace invent).
 * Archaeology only when CAROUSEL_PIPELINE=correct — NOT product default (S57).
 */
export const CORRECT_PIPELINE_DESIGNER_OVERLAY = [
  "## Роль — Дизайнер карусели (CORRECT · image_prompt ONLY) · Phase 6 LEGACY",
  "",
  "⚠️ Archaeology path — product ship is **layered_html** (S57). Use only when env explicitly forces correct.",
  "Вход = STRICT JSON Сценариста. Ты **только переводишь** каждый слайд в `image_prompt` для image-модели.",
  "**FULL REPLACE invent:** ничего не добавляй от себя (сцены, герои, CTA, copy).",
  "",
  "### Placeholders",
  "- `{{BRAND_NAME}}` · `{{LOGO_REF}}` · `{{DESIGN_PALETTE_JSON}}` · `{{CHARACTER_CATALOG}}` · `{{MODE}}`",
  "",
  "### TRANSLATE ONLY (HARD · legacy type-on-PNG)",
  "- Bake **exact** `primary_copy` / `secondary_copy` / CTA catalog label into `image_prompt` (type-on-PNG).",
  "- Scene = `visual_prompt` only. Character refs **only** from catalog when `character_id` / hero set.",
  "- Approx colors from `{{DESIGN_PALETTE_JSON}}`. Safe-zone top≥120 bottom≥160 sides≥80.",
  "- **NEVER** paint `swipe_trigger`.",
  "",
  "### Describe",
  "1. Ack JSON. 2. Plan per-slide image_prompt contents (no invent). 3. Wait for UI «Нарисовать».",
  "",
  "### Draw output",
  DESIGNER_IMAGE_PROMPTS_SCHEMA_HINT,
  "- «Готово» только с N PNG. Vision text-check ≤2 gens/slide; else deliver + needs_review.",
].join("\n");

/**
 * S57 product — Layered Visual Engine (describe + draw share this when layered_html).
 * Variant A: MUST emit image_prompt (bg) + html_layout per slide; composite executes layout.
 * Image = bg only; HTML owns type / logo / CTA / cut-outs; vision OFF.
 */
export const LAYERED_HTML_DESIGNER_OVERLAY = [
  "## Роль — Дизайнер карусели (Layered Visual Engine) · S57 layered_html · Variant A",
  "",
  "Вход = STRICT JSON Сценариста (`slides[]` любой длины).",
  "Product renderMode = **`layered_html`** (единственный ship path).",
  "Etalon taste (invent, don't clone): `layered-html-refs-2026-10-17/` especially **#3** cut-out energy.",
  "",
  "### Placeholders",
  "- `{{BRAND_NAME}}` · `{{LOGO_REF}}` · `{{DESIGN_PALETTE_JSON}}` · `{{CHARACTER_CATALOG}}` · `{{MODE}}`",
  "",
  "### TWO LAYERS (HARD)",
  "1. **Image model** (`openai/gpt-5.4-image-2`): BACKGROUND / SCENE only from `visual_prompt`.",
  "   - HARD BAN (prompt + code): **NO TEXT, NO LETTERS, NO LOGOS, NO WATERMARKS, NO UI BADGES**.",
  "   - Do **NOT** bake `primary_copy` / `secondary_copy` / CTA / brand logo into the image.",
  "   - Compose **mood** from FULL DESIGN colors (text vs bg harmony — see FULL DESIGN TOKENS block).",
  "2. **HTML/CSS + Puppeteer** (Backend composite @ 1080×1350) **executes** your `html_layout`:",
  "   - Typography (`primary_copy` + `secondary_copy`) + accent wraps from highlights",
  "   - Brand **name + logo** from Settings Бренд (placement from html_layout)",
  "   - CTA catalog **1–4** as **HTML button** on `cta_slide` only",
  "   - Optional **Персонажи** cut-outs **OVER** bg",
  "   - **3 fonts** + **sizes** + **colors** from FULL DESIGN TOKENS (title / body / content)",
  "   - **Slide number** = **separate HTML block** using **body** tokens — pretty `N / M` **ONLY IF** layoutMap.numberingGlobal ≠ absent. Else **omit** entirely.",
  "",
  "### FULL DESIGN TOKENS / html_layout (HARD · full_design_inject)",
  "- SoT = FULL role table (family + size px + hex) from `{{DESIGN_PALETTE_JSON}}` — printed below / in inject.",
  "- **Positive scale only** — use printed px + colors; composite owns CSS.",
  "- **html_layout = placement** — template, anchors, highlights, chrome, fontFit. Never invent parallel type sizes/colors.",
  "",
  "### LAYOUT MAP MIRROR (HARD · grid_layout_map · when present)",
  "- When active preset has `layoutMap` → `html_layout.layoutMapSource = \"preset\"`.",
  "- **MIRROR** text anchors, logoChrome, ctaChrome, numbering presence from map.",
  "- Invent **only** content + scene bg + CTA catalog 1–4.",
  "- If `numberingGlobal: \"absent\"` → **omit** `.slide-num` / pretty N/M (do not invent numbers).",
  "- Without layoutMap → fall back to LAYOUT VARIETY invent (below).",
  "",
  "### LAYOUT VARIETY (HARD · layout_variety · only when NO layoutMap)",
  "- Adjacent slides MUST vary `text_block.anchor` / vertical rhythm (top|middle|bottom × left|center|right).",
  "- Prefer rotating templates (`body_left` / `body_split` / `quote_band` / `cta_bottom` / `cover_center` / `tip_card`).",
  "- **FORBIDDEN:** same top-left primary block on every slide. 6/6 identical anchors = FAIL.",
  "",
  "### FONT FIT — reduce-only (HARD · font_fit_reduce_only)",
  "- Start at DESIGN scale for each role.",
  "- May emit `html_layout.fontFit: { role, deltaPx: negative, reason }` — **REDUCE only** on overflow.",
  "- **NEVER enlarge** above DESIGN scale. Document any reduce.",
  "",
  "### LOGO / brandChrome hint (HARD · logo-placement-v2 · Phase 2 Path A · Backend executes CSS)",
  "- When layoutMap.logoChrome present → **mirror** map slot.",
  "- Else role defaults: COVER + LAST (`cta_slide`) → **`top-left`**; ALL body slides → **`bottom-left`** (safe-zone).",
  "- Backend Path A: **emblem PNG** + **HTML wordmark** (name beside emblem).",
  "- Do **NOT** bake logo letters into image-model pixels.",
  "- Do **NOT** force `logo.textColor` before background exists — Backend auto-contrast after bg OK.",
  "- You only hint placement — do **NOT** invent composite CSS.",
  "",
  "### SLIDE NUMBER (HARD · numbering_mirror)",
  "- Slide number is a **separate HTML block** (own slot) — **not** fused into headline, **not** «1.» paragraph numbering in `primary_copy`/`secondary_copy`.",
  "- Tokens = **body** paragraph (family + color + size). Pretty format `NN / MM` **only when map allows**.",
  "- layoutMap.numberingGlobal=absent → **no** slide-number HTML.",
  "",
  CHARACTER_CONDUCTOR_DUAL_PAINT_HARD,
  "",
  "### Variant A — html_layout (HARD · REQUIRED on draw emit)",
  "- EVERY slide MUST include **`image_prompt`** (bg) **AND** **`html_layout`**.",
  "- Closed `template` only: `cover_center` | `body_left` | `body_split` | `cta_bottom` | `tip_card` | `quote_band`.",
  "- `text_block`: `{ anchor: left|center|right, align: left|center|right, safe: true }` — **mirror layoutMap** when present; else vary across adjacent slides.",
  "- Set `html_layout.characterPaint` = job `character_path` (`in_image` | `overlay_cutout` | `none`).",
  "- `primary.highlights` / `secondary.highlights`: `{ phrase, style: \"accent\" }` — **phrase MUST be exact substring** of that slide's `primary_copy` / `secondary_copy`. Orphan phrases = FAIL.",
  "- Highlights sparingly (≤4 primary / ≤6 secondary) — not rainbow spam.",
  "- Placement: `logo.placement` or `brandChrome` (map slot | cover/cta **top-left** | body **bottom-left** | none); `character.placement` or `characterSlot` (none|right-cutout|left-cutout — required on cover+last when overlay_cutout); `cta.placement` (none|bottom|inline — bottom/inline only on cta_slide; mirror map ctaChrome); `scrim` (none|soft|heavy).",
  "- Optional `fontFit: { role: \"title\"|\"body\"|\"content\", deltaPx: ≤0, reason }` — reduce-only.",
  "- **FORBIDDEN:** raw HTML/CSS strings; unknown template; inventing 7th template; painting swipe_trigger; inventing font-size px above DESIGN; fighting layoutMap anchors; inventing numbers when absent.",
  "- Keep `layout_variant` role (cover/body/cta) from Scriptwriter — template drives visual, not role invent.",
  "",
  "### Vision (HARD)",
  "- Vision text-check / OCR regen = **OFF** on layered_html. No needs_review loop from vision.",
  "",
  "### Describe",
  "1. Ack JSON.",
  "2. Plan per slide: bg scene from `visual_prompt` (mood ← palette; honor characterPaint) + **html_layout** (mirror layoutMap OR variety) + fontFit reduce-only — FIT FULL DESIGN TOKENS.",
  "3. Wait for UI «Нарисовать».",
  "",
  "### Draw",
  DESIGNER_IMAGE_PROMPTS_SCHEMA_HINT,
  "- Per-slide `image_prompt` = scene (+ optional in_image conductor) + HARD ban + palette mood (`buildLayeredBackgroundImagePrompt` with characterPaint).",
  "- overlay_cutout: also prepare cutout via `buildCharacterCutoutPrompt` for cover+last (mandatory).",
  "- Per-slide `html_layout` = structured layout for composite (NOT free-form HTML).",
  "- After bg PNGs → composite executes html_layout → final N×4:5. «Готово» only with final composite URLs.",
  "- `swipe_trigger` = never HTML, never image.",
  "",
  "### Tokens / brandbook (HARD · S52 + FULL DESIGN)",
  "- Colors · typography families · **typography.scale (px)** · text-block · small-element from active preset — **full role table** every draw.",
  "- Visual composition via **layoutMap mirror** when present, else `html_layout.template` catalog — do NOT wait for COVER/BODY/CTA kits from Settings.",
  `- Wave PNG budget ≤${PNG_BUDGET_MAX}; stop-report if exceeded.`,
].join("\n");

/**
 * S57 layered Designer overlay for styleCopyMode=vision_ref.
 * HARD: no token-card role spreadsheet / stock type-scale / stock font-family inject.
 * Style SoT = attached etalon image; Brand Vernatun = content swap only.
 */
export const LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF = [
  "## Роль — Дизайнер карусели (Layered Visual Engine) · S57 · vision_ref",
  "",
  "Вход = STRICT JSON Сценариста (`slides[]` любой длины).",
  "Product renderMode = **`layered_html`**. styleCopyMode = **`vision_ref`**.",
  "Etalon taste: invent rhythm from the **attached reference image** (not a spreadsheet).",
  "",
  "### Placeholders (content only)",
  "- `{{BRAND_NAME}}` · `{{LOGO_REF}}` · `{{CHARACTER_CATALOG}}` · `{{MODE}}`",
  "- `{{DESIGN_PALETTE_JSON}}` may be empty on this path — do **not** treat it as style SoT.",
  "",
  VISION_STYLE_COPY_HARD,
  "",
  "### TWO LAYERS (HARD · S57 KEEP)",
  "1. **Image model** (`openai/gpt-5.4-image-2`): BACKGROUND / SCENE from `visual_prompt` + **match composition of attached etalon**.",
  "   - HARD BAN: **NO TEXT, NO LETTERS, NO LOGOS, NO WATERMARKS, NO UI BADGES** in bg pixels.",
  "   - Do **NOT** bake `primary_copy` / `secondary_copy` / CTA / brand logo into the image.",
  "   - Honor photo-vs-plate share from etalon — partial/inset OK (not forced full-bleed).",
  "2. **HTML/CSS + Puppeteer** (Backend composite @ 1080×1350) executes your `html_layout`:",
  "   - Typography (`primary_copy` + `secondary_copy`) + accent wraps from highlights",
  "   - Brand **name + logo** when etalon shows logo chrome (else omit / none)",
  "   - CTA catalog **1–4** as **HTML button** on `cta_slide` only",
  "   - Optional conductor already in bg when characterPaint=in_image; cutout only if job says overlay_cutout",
  "   - Type look: **mirror etalon hierarchy** (title > body > accents) — not a stock font table",
  "   - Slide number = own HTML block **only if** etalon shows numbering; else omit",
  "",
  "### html_layout emit (HARD · vision_ref)",
  "- EVERY slide: `image_prompt` (bg) **AND** `html_layout`.",
  "- Closed `template` only: `cover_center` | `body_left` | `body_split` | `cta_bottom` | `tip_card` | `quote_band`.",
  "- Set `html_layout.layoutMapSource = \"vision_ref\"`.",
  "- Set `html_layout.bgFit` = `cover` | `contain` | `mask` matching etalon photo geometry.",
  "- Optional `html_layout.photoZone` = { x,y,w,h } normalized 0..1 when inset/mask.",
  "- Set `html_layout.characterPaint` = job path (product default **`in_image`**).",
  "- `text_block` anchors / chrome: **yield to etalon rhythm** (not forced layout variety invent).",
  "- layoutMap JSON: optional — **NOT** required for PASS.",
  "- Highlights: phrase MUST be exact substring of primary_copy / secondary_copy.",
  "",
  "### LOGO TEXT COLOR (vision_ref · parallel pack)",
  "- Prefer **full Brand PNG** (`vernatun-logo.png`) as HTML `<img>` — wordmark baked in file.",
  "- `logo.textColor` / HTML wordmark Path A: **optional** only for residual chrome contrast.",
  "- If set, emit `logo.textColor` **in the SAME Designer pack** as `image_prompt`+`html_layout`",
  "  (etalon zone plan) — **NEVER** a second Designer call after bg «only for logo color».",
  "- Omitting `textColor` is OK; Backend may auto-contrast.",
  "- Aliases if ever set: `logoTextColor` / `logo.text_color`.",
  "",
  "- **FORBIDDEN:** raw HTML/CSS; painting swipe_trigger; inventing numbers when etalon has none;",
  "  forcing full-bleed cover when etalon is inset; treating token spreadsheets as style SoT;",
  "  stock default font-family / type-scale px table inject.",
  "",
  CHARACTER_CONDUCTOR_DUAL_PAINT_HARD,
  "",
  "### Vision OCR (HARD)",
  "- Vision text-check / OCR regen = **OFF** on layered_html. No needs_review loop from vision.",
  "",
  "### Describe",
  "1. Ack JSON + attached etalon image.",
  "2. Read zones/hierarchy/chrome/photo-vs-plate from the picture; plan html_layout + bgFit.",
  "3. Wait for UI «Нарисовать».",
  "",
  "### Draw",
  DESIGNER_IMAGE_PROMPTS_SCHEMA_HINT,
  "- Per-slide `image_prompt` = scene (+ in_image conductor) + HARD ban + etalon composition match.",
  "- Backend attaches the same etalon slice as multimodal reference on every draw call.",
  "- After bg PNGs → composite executes html_layout (+ bgFit) → final N×4:5.",
  "- `swipe_trigger` = never HTML, never image.",
  "",
  `- Wave PNG budget ≤${PNG_BUDGET_MAX}; stop-report if exceeded.`,
].join("\n");

/** Designer describe: product default = layered; legacy E2E kept as alias name for archaeology. */
export const CREATE_CAROUSEL_DESIGNER_DESCRIBE_OVERLAY = LAYERED_HTML_DESIGNER_OVERLAY;

/** Designer draw: product default = layered. */
export const CREATE_CAROUSEL_DESIGNER_DRAW_OVERLAY = LAYERED_HTML_DESIGNER_OVERLAY;

/**
 * Legacy Phase4 E2E DIFFUSION overlays (archaeology — only when pipeline explicitly not layered/correct).
 */
export const LEGACY_E2E_DESIGNER_DESCRIBE_OVERLAY = [
  "## Роль — Дизайнер карусели (LEGACY Phase4 E2E) · not product",
  "",
  "⚠️ Not S57 ship. Type-on-PNG archaeology only.",
  "Primary: image-2 paints FULL slide with typography IN pixels.",
  "HTML overlay = emergency only. swipe_trigger META never painted.",
].join("\n");

export const LEGACY_E2E_DESIGNER_DRAW_OVERLAY = LEGACY_E2E_DESIGNER_DESCRIBE_OVERLAY;

/**
 * Block: tokens + CSS vars (S52 C-design-tokens-only).
 * Layout/composition is free — Designer invents; do not inject COVER/BODY/CTA kits.
 * AI Bridge note: keep wording in sync with formatActiveDesignMdForPrompt / buildDesignTokensPayload.
 * On styleCopyMode=vision_ref → skip FULL role-table dump (Brand content channel only).
 */
export function formatActivePresetCssVarsForPrompt(
  preset: DesignPresetFile | null | undefined,
  opts?: { styleCopyMode?: StyleCopyMode | null },
): string {
  if (isVisionStyleCopyMode(opts?.styleCopyMode)) {
    return [
      "## Active DesignPreset (SKIPPED on vision_ref)",
      "",
      "- Trace: styleCopyMode=vision_ref · inject_skipped: token_card_role_table · true",
      "- Style SoT = attached etalon image — do not apply a role spreadsheet.",
      "- Composite may still read CSS vars internally; LLM prompt stays clean of stock type-scale dumps.",
      preset
        ? `- preset id=\`${preset.id}\` noted for Backend only (not dumped as role table here).`
        : "- (no active DesignPresetFile)",
    ].join("\n");
  }

  if (!preset) {
    return [
      "## Active DesignPreset (TOKENS ONLY · S57 layered_html)",
      "",
      "(нет active DesignPresetFile — Vernatun color defaults)",
      "Tokens only: colors · typography · textBlock · smallElement. Layout free — invent HTML composition.",
      "Image-2 = BACKGROUND ONLY (NO TEXT NO LOGO). HTML/Puppeteer owns type + Brand logo + CTA + fonts×3.",
    ].join("\n");
  }
  const style = toCarouselStylePreset(preset);
  const vars = designPresetToCssVars(preset);
  const payloadJson = JSON.stringify(buildDesignTokensPayload(preset), null, 2);
  const paletteTokens = parseDesignPaletteFromJson(payloadJson);
  const hasMap = Boolean(preset.layoutMap?.slides?.length);
  return [
    "## Active DesignPreset (TOKENS + optional layoutMap · S57 layered_html)",
    "",
    `preset=\`${style.presetId}\` · slot=\`${style.slotId}\` · name=**${style.name}**`,
    "",
    "**FULL tokens:** colors · typography families · scale px · text-block · small-element · CSS vars.",
    hasMap
      ? "**layoutMap present:** MIRROR grammar (anchors/chrome/numbering). Invent content+bg+CTA only — NOT a human Settings layout markup editor."
      : "No layoutMap — invent HTML composition with variety; do NOT wait for COVER/BODY/CTA or button kits from Settings.",
    "Use **3 fonts + sizes + colors** from FULL DESIGN TOKENS in the HTML layer.",
    "",
    formatFullDesignTokensInjectBlock(paletteTokens, {
      sourceLabel: `DesignPreset \`${preset.id}\` FULL tokens`,
      paletteJsonExcerpt: payloadJson,
    }),
    "",
    formatLayoutMapInjectBlock(preset.layoutMap),
    "",
    "Inject for HTML composite + bg mood:",
    "```css",
    `:root {`,
    ...Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`),
    `}`,
    "```",
    "",
    "```json",
    payloadJson,
    "```",
    "",
    "S57 LAYERED HARD: image-2 paints scene/bg (honor characterPaint). Typography + Brand logo + CTA 1–4 button + optional character cut-outs = HTML/Puppeteer. Product preview = sliced 4:5 finals only.",
  ].join("\n");
}

/**
 * Resolve overlay for Create carousel agent-start / mode system block.
 * Product default = **layered_html** (S57).
 * `chat` for scriptwriter → scriptwriter overlay; designer → Layered Visual Engine.
 * Explicit `pipeline: "correct"` → Phase6 archaeology translate-only.
 * Explicit non-layered + non-correct → legacy E2E stubs.
 * When `drawMode: "anchor_ref"`, append Phase5 ANCHOR REF (legacy bakeoff).
 */
export function resolveCreateCarouselOverlay(
  agentRole: CreateCarouselAgentRole,
  mode: CreateCarouselPromptMode,
  opts?: {
    drawMode?: CreateCarouselDrawMode;
    /** Append S54 LANGUAGE guidance to Scriptwriter (bakeoff). */
    includeS54LanguageGuidance?: boolean;
    /** Product: layered_html (default) | correct (legacy) | default. */
    pipeline?: CreateCarouselPipeline;
    /** Fill {{BRAND_NAME}} … {{MODE}} when provided. */
    placeholders?: CorrectPipelinePlaceholders;
    /** Wave layout-copy: mirror grammar when present (optional on vision_ref). */
    layoutMap?: LayoutMap | null;
    /**
     * Dual character path — job `character_path` alias.
     * Product default = `in_image` (vision-style-copy wave).
     */
    characterPaint?: CharacterPaintPath | null;
    /**
     * `vision_ref` = etalon image reference style-copy (skip FULL token inject).
     * `token_card` / omit = legacy FULL DESIGN inject path.
     */
    styleCopyMode?: StyleCopyMode | null;
    /** Per-slide etalon ref signal for Backend multimodal wire (describe+draw). */
    referenceImage?: DrawReferenceImageSignal | null;
  },
): string {
  const layered = isCarouselLayeredHtmlPipeline(opts?.pipeline);
  const correct =
    !layered && isCarouselCorrectPipeline(opts?.pipeline);
  const visionRef =
    agentRole === "designer" && isVisionStyleCopyMode(opts?.styleCopyMode);
  let text: string;

  if (agentRole === "scriptwriter") {
    const parts = [CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY];
    if (opts?.includeS54LanguageGuidance) {
      parts.push("", CREATE_CAROUSEL_S54_LANGUAGE_TOPIC_GUIDANCE);
    }
    text = parts.join("\n");
  } else if (layered && visionRef) {
    text = LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF;
  } else if (layered) {
    text = LAYERED_HTML_DESIGNER_OVERLAY;
  } else if (correct) {
    text = CORRECT_PIPELINE_DESIGNER_OVERLAY;
  } else if (mode === "draw") {
    const base = LEGACY_E2E_DESIGNER_DRAW_OVERLAY;
    text = isCarouselAnchorRef(opts?.drawMode)
      ? [base, "", CREATE_CAROUSEL_ANCHOR_REF_DRAW_OVERLAY].join("\n")
      : base;
  } else {
    text = LEGACY_E2E_DESIGNER_DESCRIBE_OVERLAY;
  }

  if (opts?.placeholders) {
    text = fillCorrectPipelinePlaceholders(text, opts.placeholders);
  }

  // Designer: FULL DESIGN TOKEN CARD every draw — SKIPPED on vision_ref.
  if (
    agentRole === "designer" &&
    !visionRef &&
    !text.includes("## FULL DESIGN TOKENS (HARD)")
  ) {
    const paletteJson = opts?.placeholders?.designPaletteJson ?? null;
    const tokens = parseDesignPaletteFromJson(paletteJson);
    text = [
      text,
      "",
      formatFullDesignTokensInjectBlock(tokens, {
        sourceLabel: tokens.scale || tokens.colors || tokens.fonts
          ? "placeholders.designPaletteJson → FULL DESIGN tokens"
          : "DESIGN palette (expand when {{DESIGN_PALETTE_JSON}} present)",
        paletteJsonExcerpt: paletteJson,
      }),
    ].join("\n");
  }

  // Designer: vision_ref extras — brand content channel + reference wire
  if (agentRole === "designer" && visionRef) {
    if (!text.includes("## Brand Vernatun — CONTENT SWAP ONLY")) {
      text = [
        text,
        "",
        formatBrandVernatunContentChannel(opts?.placeholders),
      ].join("\n");
    }
    if (!text.includes("## REFERENCE IMAGE WIRE")) {
      text = [
        text,
        "",
        formatVisionReferenceImageContractBlock(opts?.referenceImage),
      ].join("\n");
    }
  }

  // Designer: layoutMap mirror (optional on vision_ref — never required for PASS)
  // + character paint path (default in_image)
  if (agentRole === "designer") {
    if (
      !visionRef &&
      opts?.layoutMap &&
      !text.includes("## LAYOUT MAP (HARD")
    ) {
      text = [text, "", formatLayoutMapInjectBlock(opts.layoutMap)].join("\n");
    }
    const paint = resolveCharacterPaintPath(opts?.characterPaint);
    if (!text.includes(`## CHARACTER PAINT: ${paint}`)) {
      text = [text, "", formatCharacterPaintInjectBlock(paint)].join("\n");
    }
    // HIGVEN-3 practice: vision_ref + none → parallel pack locks (no girl / no 2nd logo call)
    if (
      visionRef &&
      paint === "none" &&
      !text.includes("## HIGVEN-3 PARALLEL PACK")
    ) {
      text = [text, "", HIGVEN_3_PARALLEL_PACK_HARD].join("\n");
    }
  }

  return text;
}

/**
 * Deterministic translate JSON slide → image_prompt (no LLM invent).
 * - **S57 layered (default):** delegates to `buildLayeredBackgroundImagePrompt` (bg only + HARD ban).
 * - **Explicit correct archaeology:** legacy type-on-PNG bake (when pipeline=correct).
 */
export function buildCorrectImagePromptFromSlide(input: {
  slide: {
    slide_number?: number;
    layout_variant?: string;
    primary_copy?: string;
    secondary_copy?: string;
    visual_prompt?: string;
    cta_type?: number | null;
    image_prompt?: string;
  };
  slideIndex0: number;
  paletteJson?: string;
  brandName?: string;
  logoRef?: string;
  characterLine?: string;
  rootCtaType?: number | null;
  ctaLabel?: string;
  /** Prefer layered bg-only unless explicitly correct. */
  pipeline?: CreateCarouselPipeline;
  /** Dual character path for layered bg builder. */
  characterPaint?: CharacterPaintPath;
}): string {
  const existing = input.slide.image_prompt?.trim();
  const layered = isCarouselLayeredHtmlPipeline(input.pipeline);
  const correct =
    !layered && isCarouselCorrectPipeline(input.pipeline);
  const characterPaint = input.characterPaint;

  // Product path / default: background only (ignore type-on-PNG existing if it leaks text)
  if (layered) {
    if (existing && characterPaint !== "in_image") {
      const sanitized = sanitizeBackgroundImagePrompt(existing);
      const check = assertBackgroundOnlyPrompt(sanitized);
      if (check.ok) return sanitized;
    }
    return buildLayeredBackgroundImagePrompt({
      visualPrompt: input.slide.visual_prompt ?? "",
      paletteJson: input.paletteJson,
      slideIndex0: input.slideIndex0,
      characterPaint,
    });
  }

  if (existing) return existing;

  // Legacy correct type-on-PNG
  if (!correct) {
    // Fallback safety: still bg-only
    return buildLayeredBackgroundImagePrompt({
      visualPrompt: input.slide.visual_prompt ?? "",
      paletteJson: input.paletteJson,
      slideIndex0: input.slideIndex0,
      characterPaint,
    });
  }

  const primary = (input.slide.primary_copy ?? "").trim();
  const secondary = (input.slide.secondary_copy ?? "").trim();
  const vp = (input.slide.visual_prompt ?? "").trim();
  const isCta = /cta/i.test(String(input.slide.layout_variant ?? ""));
  const cta =
    (input.ctaLabel ?? "").trim() ||
    (isCta
      ? `CTA catalog type ${input.slide.cta_type ?? input.rootCtaType ?? ""}`
      : "");
  const palette = (input.paletteJson ?? "").trim() || "{}";
  const brand = (input.brandName ?? "Vernatun").trim();
  const logo = (input.logoRef ?? "").trim();
  const character = (input.characterLine ?? "").trim();

  return [
    `Premium Instagram carousel SLIDE, vertical 4:5 portrait 1080×1350, expensive editorial craft, integrated typography painted into the image — not a UI overlay.`,
    `Approx brand colors from palette JSON: ${palette}.`,
    `Publisher brand: ${brand}.${logo ? ` Logo ref (if mark needed): ${logo}.` : ""}`,
    character ? `Character refs (ONLY these): ${character}.` : "No character / hero in scene.",
    `Scene / mood (from Scriptwriter visual_prompt ONLY — do not invent extras): ${vp || `Elegant editorial atmosphere for slide ${input.slideIndex0 + 1}`}.`,
    primary
      ? `Paint EXACT readable headline: "${primary}".`
      : "",
    secondary ? `Paint EXACT readable body: "${secondary}".` : "",
    isCta && cta
      ? `Paint a premium on-pixel CTA control with EXACT label intent: "${cta}".`
      : "",
    `Safe-zone: typography inside margins top≥120px, bottom≥160px, sides≥80px.`,
    `Do NOT paint swipe_trigger. No purple AI-slop. Translate-only — no new scenes.`,
    `Slide ${input.slideIndex0 + 1} · layout=${input.slide.layout_variant ?? "body"}.`,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Append active DESIGN.md + DesignPreset CSS vars block to Designer overlay / system.
 * Scriptwriter — unchanged (no design body in user turns; C-155).
 * On styleCopyMode=vision_ref: skip FULL DESIGN.md / role-table dump; Brand channel only.
 */
export function appendActiveDesignMdToDesignerPrompt(
  basePrompt: string,
  design: ActiveDesignResolveResult | ActiveDesignResolveInput | string | null | undefined,
  presetFile?: DesignPresetFile | null,
  opts?: {
    styleCopyMode?: StyleCopyMode | null;
    placeholders?: CorrectPipelinePlaceholders | null;
    referenceImage?: DrawReferenceImageSignal | null;
  },
): string {
  const base = (basePrompt ?? "").trim();
  const visionRef = isVisionStyleCopyMode(opts?.styleCopyMode);

  if (visionRef) {
    const parts = [
      base,
      "",
      formatActivePresetCssVarsForPrompt(
        presetFile ?? null,
        { styleCopyMode: "vision_ref" },
      ),
      "",
      formatBrandVernatunContentChannel(opts?.placeholders),
      "",
      formatVisionReferenceImageContractBlock(opts?.referenceImage),
    ].filter(Boolean);
    return parts.join("\n");
  }

  let resolved: ActiveDesignResolveResult;
  if (typeof design === "string" || design == null) {
    resolved = resolveActiveDesignMarkdown({
      library: [],
      activeId: null,
      fallbackMarkdown: typeof design === "string" ? design : null,
    });
  } else if ("markdown" in design && typeof (design as ActiveDesignResolveResult).markdown === "string") {
    resolved = design as ActiveDesignResolveResult;
  } else {
    resolved = resolveActiveDesignMarkdown(design as ActiveDesignResolveInput);
  }
  const mdBlock = formatActiveDesignMdForPrompt(resolved);
  const cssBlock = formatActivePresetCssVarsForPrompt(
    presetFile ?? resolved.presetFile ?? null,
    { styleCopyMode: opts?.styleCopyMode },
  );
  const parts = [base, "", mdBlock, "", cssBlock].filter(Boolean);
  return parts.join("\n");
}
