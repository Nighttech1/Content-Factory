/**
 * S57 LAYERED HTML (product default): bg image (no text/logo) + HTML/CSS
 * Puppeteer composite → PNG 1080×1350. Vision OFF. renderMode: layered_html.
 *
 * Archaeology (explicit env only):
 * - Phase6 correct (`CAROUSEL_PIPELINE=correct`): type-on-PNG + vision ≤2
 * - Phase4/5 E2E / anchor_ref when layered gate is OFF
 *
 * Legacy helpers: carouselHtmlBuilder / screenshotHtmlToPng still used by layered.
 * Never log secrets.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { CarouselHandoffJson, CarouselSlideJson } from "@/lib/studio/carousel-json-contract";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  generateAggregatorImage,
  generateAggregatorImageWithOptionalRef,
  type AggregatorImageContinuity,
} from "@/lib/llm/aggregator-images";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";
import {
  assertBackgroundOnlyPrompt,
  buildLayeredBackgroundImagePrompt,
  buildVisionRefBackgroundImagePrompt,
  buildAnchorRefCoverPromptPrefix,
  buildAnchorRefFollowupPromptPrefix,
  buildCorrectImagePromptFromSlide,
  buildMasterStyleLockedBlock,
  isCarouselAnchorRef,
  isCarouselCorrectPipeline,
  isCarouselLayeredHtmlPipeline,
  sanitizeBackgroundImagePrompt,
  buildCharacterCutoutPrompt,
  DEFAULT_CHARACTER_PAINT,
  type CharacterPaintPath,
  type CreateCarouselDrawMode,
  type CreateCarouselPipeline,
  type CorrectPipelinePlaceholders,
  type StyleCopyMode,
  type DrawReferenceImageSignal,
} from "@/lib/studio/create-carousel-prompts";
import {
  collectSlotImagePaths,
  mapSlideToRefSlot,
  resolveStyleCopySlots,
  slotRefPath,
  slotRefToDrawSignal,
  type StyleCopyPackId,
  type StyleCopySlotPack,
} from "@/lib/studio/style-copy-slots";
import type { DesignerPromptDump } from "@/lib/studio/designer-variant-a-pack";
import {
  checkCarouselSlideTextVision,
  canRetryVisionSlideGen,
  MAX_VISION_GENS_PER_SLIDE,
} from "@/lib/studio/carousel-vision-text-check";
import { ensureCarouselFonts } from "@/lib/studio/carousel-fonts";
import {
  BRAND_EMBLEM_REF,
  buildLayeredSlideHtml,
  resolveAssetUrlForPlaywright,
  resolveCharacterPlacement,
} from "@/lib/studio/carousel-layered-composite";
import { ensureDesignerVariantAPack } from "@/lib/studio/designer-variant-a-pack";
import {
  excerptDesignForPrompt,
  excerptPresetForPrompt,
  readSyncedActiveDesign,
} from "@/lib/settings/design-active-server";
import { getBrandSettings } from "@/lib/settings/brand-store";
import { SEED_ADMIN_USER_ID } from "@/lib/db/actor";
import {
  type DesignPresetFile,
  createDefaultVernatunPreset,
  cssVarsToInlineStyle,
  designPresetToCssVars,
} from "@/lib/settings/design-preset";
import {
  type CarouselSlideRole,
  normalizeCarouselSlideRole,
} from "@/types/design";
import { toPreviewUrl } from "@/lib/studio/carousel-media-urls";
import { createCarouselErrorMessage } from "@/lib/studio/agent-chat-soft-ack";
import {
  commitPngBudget,
  copySlidesToWaveArtifacts,
  reservePngBudget,
} from "@/lib/studio/wave-visual-artifacts";
import {
  cropSinglePoseFromSheet,
  defaultPoseCellForSlide,
  knockoutCutoutBackground,
  looksLikeCharacterSheetUrl,
  materializeCutoutUrlToFile,
} from "@/lib/studio/character-cutout-pose";

export { isCarouselAnchorRef };
export type { CarouselSlideRole };
export { normalizeCarouselSlideRole };

export const CAROUSEL_FRAME_WIDTH = 1080;
export const CAROUSEL_FRAME_HEIGHT = 1350;
export const CAROUSEL_SAFE = {
  top: 120,
  bottom: 160,
  left: 80,
  right: 80,
} as const;

/** LayoutVariant labels for kits (Cover / BodyCard / CTA). */
export type LayoutVariant = "Cover" | "BodyCard" | "CTA";

export type CarouselHtmlBuilderSlideIn = {
  role?: CarouselSlideRole | "point" | "proof" | "cta" | string;
  headline?: string;
  body?: string;
  visual_prompt?: string;
  primary_copy?: string;
  secondary_copy?: string;
  /** Short CTA pill label (cta_slide) — never truncate long secondary into the pill. */
  captionLine?: string;
  cta_label?: string;
  layout_variant?: string;
  alt_text?: string;
};

/**
 * LIVE-GEN / critic override — distinct overlay packs that skip bento telemetry
 * (espresso plate, RITUAL CLOCK, HOOK chips). Default pipeline unchanged.
 */
export type LiveGenKitAesthetic =
  | "clean_poster"
  | "cinematic_scene"
  | "tip_cards";

export type CarouselHtmlBuilderInput = {
  slides: CarouselHtmlBuilderSlideIn[];
  preset: DesignPresetFile;
  designMd?: string;
  /** Already merged cssVarOverrides preferred */
  cssVars?: Partial<Record<string, string>>;
  /** Optional remote background URLs aligned with slides */
  backgroundUrls?: (string | null | undefined)[];
  /** When set — use aesthetic kit instead of dark_notes / bento_glass chrome */
  kitAesthetic?: LiveGenKitAesthetic;
  /** Default CTA pill for clean_poster (every slide) / tip_cards finale */
  defaultCtaLabel?: string;
};

export type CarouselHtmlBuilderFrame = {
  index: number; // 1-based
  role: CarouselSlideRole;
  layoutVariant: LayoutVariant;
  html: string;
  pngPath?: string;
  primary: string;
  secondary: string;
};

export type CarouselHtmlBuilderOutput = {
  frames: CarouselHtmlBuilderFrame[];
  cssVarsApplied: Record<string, string>;
};

export type CarouselHtmlSlideOut = {
  id: string;
  index: number;
  imageUrl: string;
  caption: string;
  alt_text: string;
  role?: CarouselSlideRole;
};

/** Per-slide image-LLM prompt capture (CAROUSEL_PROMPT_TRACE / diagnostics). */
export type CarouselDrawImagePromptTrace = {
  slide: number;
  image_llm: string | "skipped";
  exact_prompt: string;
  html_inputs_summary: string;
};

export type RunCreateCarouselDrawResult =
  | {
      ok: true;
      slides: CarouselHtmlSlideOut[];
      model: string;
      /** S57 product: layered_html. Archaeology: e2e / correct / anchor / legacy */
      renderMode:
        | "layered_html"
        | "e2e_diffusion"
        | "correct_pipeline"
        | "anchor_ref_pipeline"
        | "html_png"
        | "bg_proxy_fallback"
        | "legacy_html_overlay";
      /** C-audit-03 / Phase4: how many slides called image API. */
      bgImageCalls?: number;
      /** Phase4 success: false. Legacy HTML-first: true. */
      htmlFirst?: boolean;
      /** Phase4: typography painted in image pixels. */
      e2eTextInImage?: boolean;
      /** Phase5: how slides 2–N stayed continuous with cover. */
      anchorContinuity?: AggregatorImageContinuity | "cover_only";
      cssVarsApplied?: Record<string, string>;
      artifactDir?: string;
      budget?: { count: number; max: number };
      /**
       * Exact prompts sent to image API (same string as generateAggregatorImage).
       * Index-aligned with slides; empty string when image_llm skipped.
       */
      imagePrompts?: string[];
      /** Richer per-slide dump when CAROUSEL_PROMPT_TRACE=1. */
      promptTrace?: CarouselDrawImagePromptTrace[];
      /** Phase5: frozen MASTER STYLE block used for slides 2–N. */
      masterStyleBlock?: string;
      /**
       * Phase 6: vision failed after ≤2 gens — PNG still delivered.
       * Backend should persist Draft.needs_review + RED log.
       */
      needsReview?: boolean;
      /** Per-slide vision failure reasons (index-aligned; empty = pass). */
      visionFailures?: Array<{
        slide: number;
        reason: string;
        gensUsed: number;
      }>;
      /** Variant A — handoff after Designer pack merge (html_layout on slides). */
      handoffWithLayouts?: CarouselHandoffJson;
      designerPackSource?: string;
      /** Full Designer system+user (vision_ref ban proof for smoke timeline). */
      designerPromptDump?: DesignerPromptDump;
      styleCopyMode?: StyleCopyMode;
      styleCopyPackId?: string;
      styleCopySlotMap?: Array<{
        slide: number;
        slot: string;
        refPath?: string;
        refKind?: string;
      }>;
    }
  | {
      ok: false;
      source: "error";
      error: { code: string; message: string };
      designerPromptDump?: DesignerPromptDump;
    };

/** CTA catalog 1–4 → short on-slide pill (C-scriptwriter-swipe-cta). */
// CTA flags (sheet): 1 = встреча разговорного клуба (детали в шапке профиля),
// 2 = делитесь в комментариях, 3 = сохрани и подпишись на подборки.
export const CAROUSEL_CTA_CATALOG_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Приходите на встречу · детали в профиле",
  2: "Делитесь в комментариях",
  3: "Сохрани и подпишись",
  4: "Сохрани и подпишись",
};

export function resolveCtaCatalogLabel(
  ctaType?: number | null,
): string | undefined {
  if (ctaType === 1 || ctaType === 2 || ctaType === 3 || ctaType === 4) {
    return CAROUSEL_CTA_CATALOG_LABELS[ctaType];
  }
  return undefined;
}

/**
 * Archaeology E2E text-in-image. OFF when S57 layered_html is the product gate.
 * Explicit `CAROUSEL_E2E_TEXT_IN_IMAGE=0` also disables.
 */
export function isCarouselE2eTextInImage(): boolean {
  if (isCarouselLayeredHtmlPipeline()) return false;
  // Phase 6 correct archaeology: type-on-PNG primary.
  if (isCarouselCorrectPipeline()) return true;
  return process.env.CAROUSEL_E2E_TEXT_IN_IMAGE !== "0";
}

/**
 * Emergency: after E2E image failure, allow HTML overlay soft-fall.
 * Never claim S53 PASS on this path.
 */
export function isCarouselE2eFallbackHtml(): boolean {
  const v = process.env.CAROUSEL_E2E_FALLBACK_HTML?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * C-audit-03 legacy: HTML/CSS-first draw is ON unless `CAROUSEL_HTML_FIRST=0`.
 * When Phase4 E2E is ON, HTML-first text compositing is treated as OFF.
 * `CAROUSEL_DRAW_SKIP_BG=1` forces zero image API calls (legacy only).
 */
export function isCarouselHtmlFirstDraw(): boolean {
  if (isCarouselE2eTextInImage()) return false;
  return process.env.CAROUSEL_HTML_FIRST !== "0";
}

export function isCarouselDrawSkipBg(): boolean {
  // Phase4 E2E must never skip image API via this flag.
  if (isCarouselE2eTextInImage()) return false;
  const v = process.env.CAROUSEL_DRAW_SKIP_BG?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Whether optional gpt-image bg is useful for this slide.
 * Text kits (dark_notes / bento chalk/glass) default to skip under HTML-first.
 */
export function slideWarrantsOptionalBg(input: {
  visualPrompt?: string | null;
  kitAesthetic?: LiveGenKitAesthetic;
  /** Override env; default = isCarouselHtmlFirstDraw() */
  htmlFirst?: boolean;
}): boolean {
  if (isCarouselDrawSkipBg()) return false;

  const htmlFirst = input.htmlFirst ?? isCarouselHtmlFirstDraw();
  // Legacy path: always request bg (old N× image + overlay behavior).
  if (!htmlFirst) return true;

  // Photo-driven live-gen kit: bg illustration expected.
  if (input.kitAesthetic === "cinematic_scene") return true;

  const vp = (input.visualPrompt ?? "").trim();
  if (!vp) return false;

  const textKitEnough =
    /\b(dark_notes|chalk|marker|checklist|doodle|bento|glass|telemetry|typography|poster\s*text|cta\s*frame|melov|мелов)\b/i.test(
      vp,
    );
  const photoHints =
    /\b(photo|photograph|people|person|crowd|portrait|illustration|bokeh|full-?bleed|hero\s*image|cinematic|street\s*scene|real\s*hands|product\s*shot)\b/i.test(
      vp,
    );

  if (input.kitAesthetic === "clean_poster" || input.kitAesthetic === "tip_cards") {
    return photoHints;
  }
  if (textKitEnough && !photoHints) return false;
  if (photoHints) return true;
  // HTML-first default for text-heavy Vernatun kits: skip diffusion.
  return false;
}

/** Solid CSS-var fill as data-URI — no remote image required. */
export function solidPresetBackgroundDataUri(bgColor: string): string {
  const fill = (bgColor || "#0a0a0a").replace(/"/g, "");
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect fill="${fill}" width="100%" height="100%"/></svg>`,
    )
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * C-audit-04 — convert markdown emphasis before paint.
 * `*word*` → `<em class="md-em">`; `**word**` → `<strong>`; leftover `*` stripped.
 * Escape first — never inject raw HTML from copy.
 */
export function sanitizeOnSlideMarkup(raw: string): string {
  const escaped = escapeHtml(raw ?? "");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, '<em class="md-em">$1</em>')
    .replace(/\*/g, "");
}

/** Plain text without markdown markers (pill labels / alt). */
export function stripMarkdownEmphasis(raw: string): string {
  return (raw ?? "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\*/g, "")
    .trim();
}

/**
 * Short pill label for cta_slide — never mid-phrase truncate of long secondary.
 * Prefer captionLine / cta_label; else first · segment; else marketing default.
 */
export function resolveCtaPillLabel(
  secondary: string,
  captionLine?: string | null,
): string {
  const caption = stripMarkdownEmphasis(captionLine ?? "");
  if (caption) return caption;

  const cleanSecondary = stripMarkdownEmphasis(secondary);
  const parts = cleanSecondary
    .split(/\s*[·•|/—–]\s*/)
    .map((p) => p.replace(/\.+$/, "").trim())
    .filter(Boolean);
  if (parts.length >= 2 && parts[0]!.length > 0 && parts[0]!.length <= 36) {
    return parts[0]!;
  }
  if (cleanSecondary.length > 0 && cleanSecondary.length <= 28) {
    return cleanSecondary;
  }
  return "Сохранить · Vernatun";
}

export function roleToLayoutVariant(role: CarouselSlideRole): LayoutVariant {
  if (role === "cover") return "Cover";
  if (role === "cta_slide") return "CTA";
  return "BodyCard";
}

/** @deprecated prefer normalizeCarouselSlideRole — kept for callers */
function resolveLayoutPreset(
  variant: string | undefined,
): "hook_cover" | "statement_split" | "default" {
  const role = normalizeCarouselSlideRole(variant, 0, 3);
  if (role === "cover") return "hook_cover";
  if (role === "body_slide") return "statement_split";
  return "default";
}

type KitSlideMeta = {
  slideIndex: number; // 0-based
  slideTotal: number;
  /** Index among body_slide frames only (0-based); -1 if not body. */
  bodyOrdinal: number;
};

function isDarkNotes(preset: DesignPresetFile): boolean {
  return preset.preset === "dark_notes";
}

function isBentoGlass(preset: DesignPresetFile): boolean {
  return (
    preset.preset === "bento_glass" || preset.preset === "dark_editorial"
  );
}

function kitChrome(preset: DesignPresetFile, role: CarouselSlideRole): string {
  const parts: string[] = [];
  const doodleInk =
    preset.components.doodle?.ink ?? "var(--cf-design-accent)";
  const bridgeOn =
    Boolean(preset.components.doodle?.enabled) ||
    preset.components.seamlessConnector?.style === "arrow";

  // Shared density scaffolding
  parts.push(`
    .kit-stack {
      display: flex; flex-direction: column; gap: 18px; width: 100%;
      position: relative; flex: 1 1 auto; min-height: 100%;
      justify-content: flex-start;
    }
    .kit-stack.cta-dense { justify-content: flex-start; gap: 16px; }
    .wave-line {
      width: 100%; height: 48px; margin-top: 8px; opacity: 0.7;
    }
    .slide-num {
      position: absolute; left: 50%; bottom: 48px; transform: translateX(-50%);
      font-family: var(--cf-font-body); font-size: 22px; letter-spacing: 0.18em;
      color: var(--cf-design-muted); opacity: 0.75; z-index: 2; pointer-events: none;
    }
    .step-chip {
      display: inline-flex; align-items: center; gap: 8px;
      align-self: flex-start;
      padding: 8px 16px; border-radius: 999px;
      font-family: var(--cf-font-body); font-size: 16px; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--cf-design-muted);
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.04);
    }
    .eyebrow {
      font-family: var(--cf-font-armenian, var(--cf-font-body));
      font-size: 22px; font-weight: 500; letter-spacing: 0.04em;
      color: var(--cf-design-muted); text-transform: uppercase;
    }
    .underline-mark {
      background: linear-gradient(
        transparent 62%,
        color-mix(in srgb, var(--cf-design-accent) 85%, transparent) 62%,
        color-mix(in srgb, var(--cf-design-accent) 85%, transparent) 92%,
        transparent 92%
      );
      box-decoration-break: clone; -webkit-box-decoration-break: clone;
    }
    .meta-row {
      display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: center;
      font-family: var(--cf-font-body); font-size: 24px; color: var(--cf-design-muted);
    }
    .bento-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 18px; width: 100%;
    }
    .bento-cell {
      display: flex; flex-direction: column; gap: 10px;
      min-height: 280px; padding: 28px 24px;
    }
    .timer-digits {
      font-family: var(--cf-font-mono, var(--cf-font-body));
      font-size: 42px; font-weight: 600; letter-spacing: 0.04em;
      color: var(--cf-design-text);
      text-shadow: 0 0 24px color-mix(in srgb, var(--cf-design-accent) 45%, transparent);
    }
    .metric-val {
      font-family: var(--cf-font-mono, var(--cf-font-body));
      font-size: 36px; font-weight: 700; color: var(--cf-design-accent);
    }
    .metric-label {
      font-size: 18px; color: var(--cf-design-muted); letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .quote-card {
      padding: 48px 40px; text-align: center;
    }
    .quote-card .primary {
      font-size: 44px; line-height: 1.2; text-align: center;
    }
    .photo-panel {
      position: relative; width: 100%; height: 520px; border-radius: 18px;
      overflow: hidden; margin-top: auto;
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 24px 64px rgba(0,0,0,0.45);
    }
    .glass-strip {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 18px 22px; border-radius: 14px; margin-top: 4px;
      font-family: var(--cf-font-body); font-size: 20px;
      color: var(--cf-design-muted);
    }
    .photo-panel-inner {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 45% 40%, rgba(255,255,255,0.14), transparent 55%),
        linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 55%, #14110c 100%);
    }
    .logo-row {
      display: flex; align-items: center; gap: 16px; margin-top: 12px;
    }
    .logo-row .pomegranate { width: 88px; height: 102px; }
    .logo-word {
      font-family: var(--cf-font-display); font-size: 22px; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--cf-design-text);
    }
  `);

  if (isDarkNotes(preset)) {
    parts.push(`
    .marker-block {
      display: inline-block;
      max-width: 100%;
      padding: 14px 22px 16px;
      background: var(--cf-design-accent);
      color: var(--cf-design-inverse, #121212);
      border-radius: 3px 18px 5px 14px;
      transform: rotate(-0.9deg);
      box-shadow:
        3px 4px 0 rgba(0,0,0,0.35),
        inset 0 -2px 0 color-mix(in srgb, var(--cf-design-accent) 70%, black);
      font-family: var(--cf-font-armenian, var(--cf-font-display));
      font-weight: 700;
      font-size: inherit;
      line-height: 1.15;
      letter-spacing: 0.01em;
    }
    .marker-block .hy {
      display: block; font-size: 0.72em; font-weight: 600; opacity: 0.88; margin-top: 4px;
    }
    .marker-block .md-em {
      font-style: italic;
      color: inherit;
      text-decoration: underline;
      text-decoration-thickness: 3px;
      text-underline-offset: 4px;
    }
    .check-row {
      display: flex; align-items: center; gap: 16px;
      font-family: var(--cf-font-body); font-size: 26px; color: var(--cf-design-text);
    }
    .check-box {
      width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
      border: 2.5px solid var(--cf-design-accent);
      background: transparent;
    }
    .check-box.checked {
      background: var(--cf-design-accent);
      box-shadow: inset 0 0 0 4px #1A1814;
    }
    .chalk-grid {
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      opacity: 0.55;
      background-image:
        linear-gradient(var(--cf-design-grid, rgba(255,255,255,0.05)) 1px, transparent 1px),
        linear-gradient(90deg, var(--cf-design-grid, rgba(255,255,255,0.05)) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse at center, black 40%, transparent 92%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 92%);
    }
    .doodle-layer { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
    .coffee-doodle {
      position: absolute; right: 72px; top: 42%; width: 160px; height: 180px; opacity: 0.92;
    }
    .stars-doodle {
      position: absolute; left: 70px; bottom: 32%; width: 120px; height: 80px; opacity: 0.85;
    }
    .curly-arrow {
      position: absolute; right: 100px; bottom: 28%; width: 100px; height: 90px; opacity: 0.8;
    }
    .bridge-stack {
      position: absolute; right: 8px; bottom: 180px; display: flex; flex-direction: column;
      gap: 10px; z-index: 3; pointer-events: none;
    }
    .bridge-arrow { width: 140px; height: 56px; }
    .bridge-arrow.thin { width: 96px; height: 40px; opacity: 0.75; align-self: flex-end; }
    .pomegranate {
      width: 120px; height: 140px; flex-shrink: 0;
    }
    .checklist { display: flex; flex-direction: column; gap: 18px; margin-top: 8px; }
    .md-em {
      font-style: italic;
      font-weight: 700;
      color: var(--cf-design-accent);
    }
    .value-card {
      margin-top: 12px;
      padding: 22px 26px;
      border: 2px dashed color-mix(in srgb, var(--cf-design-accent) 55%, transparent);
      border-radius: 14px;
      background: color-mix(in srgb, var(--cf-design-surface) 55%, transparent);
      font-family: var(--cf-font-body);
      font-size: 26px;
      line-height: 1.35;
      color: var(--cf-design-text);
    }
    .value-card .vc-label {
      display: block;
      font-size: 16px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--cf-design-accent);
      margin-bottom: 10px;
    }
    .chalk-fill {
      flex: 0 0 auto;
      margin-top: 4px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.12);
      background:
        radial-gradient(ellipse at 20% 30%, color-mix(in srgb, var(--cf-design-accent) 18%, transparent), transparent 50%),
        linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.15));
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 20px 22px;
    }
    .chalk-fill .fill-row {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .chalk-fill .fill-doodle {
      position: relative !important;
      inset: auto !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      width: 96px;
      height: 96px;
      opacity: 0.95;
      flex-shrink: 0;
    }
    .chalk-fill .fill-note {
      font-family: var(--cf-font-body);
      font-size: 26px;
      line-height: 1.35;
      color: var(--cf-design-text);
      border-left: 4px solid var(--cf-design-accent);
      padding: 14px 16px 14px 18px;
      background: rgba(0,0,0,0.28);
      border-radius: 0 12px 12px 0;
    }
    .chalk-fill .fill-chips {
      display: flex; flex-wrap: wrap; gap: 10px;
    }
    .chalk-fill .fill-chip {
      padding: 10px 16px;
      border-radius: 999px;
      border: 1.5px solid color-mix(in srgb, var(--cf-design-accent) 55%, transparent);
      color: var(--cf-design-accent);
      font-size: 18px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    `);
  }

  if (bridgeOn && role !== "cta_slide") {
    parts.push(`
    .doodle-dot {
      position: absolute;
      width: 10px; height: 10px; border-radius: 50%;
      background: ${doodleInk};
      opacity: 0.45;
      box-shadow: 0 0 0 3px color-mix(in srgb, ${doodleInk} 20%, transparent);
    }
    .doodle-dot.a { top: 14%; left: 8%; }
    .doodle-dot.b { top: 62%; right: 11%; }
    .doodle-swirl {
      position: absolute;
      top: 10%; right: 9%;
      width: 80px; height: 64px;
      opacity: 0.75;
      pointer-events: none;
    }`);
  }
  if (preset.components.markerHighlight) {
    const markerColor =
      preset.components.markerHighlight.color || "var(--cf-design-accent)";
    const ragged = preset.components.markerHighlight.ragged
      ? "border-radius: 3px 18px 5px 14px; transform: rotate(-0.9deg);"
      : "border-radius: 6px;";
    parts.push(`
    .marker {
      display: inline;
      padding: 0 0.06em;
      background: linear-gradient(
        transparent 58%,
        color-mix(in srgb, ${markerColor} 82%, transparent) 58%,
        color-mix(in srgb, ${markerColor} 82%, transparent) 94%,
        transparent 94%
      );
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }
    .marker-block {
      display: inline-block;
      max-width: 100%;
      padding: 14px 22px 16px;
      background: ${markerColor};
      color: var(--cf-design-inverse, #121212);
      ${ragged}
      box-shadow:
        3px 4px 0 rgba(0,0,0,0.35),
        inset 0 -2px 0 color-mix(in srgb, ${markerColor} 70%, black);
      font-family: var(--cf-font-armenian, var(--cf-font-display));
      font-weight: 700;
      font-size: inherit;
      line-height: 1.15;
      letter-spacing: 0.01em;
      text-shadow: none;
    }
    .marker-block .hy {
      display: block; font-size: 0.72em; font-weight: 600; opacity: 0.88; margin-top: 4px;
    }`);
  }
  if (preset.components.card?.glass) {
    const blur = preset.components.card.blur ?? "16px";
    parts.push(`
    .glass-card, .bento-cell.glass {
      background:
        linear-gradient(
          145deg,
          color-mix(in srgb, var(--cf-design-surface) 42%, transparent) 0%,
          color-mix(in srgb, var(--cf-design-surface) 72%, transparent) 100%
        );
      backdrop-filter: blur(${blur}) saturate(1.2);
      -webkit-backdrop-filter: blur(${blur}) saturate(1.2);
      border: ${preset.components.card.border ?? "1px solid rgba(255,255,255,0.14)"};
      border-radius: ${preset.components.card.radius ?? "16px"};
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.16),
        0 0 0 1px color-mix(in srgb, var(--cf-design-accent) 12%, transparent),
        0 18px 48px rgba(0,0,0,0.4);
    }
    .glass-card { padding: 36px 40px; }
    .bento-cell.glow-gold {
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.16),
        0 0 28px color-mix(in srgb, var(--cf-design-accent) 35%, transparent);
      border-color: color-mix(in srgb, var(--cf-design-accent) 55%, transparent);
    }
    .bento-cell.glow-warm {
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.12),
        0 0 24px rgba(220, 80, 40, 0.35);
      border-color: rgba(220, 100, 60, 0.45);
    }
    .chart-wrap {
      width: 100%; height: 280px; margin-top: 12px;
      border-radius: 16px; padding: 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .chart-wrap svg { width: 100%; height: 100%; overflow: visible; }
    .ambient-glow {
      position: absolute; width: 420px; height: 420px; border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--cf-design-accent) 22%, transparent), transparent 70%);
      filter: blur(8px); pointer-events: none; z-index: 0;
    }
    .ambient-glow.a { top: -80px; right: -60px; }
    .ambient-glow.b { bottom: 80px; left: -100px; opacity: 0.55; }
    `);
  }
  if (preset.components.buttonCta?.glow || role === "cta_slide") {
    const radius = preset.components.buttonCta?.radius ?? "999px";
    const weight = preset.components.buttonCta?.labelWeight ?? 600;
    const pillRadius =
      radius === "14px" || radius === "6px" ? "14px" : radius;
    parts.push(`
    .cta-pill {
      display: inline-flex; align-items: center; justify-content: center; gap: 12px;
      align-self: stretch;
      max-width: 100%;
      margin-top: 8px; padding: 22px 36px;
      font-family: var(--cf-font-body);
      font-size: 28px; font-weight: ${weight};
      letter-spacing: 0.04em; text-transform: uppercase;
      color: var(--cf-design-bg);
      background: linear-gradient(
        135deg,
        var(--cf-design-accent),
        color-mix(in srgb, var(--cf-design-accent) 70%, #fff6d6)
      );
      border-radius: ${pillRadius};
      box-shadow:
        0 0 40px color-mix(in srgb, var(--cf-design-accent) 55%, transparent),
        0 12px 28px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.4);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cta-pill .ico { width: 28px; height: 28px; flex-shrink: 0; }
    `);
  }
  if (preset.components.checkbox) {
    const hand = preset.components.checkbox.style === "hand";
    parts.push(`
    .check-row {
      display: flex; align-items: flex-start; gap: 16px;
      font-family: var(--cf-font-body); font-size: 26px;
      color: var(--cf-design-text); opacity: 0.94;
    }
    .check-box {
      width: 30px; height: 30px; flex-shrink: 0; margin-top: 2px;
      border: 2.5px solid ${hand ? "var(--cf-design-text)" : "var(--cf-design-accent)"};
      border-radius: ${hand ? "3px" : "6px"};
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .check-box.checked::after {
      content: "✕";
      font-size: 20px; font-weight: 700; line-height: 1;
      color: var(--cf-design-text);
      transform: rotate(-8deg);
    }
    `);
  }
  if (preset.components.gauge?.glow) {
    parts.push(`
    .gauge {
      width: 120px; height: 120px; border-radius: 50%;
      border: 4px solid color-mix(in srgb, var(--cf-design-accent) 40%, transparent);
      background:
        radial-gradient(
          circle at 40% 35%,
          color-mix(in srgb, var(--cf-design-accent) 28%, transparent),
          transparent 62%
        );
      box-shadow: 0 0 28px color-mix(in srgb, var(--cf-design-accent) 40%, transparent);
      margin-bottom: 12px;
    }`);
  }
  return parts.join("\n");
}

function doodleBridgeSvg(
  preset: DesignPresetFile,
  opts?: { className?: string; thick?: boolean },
): string {
  const stroke =
    preset.components.seamlessConnector?.color ||
    preset.components.doodle?.ink ||
    "#F5D742";
  const cls = opts?.className ?? "bridge-arrow";
  const sw = opts?.thick === false ? "4" : "7";
  return `<svg class="${cls}" viewBox="0 0 140 56" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 32 C36 6, 78 4, 112 26" stroke="${escapeHtml(stroke)}" stroke-width="${sw}" stroke-linecap="round"/>
      <path d="M98 14 L128 30 L96 42" stroke="${escapeHtml(stroke)}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

function doodleSwirlSvg(preset: DesignPresetFile): string {
  const stroke = preset.components.doodle?.ink || "#FFFFFF";
  return `<svg class="doodle-swirl" viewBox="0 0 72 56" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 40 C18 12, 42 8, 52 22 C60 34, 48 44, 36 38 C24 32, 28 18, 40 16" stroke="${escapeHtml(stroke)}" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`;
}

function coffeeCupSvg(): string {
  return `<svg class="coffee-doodle" viewBox="0 0 120 140" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 48 h52 c2 28 2 52 -6 68 H34 c-8-16-8-40-6-68z" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 58 h14 c10 0 16 8 14 18 c-2 10-10 16-18 16 h-8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="54" cy="48" rx="26" ry="7" stroke="#FFFFFF" stroke-width="2.5"/>
    <path d="M42 28 c2-10 8-14 12-6" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M56 24 c3-12 10-14 12-4" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M68 30 c1-8 6-10 8-2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <circle cx="96" cy="36" r="3" fill="#FFFFFF" opacity="0.7"/>
    <path d="M18 118 Q54 132 90 118" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  </svg>`;
}

function starsDoodleSvg(): string {
  return `<svg class="stars-doodle" viewBox="0 0 120 80" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 30 l4 10 10 2 -8 7 3 10 -9-6 -9 6 3-10 -8-7 10-2z" fill="#FFFFFF" opacity="0.85"/>
    <path d="M70 18 l3 7 7 1 -5 5 2 7 -7-4 -7 4 2-7 -5-5 7-1z" fill="#FFFFFF" opacity="0.7"/>
    <path d="M98 48 l2 5 5 1 -4 3 1 5 -4-3 -4 3 1-5 -4-3 5-1z" fill="#FFFFFF" opacity="0.65"/>
    <circle cx="48" cy="58" r="2" fill="#FFFFFF"/>
    <circle cx="110" cy="22" r="1.5" fill="#FFFFFF"/>
  </svg>`;
}

function curlyArrowSvg(): string {
  return `<svg class="curly-arrow" viewBox="0 0 100 90" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12 C40 8, 70 28, 62 55 C54 78, 28 72, 34 52 C40 34, 78 48, 88 70" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M78 62 L90 74 L74 78" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function pomegranateSvg(className = "pomegranate"): string {
  return `<svg class="${className}" viewBox="0 0 100 120" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 14 c4-8 14-10 18-2 c-6 4-10 10-8 16" fill="none" stroke="#E8E8E8" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 28 c-22 4-34 28-30 52 c4 22 28 34 46 28 c20-6 30-30 24-48 C84 40 68 26 50 28z" fill="#B91C1C" stroke="#F5F5F5" stroke-width="2.5"/>
    <path d="M42 58 c6 2 10 8 8 14 M58 54 c4 6 4 14-2 18 M50 70 c8 4 12 12 6 20" fill="none" stroke="#FCA5A5" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
    <circle cx="46" cy="64" r="3" fill="#FEE2E2"/><circle cx="58" cy="72" r="2.5" fill="#FEE2E2"/><circle cx="52" cy="84" r="2.2" fill="#FEE2E2"/>
  </svg>`;
}

function lineChartSvg(): string {
  return `<svg viewBox="0 0 400 200" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cfChartGlow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#FBBF24" stop-opacity="1"/>
      </linearGradient>
      <filter id="cfGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M8 150 C48 148, 70 120, 100 128 C130 136, 150 90, 190 70 C230 50, 250 95, 290 55 C330 18, 360 40, 392 28"
      stroke="url(#cfChartGlow)" stroke-width="5" stroke-linecap="round" filter="url(#cfGlow)"/>
    <path d="M8 150 C48 148, 70 120, 100 128 C130 136, 150 90, 190 70 C230 50, 250 95, 290 55 C330 18, 360 40, 392 28 L392 200 L8 200 Z"
      fill="url(#cfChartGlow)" opacity="0.12"/>
  </svg>`;
}

function cupIconSvg(kind: "paper" | "ceramic"): string {
  if (kind === "paper") {
    return `<svg width="64" height="72" viewBox="0 0 64 72" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 16 h32 l-4 44 H20 z" stroke="#FFFFFF" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M14 16 h36" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M24 28 h16 M22 40 h20" stroke="#FFFFFF" stroke-width="1.6" opacity="0.5"/>
    </svg>`;
  }
  return `<svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 22 h30 c1 16 1 30-4 38 H22 c-5-8-5-22-4-38z" stroke="#FFFFFF" stroke-width="2.4"/>
    <path d="M48 28 h10 c8 0 12 8 10 16 s-8 12-14 12 h-4" stroke="#FFFFFF" stroke-width="2.4"/>
    <ellipse cx="33" cy="60" rx="18" ry="5" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`;
}

function bookmarkIco(): string {
  return `<svg class="ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h10v16l-5-3-5 3V4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

function waveformSvg(): string {
  return `<svg class="wave-line" viewBox="0 0 400 48" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 24 H20 l6-10 8 20 10-28 12 24 8-12 14 18 10-22 12 16 8-8 20 0 8 12 10-18 12 22 10-10 14 8 20 0"
      stroke="color-mix(in srgb, var(--cf-design-accent) 70%, white)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
  </svg>`;
}

function padSlideNum(n: number): string {
  return String(n).padStart(2, "0");
}

function darkNotesKitHtml(
  role: CarouselSlideRole,
  preset: DesignPresetFile,
  primary: string,
  secondary: string,
  captionLine: string | undefined,
  meta: KitSlideMeta,
): string {
  // C-audit-04: never paint raw `*emphasis*` asterisks
  const p = sanitizeOnSlideMarkup(primary);
  const s = sanitizeOnSlideMarkup(secondary);
  const bridges =
    role !== "cta_slide"
      ? `<div class="bridge-stack">${doodleBridgeSvg(preset, { thick: true })}${doodleBridgeSvg(preset, { className: "bridge-arrow thin", thick: false })}</div>`
      : "";

  if (role === "cover") {
    return `
      <div class="kit-stack">
        <div class="primary" style="text-align:left;font-size:48px;">
          <span class="marker-block">${p}<span class="hy">THE COFFEE DOCTRINE</span></span>
        </div>
        ${s ? `<div class="secondary" style="text-align:left;font-size:30px;max-width:92%;">${s}</div>` : ""}
        <div class="checklist">
          <div class="check-row"><div class="check-box"></div><div>утренний ритуал</div></div>
          <div class="check-row"><div class="check-box"></div><div>разговор за столом</div></div>
          <div class="check-row"><div class="check-box"></div><div>без «системы на 6 фигур»</div></div>
        </div>
        <div class="chalk-fill" aria-hidden="false">
          <div class="fill-row">
            ${coffeeCupSvg().replace('class="coffee-doodle"', 'class="coffee-doodle fill-doodle"')}
            ${starsDoodleSvg().replace('class="stars-doodle"', 'class="stars-doodle fill-doodle"')}
          </div>
          <div class="fill-note">THE COFFEE DOCTRINE · пауза важнее продуктивности</div>
          <div class="fill-chips">
            <span class="fill-chip">ритуал</span>
            <span class="fill-chip">стол</span>
            <span class="fill-chip">пауза</span>
          </div>
        </div>
      </div>
      ${bridges}
    `;
  }

  if (role === "body_slide") {
    const n = meta.bodyOrdinal + 1;
    const secondaryHtml = s
      ? `<div class="secondary" style="text-align:left;font-size:28px;">${s.replace(
          /паузы в реальности|pause|ритуал/gi,
          (m) => `<span class="underline-mark">${m}</span>`,
        )}</div>`
      : "";
    return `
      <div class="kit-stack">
        <div class="primary" style="text-align:left;font-size:44px;">
          <span class="marker-block">${escapeHtml(String(n))}. ${p}</span>
        </div>
        ${secondaryHtml}
        <div class="checklist">
          <div class="check-row"><div class="check-box checked"></div><div>поставить мир на паузу</div></div>
          <div class="check-row"><div class="check-box"></div><div>услышать друг друга</div></div>
          <div class="check-row"><div class="check-box"></div><div>не гнаться за рецептом</div></div>
        </div>
        <div class="value-card">
          <span class="vc-label">Vernatun beat</span>
          Кофе — это пауза в реальности, не таймер продуктивности.
        </div>
        <div class="chalk-fill" aria-hidden="false">
          <div class="fill-row">
            ${starsDoodleSvg().replace('class="stars-doodle"', 'class="stars-doodle fill-doodle"')}
            ${curlyArrowSvg().replace('class="curly-arrow"', 'class="curly-arrow fill-doodle"')}
          </div>
          <div class="fill-note">чек-лист ритуала · не рецепт · стол важнее таймера</div>
          <div class="fill-chips">
            <span class="fill-chip">pause</span>
            <span class="fill-chip">слушать</span>
            <span class="fill-chip">без спешки</span>
          </div>
        </div>
      </div>
    `;
  }

  // cta — dense brand + checklist + pill (C-audit-05)
  const pillRaw = resolveCtaPillLabel(secondary, captionLine);
  const pill = escapeHtml(pillRaw);
  return `
    <div class="kit-stack cta-dense" style="min-height:100%;">
      <div>
        <div class="primary" style="text-align:left;font-size:44px;">${p}</div>
        ${s ? `<div class="secondary" style="text-align:left;margin-top:12px;">${s}</div>` : ""}
        <div class="meta-row" style="margin-top:20px;">
          <span>20:00</span>
          <span>·</span>
          <span>📍 Vernatun · Moscow</span>
        </div>
        <div class="checklist" style="margin-top:20px;">
          <div class="check-row"><div class="check-box checked"></div><div>СОХРАНИ, ЧТОБЫ НЕ ПОТЕРЯТЬ</div></div>
          <div class="check-row"><div class="check-box checked"></div><div>вернись к ритуалу в будни</div></div>
        </div>
      </div>
      <div class="value-card">
        <span class="vc-label">Save gesture</span>
        Лайк + сохранить — пауза останется на неделе.
      </div>
      <div class="chalk-fill" aria-hidden="false">
        <div class="fill-row">
          ${coffeeCupSvg().replace('class="coffee-doodle"', 'class="coffee-doodle fill-doodle"')}
          ${curlyArrowSvg().replace('class="curly-arrow"', 'class="curly-arrow fill-doodle"')}
        </div>
        <div class="fill-note">сохрани ритуал · вернись утром · Vernatun</div>
        <div class="fill-chips">
          <span class="fill-chip">like</span>
          <span class="fill-chip">save</span>
          <span class="fill-chip">вернуться</span>
        </div>
      </div>
      <div class="logo-row">
        ${pomegranateSvg()}
        <div>
          <div class="logo-word">ВЕРНАТУН</div>
          <div class="eyebrow" style="margin-top:4px;">VERNATUN</div>
        </div>
      </div>
      <div class="cta-pill" style="align-self:flex-start;border-radius:8px;text-transform:none;font-size:24px;">${pill}</div>
      ${doodleBridgeSvg(preset, { thick: true })}
    </div>
  `;
}

function bentoGlassKitHtml(
  role: CarouselSlideRole,
  preset: DesignPresetFile,
  primary: string,
  secondary: string,
  captionLine: string | undefined,
  meta: KitSlideMeta,
): string {
  const p = sanitizeOnSlideMarkup(primary);
  const s = sanitizeOnSlideMarkup(secondary);
  const step = padSlideNum(meta.slideIndex + 1);
  const stepLabels = [
    "HOOK",
    "THE PARADOX",
    "ANATOMY",
    "PSYCHOLOGY",
    "MANIFEST",
    "ACTION",
  ];
  const stepLabel =
    stepLabels[Math.min(meta.slideIndex, stepLabels.length - 1)] ?? "SLIDE";

  if (role === "cover") {
    return `
      <div class="ambient-glow a"></div>
      <div class="kit-stack">
        <div class="step-chip">${step} / ${stepLabel}</div>
        <div class="primary" style="text-align:left;font-size:56px;max-width:95%;">${p}</div>
        ${s ? `<div class="secondary" style="text-align:left;font-size:28px;">${s}</div>` : ""}
        <div class="photo-panel" aria-hidden="true">
          <div class="photo-panel-inner"></div>
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%, rgba(255,200,120,0.12), transparent 55%);"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.95;">
            ${cupIconSvg("ceramic")}
          </div>
          <div style="position:absolute;left:24px;bottom:24px;font-size:14px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.55);font-family:var(--cf-font-body);">espresso · 4:5 plate</div>
        </div>
        <div class="glass-card glass-strip">
          <span>Վերնատուն · night glass</span>
          <span style="color:var(--cf-design-accent);font-weight:600;">01 →</span>
        </div>
      </div>
    `;
  }

  if (role === "cta_slide") {
    const pillRaw = resolveCtaPillLabel(secondary, captionLine);
    const pill = escapeHtml(pillRaw);
    return `
      <div class="ambient-glow b"></div>
      <div class="kit-stack cta-dense">
        <div>
          <div class="step-chip">${step} / ${stepLabel}</div>
          <div class="glass-card quote-card" style="margin-top:20px;">
            <div class="primary" style="font-size:48px;">${p}</div>
            ${s ? `<div class="secondary" style="text-align:center;margin-top:16px;">${s}</div>` : ""}
          </div>
        </div>
        <div class="cta-pill">${bookmarkIco()}${pill}</div>
        <div class="logo-row" style="justify-content:flex-end;align-items:flex-end;">
          ${pomegranateSvg("pomegranate")}
          <div>
            <div class="logo-word">VERNATUN</div>
            <div class="eyebrow" style="margin-top:6px;">Armenian Club</div>
          </div>
        </div>
      </div>
    `;
  }

  // body variants by ordinal among body slides
  const variant = meta.bodyOrdinal;
  const head = `
    <div class="step-chip">${step} / ${stepLabel}</div>
    <div class="primary" style="text-align:left;font-size:40px;">${p}</div>
    ${s ? `<div class="secondary" style="text-align:left;font-size:24px;">${s}</div>` : ""}
  `;

  if (variant === 0) {
    return `
      <div class="ambient-glow a"></div>
      <div class="kit-stack">
        ${head}
        <div class="bento-grid" style="flex:1;">
          <div class="bento-cell glass glow-gold">
            <div class="metric-label">Ritual clock</div>
            <div class="timer-digits">00:45:00</div>
            <div class="gauge" aria-hidden="true" style="margin:12px 0;"></div>
            <div class="metric-label" style="margin-top:auto;">Yerevan pause</div>
          </div>
          <div class="bento-cell glass glow-warm">
            <div class="metric-label">To-go rush</div>
            <div class="timer-digits">00:03:00</div>
            <div class="gauge" aria-hidden="true" style="margin:12px 0;border-color:rgba(220,100,60,0.45);"></div>
            <div class="metric-label" style="margin-top:auto;">Paper sprint</div>
          </div>
        </div>
        ${waveformSvg()}
        <div class="glass-card glass-strip">
          <span>signal · warm amber</span>
          <span style="color:var(--cf-design-accent);">02 →</span>
        </div>
      </div>
    `;
  }

  if (variant === 1) {
    return `
      <div class="kit-stack">
        ${head}
        <div class="bento-grid" style="flex:1;">
          <div class="bento-cell glass">
            ${cupIconSvg("paper")}
            <div class="metric-label">Paper cup</div>
            <div class="metric-val">−86.5%</div>
            <div class="metric-label">presence value</div>
          </div>
          <div class="bento-cell glass glow-gold">
            ${cupIconSvg("ceramic")}
            <div class="metric-label">Ceramic</div>
            <div class="metric-val">98%</div>
            <div class="metric-label">ritual highlight</div>
          </div>
        </div>
        <div class="glass-card glass-strip">
          <span>anatomy · dual glass</span>
          <span style="color:var(--cf-design-accent);">03 →</span>
        </div>
      </div>
    `;
  }

  if (variant === 2) {
    return `
      <div class="kit-stack">
        ${head}
        <div class="glass-card" style="padding:24px 28px;flex:1;display:flex;flex-direction:column;">
          <div class="metric-label" style="margin-bottom:8px;">Stress level · fake saved 15 min</div>
          <div class="chart-wrap" style="flex:1;height:360px;">${lineChartSvg()}</div>
        </div>
        <div class="glass-card glass-strip">
          <span>psychology · telemetry</span>
          <span style="color:var(--cf-design-accent);">04 →</span>
        </div>
      </div>
    `;
  }

  // quote / default glass
  return `
    <div class="ambient-glow a"></div>
    <div class="kit-stack cta-dense">
      ${head}
      <div class="glass-card quote-card" style="flex:1;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:18px;letter-spacing:0.2em;color:var(--cf-design-accent);margin-bottom:20px;">✦ ✦ ✦</div>
        <div class="primary" style="font-size:44px;">«Ритуал — это манифест контроля»</div>
        <div class="secondary" style="text-align:center;margin-top:24px;">Vernatun · glass manifest</div>
      </div>
      <div class="glass-card glass-strip">
        <span>manifest card</span>
        <span style="color:var(--cf-design-accent);">05 →</span>
      </div>
    </div>
  `;
}

/** `*accent*` → colored span (clean_poster / tip). C-audit-04: no raw asterisks. */
function accentMarkup(primary: string): string {
  const escaped = escapeHtml(primary ?? "");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="accent-word">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<span class="accent-word">$1</span>')
    .replace(/\*/g, "");
}

function liveGenKitChrome(aesthetic: LiveGenKitAesthetic): string {
  return `
    .accent-word {
      color: var(--cf-design-accent);
      font-weight: 800;
    }
    .lg-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 8px;
      padding: 22px 40px;
      min-height: 72px;
      border-radius: ${aesthetic === "tip_cards" ? "14px" : "999px"};
      background: var(--cf-design-accent);
      color: #111111;
      font-family: var(--cf-font-body);
      font-weight: 700;
      font-size: 28px;
      letter-spacing: 0.02em;
      box-shadow: 0 10px 36px color-mix(in srgb, var(--cf-design-accent) 45%, transparent);
      align-self: ${aesthetic === "cinematic_scene" ? "flex-start" : "stretch"};
      text-align: center;
      max-width: 100%;
    }
    .tip-num {
      font-family: var(--cf-font-display);
      font-weight: 800;
      font-size: 140px;
      line-height: 0.9;
      color: var(--cf-design-accent);
      letter-spacing: -0.04em;
    }
    .tip-label {
      font-family: var(--cf-font-body);
      font-size: 18px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--cf-design-accent);
      margin-bottom: 8px;
    }
    .cine-stack {
      display: flex; flex-direction: column; gap: 20px;
      width: 100%; margin-top: auto;
    }
    .poster-stack {
      display: flex; flex-direction: column; gap: 18px;
      width: 100%; justify-content: flex-start; min-height: 100%;
    }
    .poster-stack .primary { font-size: 54px; text-align: left; }
    .poster-stack .secondary { font-size: 26px; text-align: left; max-width: 96%; }
    .poster-stack .lg-cta { margin-top: 8px; }
    .poster-band {
      flex: 1 1 auto;
      min-height: 72px;
      margin: 4px 0 8px;
      border-radius: 18px;
      background:
        repeating-linear-gradient(
          -12deg,
          color-mix(in srgb, var(--cf-design-accent) 10%, transparent),
          color-mix(in srgb, var(--cf-design-accent) 10%, transparent) 12px,
          transparent 12px,
          transparent 24px
        ),
        #FFF7F0;
      border: 1px solid color-mix(in srgb, var(--cf-design-accent) 28%, #e8e0d8);
      display: flex; align-items: center; justify-content: center;
      padding: 18px 24px;
      font-family: var(--cf-font-body); font-size: 22px; font-weight: 600;
      color: #5C534C; letter-spacing: 0.04em; text-align: center;
    }
    .poster-chip {
      display: inline-flex; align-self: flex-start;
      padding: 8px 16px; border-radius: 999px;
      font-family: var(--cf-font-body); font-size: 16px; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: #121212; background: color-mix(in srgb, var(--cf-design-accent) 22%, #fff);
      border: 1px solid color-mix(in srgb, var(--cf-design-accent) 55%, transparent);
      margin-bottom: 14px;
    }
    .poster-accent-bar {
      width: 120px; height: 10px; border-radius: 999px;
      background: var(--cf-design-accent); margin-bottom: 18px;
    }
    .poster-mid {
      flex: 1 1 auto;
      display: flex; flex-direction: column; justify-content: flex-start;
      gap: 16px; min-height: 0;
      padding: 8px 0;
    }
    .poster-beat {
      padding: 28px 30px;
      border-radius: 20px;
      background: #FFF7F0;
      border: 2px solid color-mix(in srgb, var(--cf-design-accent) 35%, #e8e0d8);
      font-family: var(--cf-font-body);
      font-size: 28px; line-height: 1.35; color: #121212;
    }
    .poster-beat.alt {
      background: #121212;
      color: #FFFFFF;
      border-color: #121212;
    }
    .poster-beat.alt .poster-beat-label { color: var(--cf-design-accent); }
    .poster-tiles {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    .poster-tile {
      padding: 22px 20px; border-radius: 16px;
      background: color-mix(in srgb, var(--cf-design-accent) 12%, #fff);
      border: 1px solid color-mix(in srgb, var(--cf-design-accent) 40%, transparent);
      font-family: var(--cf-font-body); font-size: 22px; font-weight: 600;
      color: #121212; min-height: 96px;
      display: flex; align-items: center;
    }
    .poster-beat-label {
      display: block; font-size: 15px; font-weight: 700;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--cf-design-accent); margin-bottom: 12px;
    }
    .poster-rule {
      width: 100%; height: 3px;
      background: linear-gradient(
        90deg,
        var(--cf-design-accent),
        color-mix(in srgb, var(--cf-design-accent) 10%, transparent)
      );
      border-radius: 999px;
    }
    .poster-mark-row {
      display: flex; align-items: center; gap: 18px;
    }
    .poster-pom { width: 72px; height: 84px; }
    .cine-stack .primary {
      font-size: 54px; text-align: left;
      text-shadow: 0 4px 40px rgba(0,0,0,0.75);
    }
    .cine-stack .secondary {
      font-size: 26px; text-align: left; max-width: 90%;
      text-shadow: 0 2px 24px rgba(0,0,0,0.7);
    }
    .tip-stack {
      display: flex; flex-direction: column; gap: 18px;
      width: 100%; min-height: 100%;
    }
    .tip-stack .primary { font-size: 48px; text-align: left; color: #FFFFFF; }
    .tip-stack .secondary { font-size: 28px; text-align: left; color: rgba(255,255,255,0.88); }
    .tip-icon-frame {
      margin-top: 12px;
      width: 220px;
      height: 220px;
      border: 3px solid var(--cf-design-accent);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 230, 0, 0.06);
      box-shadow: 0 0 40px rgba(255, 230, 0, 0.18);
      flex-shrink: 0;
    }
    .tip-icon { width: 120px; height: 120px; display: block; }
  `;
}

function cleanPosterKitHtml(
  role: CarouselSlideRole,
  primary: string,
  secondary: string,
  captionLine: string | undefined,
  defaultCtaLabel?: string,
): string {
  const p = accentMarkup(primary);
  const s = accentMarkup(secondary);
  const pill = escapeHtml(
    resolveCtaPillLabel(secondary, captionLine || defaultCtaLabel),
  );
  // C-audit-05: dense poster — accent bar + beat cards + brand fill mid-void
  const beat =
    role === "cover"
      ? "Лучшие фразы клуба живут за столом, не в рилсе."
      : role === "cta_slide"
        ? "Напиши в комментариях — где тишина громче ленты?"
        : "Смех, споры, армянский круг — без камеры.";
  const beatAlt =
    role === "cover"
      ? "Не всё важное помещается в 15 секунд."
      : role === "cta_slide"
        ? "Один комментарий — уже участие в круге."
        : "Камера выключена. Стол включён.";
  const chip =
    role === "cover" ? "01 · HOOK" : role === "cta_slide" ? "03 · CTA" : "02 · VALUE";
  const tileA = role === "cta_slide" ? "Комментарий" : "Стол";
  const tileB = role === "cta_slide" ? "Клуб" : "Тишина";
  return `
    <div class="poster-stack">
      <div>
        <div class="poster-chip">${chip}</div>
        <div class="poster-accent-bar" aria-hidden="true"></div>
        <div class="primary">${p}</div>
        ${s ? `<div class="secondary" style="margin-top:18px;">${s}</div>` : ""}
      </div>
      <div class="poster-mid" aria-hidden="false">
        <div class="poster-beat">
          <span class="poster-beat-label">Vernatun</span>
          ${escapeHtml(beat)}
        </div>
        <div class="poster-tiles">
          <div class="poster-tile">${escapeHtml(tileA)}</div>
          <div class="poster-tile">${escapeHtml(tileB)}</div>
        </div>
        <div class="poster-beat alt">
          <span class="poster-beat-label">Offline > feed</span>
          ${escapeHtml(beatAlt)}
        </div>
        <div class="poster-rule" aria-hidden="true"></div>
        <div class="poster-mark-row">
          ${pomegranateSvg("pomegranate poster-pom")}
          <div>
            <div class="logo-word" style="color:#121212;">VERNATUN</div>
            <div class="eyebrow" style="margin-top:4px;color:#5C534C;">Armenian Club</div>
          </div>
        </div>
        <div class="poster-band">стол · круг · без камеры · Vernatun</div>
      </div>
      <div class="lg-cta">${pill}</div>
    </div>
  `;
}

function cinematicSceneKitHtml(
  role: CarouselSlideRole,
  primary: string,
  secondary: string,
  captionLine: string | undefined,
  defaultCtaLabel?: string,
): string {
  const p = accentMarkup(primary);
  const s = accentMarkup(secondary);
  const pill = escapeHtml(
    resolveCtaPillLabel(secondary, captionLine || defaultCtaLabel),
  );
  // Text-only overlays — photo/people live in background. No icon plates / clocks.
  if (role === "cta_slide") {
    return `
      <div class="cine-stack">
        <div class="primary">${p}</div>
        ${s ? `<div class="secondary">${s}</div>` : ""}
        <div class="lg-cta">${pill}</div>
      </div>
    `;
  }
  return `
    <div class="cine-stack">
      <div class="primary">${p}</div>
      ${s ? `<div class="secondary">${s}</div>` : ""}
    </div>
  `;
}

/** Simple in-frame SVG icons for tip_cards — never empty black rect / placeholder digits. */
function tipCardsIconSvg(kind: "pack" | "talk" | "table"): string {
  if (kind === "pack") {
    return `<svg class="tip-icon" viewBox="0 0 120 120" aria-hidden="true">
      <rect x="18" y="28" width="28" height="64" rx="6" fill="none" stroke="#FFE600" stroke-width="5"/>
      <rect x="46" y="18" width="28" height="74" rx="6" fill="none" stroke="#FFE600" stroke-width="5"/>
      <rect x="74" y="34" width="28" height="58" rx="6" fill="none" stroke="#FFE600" stroke-width="5"/>
      <circle cx="60" cy="96" r="6" fill="#FFE600"/>
    </svg>`;
  }
  if (kind === "talk") {
    return `<svg class="tip-icon" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="40" cy="42" r="16" fill="none" stroke="#FFE600" stroke-width="5"/>
      <circle cx="80" cy="42" r="16" fill="none" stroke="#FFE600" stroke-width="5"/>
      <path d="M22 88c8-18 24-26 38-26s30 8 38 26" fill="none" stroke="#FFE600" stroke-width="5" stroke-linecap="round"/>
      <path d="M52 58c4 6 12 6 16 0" fill="none" stroke="#FFE600" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg class="tip-icon" viewBox="0 0 120 120" aria-hidden="true">
    <rect x="14" y="52" width="92" height="14" rx="4" fill="#FFE600"/>
    <rect x="26" y="66" width="10" height="30" fill="#FFE600"/>
    <rect x="84" y="66" width="10" height="30" fill="#FFE600"/>
    <rect x="42" y="18" width="36" height="58" rx="8" fill="none" stroke="#FFE600" stroke-width="5"/>
    <circle cx="60" cy="68" r="4" fill="#FFE600"/>
    <path d="M30 30 L90 90 M90 30 L30 90" stroke="#FFE600" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}

function tipCardsKitHtml(
  role: CarouselSlideRole,
  primary: string,
  secondary: string,
  captionLine: string | undefined,
  meta: KitSlideMeta,
  defaultCtaLabel?: string,
): string {
  const p = accentMarkup(primary);
  const s = accentMarkup(secondary);
  void meta;
  if (role === "cover") {
    // Tip-pack INTRO — big "3" / TIPS, never stacked 1/2/CTA placeholders
    return `
      <div class="tip-stack">
        <div class="tip-num">3</div>
        <div class="tip-label">TIPS</div>
        <div class="primary">${p}</div>
        ${s ? `<div class="secondary">${s}</div>` : ""}
        <div class="tip-icon-frame">${tipCardsIconSvg("pack")}</div>
      </div>
    `;
  }
  if (role === "cta_slide") {
    const pill = escapeHtml(
      resolveCtaPillLabel(
        secondary,
        captionLine || defaultCtaLabel || "Пиши в комментариях",
      ),
    );
    // Tip 2 + CTA — icon inside frame, never empty black rect / HTML string
    return `
      <div class="tip-stack" style="justify-content:space-between;">
        <div>
          <div class="tip-num" style="font-size:110px;">2</div>
          <div class="tip-label">TIP 2</div>
          <div class="primary">${p}</div>
          ${s ? `<div class="secondary">${s}</div>` : ""}
        </div>
        <div class="tip-icon-frame">${tipCardsIconSvg("table")}</div>
        <div class="lg-cta">${pill}</div>
      </div>
    `;
  }
  // Body = Tip 1 with icon in frame
  return `
    <div class="tip-stack">
      <div class="tip-num">1</div>
      <div class="tip-label">TIP 1</div>
      <div class="primary">${p}</div>
      ${s ? `<div class="secondary">${s}</div>` : ""}
      <div class="tip-icon-frame">${tipCardsIconSvg("talk")}</div>
    </div>
  `;
}

function liveGenAestheticKitHtml(
  aesthetic: LiveGenKitAesthetic,
  role: CarouselSlideRole,
  primary: string,
  secondary: string,
  captionLine: string | undefined,
  meta: KitSlideMeta,
  defaultCtaLabel?: string,
): string {
  if (aesthetic === "clean_poster") {
    return cleanPosterKitHtml(
      role,
      primary,
      secondary,
      captionLine,
      defaultCtaLabel,
    );
  }
  if (aesthetic === "cinematic_scene") {
    return cinematicSceneKitHtml(
      role,
      primary,
      secondary,
      captionLine,
      defaultCtaLabel,
    );
  }
  return tipCardsKitHtml(
    role,
    primary,
    secondary,
    captionLine,
    meta,
    defaultCtaLabel,
  );
}

function buildRoleBodyHtml(
  role: CarouselSlideRole,
  preset: DesignPresetFile,
  primary: string,
  secondary: string,
  captionLine: string | undefined,
  meta: KitSlideMeta,
  kitAesthetic?: LiveGenKitAesthetic,
  defaultCtaLabel?: string,
): string {
  if (kitAesthetic) {
    return liveGenAestheticKitHtml(
      kitAesthetic,
      role,
      primary,
      secondary,
      captionLine,
      meta,
      defaultCtaLabel,
    );
  }
  if (isDarkNotes(preset)) {
    return darkNotesKitHtml(
      role,
      preset,
      primary,
      secondary,
      captionLine,
      meta,
    );
  }
  if (isBentoGlass(preset) || preset.components.card?.glass) {
    return bentoGlassKitHtml(
      role,
      preset,
      primary,
      secondary,
      captionLine,
      meta,
    );
  }

  // Generic fallback (non-golden presets)
  const p = sanitizeOnSlideMarkup(primary);
  const s = sanitizeOnSlideMarkup(secondary);
  const useMarker =
    Boolean(preset.components.markerHighlight) && role === "cover";
  const primaryHtml = useMarker
    ? `<span class="marker-block">${p}</span>`
    : p;
  const showBridge =
    Boolean(preset.components.doodle?.enabled) ||
    preset.components.seamlessConnector?.style === "arrow";

  if (role === "cover") {
    return `
      <div class="kit-stack">
        <div class="primary">${primaryHtml}</div>
        <div class="accent-rule"></div>
        ${s ? `<div class="secondary">${s}</div>` : ""}
        ${showBridge ? doodleBridgeSvg(preset) : ""}
      </div>
    `;
  }

  if (role === "cta_slide") {
    const pillRaw = resolveCtaPillLabel(secondary, captionLine);
    const pill = escapeHtml(pillRaw);
    const showSecondary =
      Boolean(secondary) &&
      secondary.trim().toLowerCase() !== pillRaw.trim().toLowerCase();
    return `
      <div class="kit-stack">
        <div class="primary">${primaryHtml}</div>
        <div class="accent-rule"></div>
        ${showSecondary ? `<div class="secondary">${s}</div>` : ""}
        <div class="cta-pill">${pill}</div>
        ${preset.components.logoMark === "vernatun_pomegranate" ? pomegranateSvg() : ""}
      </div>
    `;
  }

  const checklist =
    preset.components.checkbox && s
      ? `<div class="check-row"><div class="check-box"></div><div>${s}</div></div>`
      : s
        ? `<div class="secondary">${s}</div>`
        : "";
  const gauge = preset.components.gauge?.glow
    ? `<div class="gauge" aria-hidden="true"></div>`
    : "";
  const bridge =
    showBridge && role === "body_slide" ? doodleBridgeSvg(preset) : "";
  const inner = `
      ${gauge}
      <div class="primary">${primaryHtml}</div>
      <div class="accent-rule"></div>
      ${checklist}
      ${bridge}
    `;
  if (preset.components.card?.glass) {
    return `<div class="glass-card">${inner}</div>`;
  }
  return `<div class="kit-stack">${inner}</div>`;
}

/**
 * Build a full HTML document for one carousel slide (CSS vars + role kit + safe-zone).
 */
export function buildCarouselSlideHtmlFromPreset(input: {
  backgroundUrl: string;
  primary: string;
  secondary?: string;
  captionLine?: string;
  role: CarouselSlideRole;
  preset: DesignPresetFile;
  cssVars?: Record<string, string>;
  slideIndex?: number;
  slideTotal?: number;
  bodyOrdinal?: number;
  kitAesthetic?: LiveGenKitAesthetic;
  defaultCtaLabel?: string;
}): string {
  const role = input.role;
  const layoutVariant = roleToLayoutVariant(role);
  const vars = {
    ...designPresetToCssVars(input.preset),
    ...(input.cssVars ?? {}),
  };
  // Fonts as custom props for kits
  vars["--cf-font-display"] = input.preset.typography.display;
  vars["--cf-font-body"] = input.preset.typography.body;
  vars["--cf-font-mono"] =
    input.preset.typography.mono || input.preset.typography.body;
  vars["--cf-font-armenian"] =
    input.preset.typography.armenianSafe ||
    "Noto Sans Armenian, Manrope, sans-serif";
  if (!vars["--cf-design-inverse"]) {
    vars["--cf-design-inverse"] = "#121212";
  }

  const inlineVars = cssVarsToInlineStyle(vars);
  const bg = escapeHtml(input.backgroundUrl);
  const primary = input.primary.trim();
  const secondary = (input.secondary ?? "").trim();
  const captionLine = (input.captionLine ?? "").trim();
  const slideIndex = input.slideIndex ?? 0;
  const slideTotal = input.slideTotal ?? 3;
  const meta: KitSlideMeta = {
    slideIndex,
    slideTotal,
    bodyOrdinal: input.bodyOrdinal ?? (role === "body_slide" ? 0 : -1),
  };

  const kitAesthetic = input.kitAesthetic;
  const denseKit =
    !kitAesthetic &&
    (isDarkNotes(input.preset) || isBentoGlass(input.preset));
  const primarySize =
    role === "cover" ? "56px" : role === "body_slide" ? "44px" : "48px";
  const primaryAlign = kitAesthetic
    ? "left"
    : denseKit
      ? "left"
      : role === "cover"
        ? "center"
        : "left";
  const contentJustify = kitAesthetic
    ? kitAesthetic === "cinematic_scene"
      ? "flex-end"
      : "flex-start"
    : role === "cta_slide"
      ? "flex-end"
      : denseKit
        ? "flex-start"
        : role === "cover"
          ? "center"
          : "flex-start";

  const bodyHtml = buildRoleBodyHtml(
    role,
    input.preset,
    primary,
    secondary,
    captionLine || undefined,
    meta,
    kitAesthetic,
    input.defaultCtaLabel,
  );

  // LIVE-GEN aesthetics: never inject doodle / chalk / bento ambient chrome
  const showDoodleChrome =
    !kitAesthetic && Boolean(input.preset.components.doodle?.enabled);
  const showChalkGrid = !kitAesthetic && isDarkNotes(input.preset);
  const showBentoGlow = !kitAesthetic && isBentoGlass(input.preset);
  const slideNum = padSlideNum(slideIndex + 1);

  // Soft scrim for photo bg; denser kits keep chalk/glass readable on solid fills
  // Live-gen: lighter scrim so full-bleed hero / people stay visible
  const scrimOpacity = kitAesthetic
    ? kitAesthetic === "tip_cards"
      ? "0.55"
      : kitAesthetic === "clean_poster"
        ? "0.35"
        : "0.45"
    : denseKit
      ? "0.2"
      : "1";

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=${CAROUSEL_FRAME_WIDTH}"/>
<meta name="cf-layout" content="${layoutVariant}"/>
<meta name="cf-preset" content="${escapeHtml(input.preset.preset)}"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Noto+Sans+Armenian:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${CAROUSEL_FRAME_WIDTH}px;
    height: ${CAROUSEL_FRAME_HEIGHT}px;
    overflow: hidden;
    background: var(--cf-design-bg);
  }
  .frame {
    position: relative;
    width: ${CAROUSEL_FRAME_WIDTH}px;
    height: ${CAROUSEL_FRAME_HEIGHT}px;
    background: var(--cf-design-bg);
  }
  .bg {
    position: absolute;
    inset: 0;
    background-image: url("${bg}");
    background-size: cover;
    background-position: center;
  }
  .scrim {
    position: absolute;
    inset: 0;
    opacity: ${scrimOpacity};
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--cf-design-bg) 35%, transparent) 0%,
      color-mix(in srgb, var(--cf-design-bg) 15%, transparent) 40%,
      color-mix(in srgb, var(--cf-design-bg) 72%, transparent) 100%
    );
  }
  .safe {
    position: absolute;
    top: ${CAROUSEL_SAFE.top}px;
    bottom: ${CAROUSEL_SAFE.bottom}px;
    left: ${CAROUSEL_SAFE.left}px;
    right: ${CAROUSEL_SAFE.right}px;
    display: flex;
    flex-direction: column;
    justify-content: ${contentJustify};
    gap: 28px;
    z-index: 2;
    ${denseKit ? "height: auto;" : ""}
  }
  .safe > .kit-stack { flex: 1 1 auto; width: 100%; }
  .primary {
    font-family: var(--cf-font-armenian, var(--cf-font-display));
    font-weight: 700;
    font-size: ${primarySize};
    line-height: 1.12;
    letter-spacing: 0.01em;
    color: var(--cf-design-text);
    text-align: ${primaryAlign};
    text-shadow: 0 2px 24px rgba(0,0,0,0.55);
  }
  .accent-rule {
    width: ${role === "cover" ? "120px" : "72px"};
    height: 2px;
    background: linear-gradient(90deg, var(--cf-design-accent), color-mix(in srgb, var(--cf-design-accent) 40%, white));
    ${primaryAlign === "center" ? "margin: 0 auto;" : ""}
    opacity: 0.9;
  }
  .secondary {
    font-family: var(--cf-font-body);
    font-weight: 400;
    font-size: 28px;
    line-height: 1.4;
    color: color-mix(in srgb, var(--cf-design-text) 90%, transparent);
    text-align: ${primaryAlign};
    max-width: 100%;
    text-shadow: 0 1px 16px rgba(0,0,0,0.5);
  }
  ${kitAesthetic ? liveGenKitChrome(kitAesthetic) : kitChrome(input.preset, role)}
</style>
</head>
<body>
  <div class="frame" style="${inlineVars}" data-role="${role}" data-layout="${layoutVariant}" data-preset="${escapeHtml(input.preset.preset)}" ${kitAesthetic ? `data-kit="${kitAesthetic}"` : ""}>
    <div class="bg"></div>
    <div class="scrim"></div>
    ${showChalkGrid ? `<div class="chalk-grid" aria-hidden="true"></div>` : ""}
    ${showBentoGlow ? `<div class="ambient-glow a" aria-hidden="true"></div>` : ""}
    ${
      showDoodleChrome
        ? `<div class="doodle-dot a"></div><div class="doodle-dot b"></div>${doodleSwirlSvg(input.preset)}`
        : ""
    }
    <div class="safe">
      ${bodyHtml}
    </div>
    ${kitAesthetic ? "" : `<div class="slide-num">${slideNum}</div>`}
  </div>
</body>
</html>`;
}

/**
 * Legacy builder — maps layout_variant → role; uses default Vernatun preset
 * when no DesignPresetFile provided (hardcoded hex avoided via CSS vars).
 */
export function buildCarouselSlideHtml(input: {
  backgroundUrl: string;
  primary: string;
  secondary?: string;
  layout_variant?: string;
  preset?: DesignPresetFile;
  cssVars?: Record<string, string>;
  slideIndex?: number;
  slideTotal?: number;
}): string {
  const total = input.slideTotal ?? 3;
  const index0 = input.slideIndex ?? 0;
  const role = normalizeCarouselSlideRole(
    input.layout_variant,
    index0,
    total,
  );
  const preset = input.preset ?? createDefaultVernatunPreset();
  return buildCarouselSlideHtmlFromPreset({
    backgroundUrl: input.backgroundUrl,
    primary: input.primary,
    secondary: input.secondary,
    role,
    preset,
    cssVars: input.cssVars,
    slideIndex: index0,
    slideTotal: total,
    bodyOrdinal: role === "body_slide" ? Math.max(0, index0 - 1) : -1,
  });
}

/**
 * Pure HTML frame builder (Architect carouselHtmlBuilder contract).
 */
export function carouselHtmlBuilder(
  input: CarouselHtmlBuilderInput,
): CarouselHtmlBuilderOutput {
  const slides = Array.isArray(input.slides) ? input.slides : [];
  const cssVarsApplied = designPresetToCssVars(
    input.preset,
    input.cssVars,
  );
  cssVarsApplied["--cf-font-display"] = input.preset.typography.display;
  cssVarsApplied["--cf-font-body"] = input.preset.typography.body;

  let bodyOrdinalCursor = 0;
  const frames: CarouselHtmlBuilderFrame[] = slides.map((slide, i) => {
    const role = normalizeCarouselSlideRole(
      slide.role ?? slide.layout_variant,
      i,
      slides.length,
    );
    const bodyOrdinal =
      role === "body_slide" ? bodyOrdinalCursor++ : -1;
    const primary =
      (slide.headline ?? slide.primary_copy ?? "").trim() || `Slide ${i + 1}`;
    const secondary = (slide.body ?? slide.secondary_copy ?? "").trim();
    const captionLine = (slide.captionLine ?? slide.cta_label ?? "").trim();
    const bg =
      (input.backgroundUrls?.[i] && String(input.backgroundUrls[i])) ||
      solidPresetBackgroundDataUri(input.preset.colors.bg);

    const html = buildCarouselSlideHtmlFromPreset({
      backgroundUrl: bg,
      primary,
      secondary,
      captionLine: captionLine || undefined,
      role,
      preset: input.preset,
      cssVars: cssVarsApplied,
      slideIndex: i,
      slideTotal: slides.length,
      bodyOrdinal,
      kitAesthetic: input.kitAesthetic,
      defaultCtaLabel: input.defaultCtaLabel,
    });

    return {
      index: i + 1,
      role,
      layoutVariant: roleToLayoutVariant(role),
      html,
      primary,
      secondary,
    };
  });

  return { frames, cssVarsApplied };
}

function slideFileName(index1Based: number): string {
  return `slide_${String(index1Based).padStart(2, "0")}.png`;
}

function publicCarouselDir(jobId: string): string {
  return path.join(process.cwd(), "public", "generated", "carousel", jobId);
}

function publicCarouselUrl(jobId: string, fileName: string): string {
  return `/generated/carousel/${jobId}/${fileName}`;
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

async function screenshotHtmlToPng(
  html: string,
  outPath: string,
): Promise<boolean> {
  try {
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
    try {
      const page = await browser.newPage({
        viewport: {
          width: CAROUSEL_FRAME_WIDTH,
          height: CAROUSEL_FRAME_HEIGHT,
        },
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: "networkidle", timeout: 45_000 });
      await page.screenshot({
        path: outPath,
        type: "png",
        clip: {
          x: 0,
          y: 0,
          width: CAROUSEL_FRAME_WIDTH,
          height: CAROUSEL_FRAME_HEIGHT,
        },
      });
      await page.close();
      return true;
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch {
    return false;
  }
}

function captionFromSlide(slide: CarouselSlideJson): string {
  const primary = slide.primary_copy?.trim() || "";
  const secondary = slide.secondary_copy?.trim() || "";
  if (primary && secondary) return `${primary}\n${secondary}`;
  return primary || secondary || "";
}

/**
 * Strip phrases that cause accidental baked "HTML" / "ESPRESSO" / placeholder stacks.
 * Phase4 E2E: do NOT append the NO-letters ban (typography must stay in prompt).
 * Legacy bg-only: append ABSOLUTELY NO readable text.
 */
export function sanitizeLiveGenVisualPrompt(
  raw: string,
  opts?: { allowReadableText?: boolean },
): string {
  let s = raw.trim();
  if (!s) return s;
  s = s.replace(/\bvia\s+HTML\b/gi, "via overlay typography");
  s = s.replace(/\bfor\s+HTML\b/gi, "for overlay typography");
  s = s.replace(/\bHTML\s+(type|text|headline|marketing|button|question)\b/gi, "overlay $1");
  s = s.replace(/\bHTML\b/gi, "overlay");
  s = s.replace(/\bESPRESSO(\s+PLATE)?\b/gi, "coffee product");
  s = s.replace(
    /\b(stacked\s+)?(placeholder\s+)?(1\s*\/\s*2\s*\/\s*CTA|1\s*\/\s*2\s*\/\s*3)\b/gi,
    "clean visual focal point",
  );
  const allowText =
    opts?.allowReadableText === true || isCarouselE2eTextInImage();
  if (!allowText) {
    s = `${s} ABSOLUTELY NO readable text, letters, acronyms, or digit labels in the image.`;
  }
  return s.replace(/\s+/g, " ").trim();
}

/** Approximate brand color line from DesignPresetFile for image prompts. */
export function formatApproxBrandColorsForPrompt(
  preset: DesignPresetFile,
): string {
  const c = preset.colors;
  const ty = preset.typography;
  const parts = [
    `bg ${c.bg}`,
    `surface ${c.surface}`,
    `text ${c.text}`,
    `muted ${c.muted}`,
    `accent ${c.accent}`,
  ];
  if (c.accentSoft) parts.push(`accentSoft ${c.accentSoft}`);
  const typeHint = [
    ty?.display ? `display ${ty.display}` : "",
    ty?.body ? `body ${ty.body}` : "",
    ty?.armenianSafe ? `armenianSafe ${ty.armenianSafe}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  return `Approx brand colors: ${parts.join(", ")}.${typeHint ? ` Type hints: ${typeHint}.` : ""}`;
}

/**
 * Phase4: one integrated prompt per slide — scene + EXACT typography in pixels.
 */
export function buildE2eIntegratedSlidePrompt(input: {
  slide: CarouselSlideJson;
  slideIndex0: number;
  preset: DesignPresetFile;
  topicTitle: string;
  rootCtaLabel?: string;
  rootCtaType?: number | null;
}): string {
  const { slide, slideIndex0, preset, topicTitle } = input;
  const primary = slide.primary_copy?.trim() || "";
  const secondary = slide.secondary_copy?.trim() || "";
  const vp = sanitizeLiveGenVisualPrompt(slide.visual_prompt?.trim() || "", {
    allowReadableText: true,
  });
  const slideCta =
    resolveCtaCatalogLabel(slide.cta_type) ||
    resolveCtaCatalogLabel(input.rootCtaType) ||
    input.rootCtaLabel;
  const isCtaSlide =
    /cta/i.test(String(slide.layout_variant ?? "")) || Boolean(slide.cta_type);
  const colorLine = formatApproxBrandColorsForPrompt(preset);
  const parts = [
    `Premium Instagram carousel SLIDE (not background-only), vertical 4:5 portrait 1080×1350, expensive editorial craft, integrated typography painted into the photograph — not a UI overlay look.`,
    colorLine,
    `Scene / mood: ${vp || `Elegant Vernatun editorial atmosphere for slide ${slideIndex0 + 1}`}.`,
    primary
      ? `Paint EXACT readable headline (sharp legible glyphs, Armenian/Latin/Cyrillic as given): "${primary}".`
      : "",
    secondary
      ? `Paint EXACT readable body copy: "${secondary}".`
      : "",
    isCtaSlide && slideCta
      ? `Paint a premium on-pixel CTA control / pill with EXACT label: "${slideCta}".`
      : "",
    `Safe-zone: keep all typography inside margins top≥120px, bottom≥160px, sides≥80px.`,
    `Do NOT paint swipe_trigger. No purple AI-slop. No stacked placeholder labels like 1/2/CTA. Sharp expensive Instagram carousel craft.`,
    `Topic: ${topicTitle}. Slide ${slideIndex0 + 1} · layout=${slide.layout_variant}.`,
  ];
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Phase5 ANCHOR REF: cover = full E2E; slides 2–N = MASTER STYLE + new exact copy.
 */
export function buildAnchorRefIntegratedSlidePrompt(input: {
  slide: CarouselSlideJson;
  slideIndex0: number;
  preset: DesignPresetFile;
  topicTitle: string;
  rootCtaLabel?: string;
  rootCtaType?: number | null;
  masterStyleBlock?: string;
}): string {
  const base = buildE2eIntegratedSlidePrompt(input);
  if (input.slideIndex0 === 0) {
    return `${buildAnchorRefCoverPromptPrefix()} ${base}`.replace(/\s+/g, " ").trim();
  }
  const master =
    input.masterStyleBlock?.trim() ||
    buildMasterStyleLockedBlock({
      coverVisualPrompt: "",
      approxColorsLine: formatApproxBrandColorsForPrompt(input.preset),
    });
  return `${buildAnchorRefFollowupPromptPrefix(master)}\n\n${base}`
    .replace(/[ \t]+/g, " ")
    .trim();
}

async function downloadImageUrlToPngFile(
  url: string,
  outPath: string,
): Promise<boolean> {
  try {
    if (url.startsWith("data:")) {
      const b64 = url.split(",")[1];
      if (!b64) return false;
      await writeFile(outPath, Buffer.from(b64, "base64"));
      return true;
    }
    const res = await fetch(url);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 32) return false;
    await writeFile(outPath, buf);
    return true;
  } catch {
    return false;
  }
}

/** Playwright setContent cannot reliably load file:// bg — embed as data URI. */
async function fileToDataUri(absPath: string): Promise<string | null> {
  try {
    const buf = await readFile(absPath);
    if (buf.length < 32) return null;
    const ext = path.extname(absPath).toLowerCase();
    const mime =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".svg"
            ? "image/svg+xml"
            : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Punch edge-connected white/cream matte plate around circular Vernatun mark.
 * Keeps interior white mountain peaks (not edge-connected). Soft-fail → null.
 */
async function stripLogoEdgeMatteDataUri(
  src: string,
): Promise<string | null> {
  const raw = (src ?? "").trim();
  if (!raw || raw.startsWith("data:image/svg")) return null;
  try {
    const sharp = (await import("sharp")).default;
    let input: Buffer;
    if (raw.startsWith("data:")) {
      const b64 = raw.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      input = Buffer.from(b64, "base64");
    } else if (raw.startsWith("file://")) {
      const { fileURLToPath } = await import("node:url");
      input = await readFile(fileURLToPath(raw));
    } else if (raw.startsWith("/") || !raw.includes("://")) {
      const abs = path.isAbsolute(raw)
        ? raw
        : path.join(process.cwd(), "public", raw.replace(/^\//, ""));
      input = await readFile(abs);
    } else {
      return null;
    }
    const { data, info } = await sharp(input)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const px = Buffer.from(data);
    const visited = new Uint8Array(w * h);
    const queue: number[] = [];
    const isMatte = (i: number): boolean => {
      const o = i * 4;
      const a = px[o + 3]!;
      const r = px[o]!;
      const g = px[o + 1]!;
      const b = px[o + 2]!;
      if (a < 12) return true;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      // white / cream / light-gray plate only (not orange art)
      return lum >= 200 && sat < 40;
    };
    const push = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const i = y * w + x;
      if (visited[i]) return;
      if (!isMatte(i)) return;
      visited[i] = 1;
      queue.push(i);
    };
    for (let x = 0; x < w; x++) {
      push(x, 0);
      push(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      push(0, y);
      push(w - 1, y);
    }
    let punched = 0;
    while (queue.length) {
      const i = queue.pop()!;
      const o = i * 4;
      if (px[o + 3]! >= 12) {
        px[o + 3] = 0;
        punched++;
      }
      const x = i % w;
      const y = (i / w) | 0;
      push(x + 1, y);
      push(x - 1, y);
      push(x, y + 1);
      push(x, y - 1);
    }
    if (punched < 8) return null;
    const out = await sharp(px, {
      raw: { width: w, height: h, channels: 4 },
    })
      .png()
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

/** True when logoRef is an LLM sanitize stub — unusable as Playwright <img> src. */
export function isSanitizedLogoStub(ref: string | undefined | null): boolean {
  const raw = (ref ?? "").trim();
  if (!raw) return false;
  if (/^\[brand logo present/i.test(raw)) return true;
  if (/\[truncated\s+\d+\s+chars\]/i.test(raw)) return true;
  return false;
}

/**
 * Resolve logo for Puppeteer: prefer logoRefRaw / brand store raw.
 * Never feed sanitized LLM stubs into <img src>.
 */
async function resolveBrandLogoForPlaywright(
  placeholders?: CorrectPipelinePlaceholders,
): Promise<string | undefined> {
  const preferRaw = (placeholders?.logoRefRaw ?? "").trim();
  if (preferRaw && !isSanitizedLogoStub(preferRaw)) {
    return resolvePlaywrightImageSrc(preferRaw);
  }
  const logoRef = (placeholders?.logoRef ?? "").trim();
  if (logoRef && !isSanitizedLogoStub(logoRef)) {
    return resolvePlaywrightImageSrc(logoRef);
  }
  // Fresh Brand store — uploaded data-URL / path (never sanitized)
  try {
    const userId =
      process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
    const brand = await getBrandSettings(userId);
    const brandRaw = (brand.logoRef ?? "").trim();
    if (brandRaw && !isSanitizedLogoStub(brandRaw)) {
      return resolvePlaywrightImageSrc(brandRaw);
    }
  } catch {
    /* ignore store miss */
  }
  return undefined;
}

async function resolvePlaywrightImageSrc(
  ref: string | undefined | null,
): Promise<string | undefined> {
  const raw = (ref ?? "").trim();
  if (!raw) return undefined;
  if (isSanitizedLogoStub(raw)) return undefined;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const local = resolveAssetUrlForPlaywright(raw);
  if (!local) return undefined;
  if (local.startsWith("file://")) {
    try {
      const { fileURLToPath } = await import("node:url");
      const abs = fileURLToPath(local);
      const data = await fileToDataUri(abs);
      if (data) return data;
    } catch {
      /* fall through */
    }
  }
  if (raw.startsWith("/") || !raw.includes("://")) {
    const abs = path.isAbsolute(raw)
      ? raw
      : path.join(process.cwd(), "public", raw.replace(/^\//, ""));
    const data = await fileToDataUri(abs);
    if (data) return data;
    // Also try cwd-relative (uploaded under data/local/brand-logos/…)
    const cwdAbs = path.isAbsolute(raw)
      ? raw
      : path.join(process.cwd(), raw.replace(/^\//, ""));
    if (cwdAbs !== abs) {
      const data2 = await fileToDataUri(cwdAbs);
      if (data2) return data2;
    }
  }
  return local;
}

/**
 * Create draw — S57 layered_html (product default) or archaeology paint paths.
 *
 * Layered (default): bg-only image → HTML/CSS Puppeteer → PNG 1080×1350.
 * Vision OFF. Brand/fonts/CTA/characters in HTML.
 *
 * Archaeology: correct / e2e / anchor when layered gate is OFF.
 */
export async function runCreateCarouselDraw(
  json: CarouselHandoffJson,
  opts?: {
    model?: string;
    jobId?: string;
    designMarkdown?: string;
    presetFile?: DesignPresetFile | null;
    /** Copy sliced PNGs into generatedMedia/wave-visual-deconstructor/{preset}/ */
    copyToWaveArtifacts?: boolean;
    /** LIVE-GEN only: distinct overlay packs (skips bento espresso/clocks) */
    kitAesthetic?: LiveGenKitAesthetic;
    defaultCtaLabel?: string;
    /**
     * Phase5 bake-off: sequential cover-first + ref/MASTER STYLE.
     * Also enabled via env CAROUSEL_DRAW_MODE=anchor_ref.
     */
    drawMode?: CreateCarouselDrawMode;
    /** Product: layered_html (default). Archaeology: correct. */
    pipeline?: CreateCarouselPipeline;
    /** Brand / Landscapes / mode placeholders. */
    placeholders?: CorrectPipelinePlaceholders;
    /** Skip vision gate even on correct archaeology (tests). */
    skipVision?: boolean;
    /** Optional character cut-out photo URL (Персонажи) — HTML OVER bg. */
    characterCutoutUrl?: string;
    /**
     * Dual paint: `in_image` | `overlay_cutout` | `none`.
     * Alias job `character_path`. Product default = in_image.
     */
    characterPaint?: CharacterPaintPath;
    /**
     * When overlay_cutout: generate fresh SINGLE pose plates via image model
     * (cover+last), using character sheet as style ref only.
     * Soft-fail → crop ONE cell from the sheet (never paste whole multi-pose sheet).
     * Default ON when characterPaint=overlay_cutout.
     */
    generateCutoutPoses?: boolean;
    /**
     * Vision style-copy (wave 2026-10-18): etalon image reference path.
     * `vision_ref` = attach sliced slots as multimodal/i2i refs; skip FULL token card.
     */
    styleCopyMode?: StyleCopyMode;
    styleCopyPackId?: StyleCopyPackId;
    styleCopyPackPath?: string;
    styleCopySlots?: StyleCopySlotPack;
    /** Vernatun TZ: Mode A HTML/CSS or Mode B full AI slide. */
    buildMode?: "A" | "B";
  },
): Promise<RunCreateCarouselDrawResult> {
  const slides = json.slides;
  if (!Array.isArray(slides) || slides.length < 1) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "carousel_json_invalid",
        message: createCarouselErrorMessage("carousel_json_invalid"),
      },
    };
  }

  // Product path (2026-10-21): Vernatun A/B orchestrator. Legacy only if CAROUSEL_LEGACY_DRAW=1.
  if (process.env.CAROUSEL_LEGACY_DRAW?.trim() !== "1") {
    const { runVernatunAsCreateDraw } = await import(
      "@/lib/studio/vernatun-carousel/draw-bridge"
    );
    const bridged = await runVernatunAsCreateDraw(json, {
      // Mode A removed — carousels always generate full AI slides (Mode B).
      buildMode: "B",
      jobId: opts?.jobId,
      topic:
        String(json.idea ?? "").trim() ||
        String(json.hook ?? "").trim() ||
        undefined,
    });
    return bridged as RunCreateCarouselDrawResult;
  }

  const layeredOn = isCarouselLayeredHtmlPipeline(opts?.pipeline);
  const correctOn =
    !layeredOn && isCarouselCorrectPipeline(opts?.pipeline);
  // Layered kills E2E type-on-PNG as product success.
  const e2eOn =
    !layeredOn && (correctOn || isCarouselE2eTextInImage());
  const anchorRef =
    !layeredOn && !correctOn && isCarouselAnchorRef(opts?.drawMode);
  const htmlFirst = layeredOn
    ? true
    : correctOn
      ? false
      : isCarouselHtmlFirstDraw();
  const skipAllBg = isCarouselDrawSkipBg();
  const warrantFlags = slides.map((slide) =>
    slideWarrantsOptionalBg({
      visualPrompt: slide.visual_prompt,
      kitAesthetic: opts?.kitAesthetic,
      htmlFirst,
    }),
  );
  const aggregatorReady = Boolean(resolveAggregatorEnv());

  // Layered + E2E require aggregator for bg / paint images.
  if ((layeredOn || e2eOn) && !aggregatorReady) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "missing_key",
        message: createCarouselErrorMessage("missing_key"),
      },
    };
  }
  if (!layeredOn && !e2eOn && !htmlFirst && !aggregatorReady) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "missing_key",
        message: createCarouselErrorMessage("missing_key"),
      },
    };
  }

  const budgetReserve = await reservePngBudget(slides.length);
  if (!budgetReserve.ok) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "png_budget_exhausted",
        message:
          budgetReserve.stopReport ||
          `Лимит PNG волны исчерпан (${budgetReserve.state.count}/${budgetReserve.state.max}).`,
      },
    };
  }

  const model =
    opts?.model?.trim() ||
    process.env.CAROUSEL_IMAGE_MODEL?.trim() ||
    DEFAULT_CAROUSEL_IMAGE_MODEL;
  const jobId = (opts?.jobId?.trim() || randomUUID()).replace(
    /[^a-zA-Z0-9_-]/g,
    "",
  );
  const outDir = publicCarouselDir(jobId);
  await mkdir(outDir, { recursive: true });

  const title =
    json.idea?.trim() ||
    json.hook?.trim() ||
    json.caption?.trim().slice(0, 80) ||
    "Vernatun carousel";

  let preset: DesignPresetFile | null = opts?.presetFile ?? null;
  if (!preset) {
    const synced = await readSyncedActiveDesign();
    preset = synced?.presetFile ?? null;
  }
  if (!preset) {
    preset = createDefaultVernatunPreset("Active Vernatun");
  }

  const designMd =
    opts?.designMarkdown?.trim() || preset.designMd || "";
  const designExcerpt = excerptDesignForPrompt(designMd);
  const presetLine = excerptPresetForPrompt(preset);
  const brandLine =
    [presetLine, designExcerpt].filter(Boolean).join(" ") ||
    `Brand: Vernatun Armenian club — dark luxury night atmosphere, warm cognac and soft gold accents.`;

  const solidBg = solidPresetBackgroundDataUri(preset.colors.bg);
  const rootCtaLabel =
    opts?.defaultCtaLabel ||
    resolveCtaCatalogLabel(json.cta_type) ||
    undefined;
  const promptTraceEnabled =
    process.env.CAROUSEL_PROMPT_TRACE?.trim() === "1";
  const cssVarsApplied = designPresetToCssVars(preset);

  // ─── S57 LAYERED HTML (product primary) ────────────────────────────────
  if (layeredOn) {
    // Variant A — Designer pack (image_prompt + html_layout) before bg gen
    // Product default = in_image (wave vision-style-copy); overlay_cutout = legacy only.
    const characterPaint: CharacterPaintPath =
      opts?.characterPaint ??
      (opts?.characterCutoutUrl || json.character_id
        ? DEFAULT_CHARACTER_PAINT
        : "none");

    const styleCopyMode: StyleCopyMode =
      opts?.styleCopyMode === "vision_ref" || opts?.styleCopyMode === "token_card"
        ? opts.styleCopyMode
        : "token_card";
    const visionRef = styleCopyMode === "vision_ref";

    let styleCopyPackId: string | undefined;
    let styleCopySlots: StyleCopySlotPack | undefined;
    let styleCopySlotMap: Array<{
      slide: number;
      slot: string;
      refPath?: string;
      refKind?: string;
    }> = [];
    let packReferenceImage: DrawReferenceImageSignal | null = null;

    if (visionRef) {
      try {
        const resolved = await resolveStyleCopySlots({
          packId: opts?.styleCopyPackId,
          packPath: opts?.styleCopyPackPath,
          slots: opts?.styleCopySlots,
        });
        styleCopyPackId = resolved.packId;
        styleCopySlots = resolved.slots;
        const coverSig = slotRefToDrawSignal(resolved.slots, "cover");
        packReferenceImage = coverSig;
      } catch (err) {
        return {
          ok: false,
          source: "error",
          error: {
            code: "generate_slides_fail",
            message: `style_copy_slots: ${
              err instanceof Error ? err.message : String(err)
            }`,
          },
        };
      }
    }

    const designerPack = await ensureDesignerVariantAPack(json, {
      placeholders: opts?.placeholders,
      designMarkdown: designMd,
      requireLlm: process.env.VARIANT_A_REQUIRE_DESIGNER_LLM === "1",
      layoutMap: visionRef ? null : preset?.layoutMap ?? null,
      characterPaint,
      styleCopyMode,
      referenceImage: packReferenceImage,
      referenceImagePaths:
        visionRef && styleCopySlots
          ? collectSlotImagePaths(styleCopySlots)
          : null,
    });
    if (!designerPack.ok) {
      return {
        ok: false,
        source: "error",
        error: {
          code: designerPack.code,
          message: designerPack.error,
        },
        ...(designerPack.promptDump
          ? { designerPromptDump: designerPack.promptDump }
          : {}),
      };
    }
    const layeredJson = designerPack.handoff;
    const slides = layeredJson.slides;

    if (visionRef && styleCopySlots) {
      styleCopySlotMap = slides.map((_s, i) => {
        const slot = mapSlideToRefSlot(i + 1, slides.length);
        const refPath = slotRefPath(styleCopySlots!, slot);
        return {
          slide: i + 1,
          slot,
          refPath,
          refKind: "path",
        };
      });
    }

    const paletteJson =
      opts?.placeholders?.designPaletteJson?.trim() ||
      JSON.stringify({
        bg: preset!.colors.bg,
        text: preset!.colors.text,
        accent: preset!.colors.accent,
        muted: preset!.colors.muted,
      });

    const fonts = await ensureCarouselFonts({
      preset: preset!,
      designMd,
    });
    // vision_ref: style SoT = etalon image — do not treat Manrope seed as style SoT
    // Phase 2: scrub Manrope @font-face / Google import from composite CSS.
    if (visionRef) {
      const mirrorStack = "Geist Sans, system-ui, sans-serif";
      const hyStack = "Noto Sans Armenian, system-ui, sans-serif";
      fonts.cssVars["--cf-font-title"] = mirrorStack;
      fonts.cssVars["--cf-font-body"] = mirrorStack;
      fonts.cssVars["--cf-font-content"] = hyStack;
      fonts.cssVars["--cf-font-display"] = mirrorStack;
      fonts.cssVars["--cf-font-armenian"] = hyStack;
      for (const f of fonts.fonts) {
        if (f.role === "content") {
          f.familyName = "Noto Sans Armenian";
          f.cssFamily = hyStack;
        } else {
          f.familyName = "etalon_mirror";
          f.cssFamily = mirrorStack;
        }
      }
      fonts.fontFaceCss = (fonts.fontFaceCss ?? "")
        .split(/\n(?=@font-face)|(?=@import)/)
        .filter((block) => {
          const b = block.trim();
          if (!b) return false;
          if (/Manrope/i.test(b)) return false;
          if (/Cormorant/i.test(b)) return false;
          if (/family=Manrope/i.test(b)) return false;
          return true;
        })
        .join("\n");
      // Keep Noto Armenian face only when local woff2 present
      const noto = fonts.fonts.find((f) => f.role === "content");
      if (noto?.localWoff2Url) {
        fonts.fontFaceCss = `@font-face {
  font-family: "Noto Sans Armenian";
  src: url("${noto.localWoff2Url}") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: block;
}`;
      } else {
        fonts.fontFaceCss = "";
      }
    }

    const brandName =
      opts?.placeholders?.brandName?.trim() || "Vernatun";
    // HIGVEN / characterPaint=none: FULL Brand logoRef (vernatun-logo.png) — not emblem-only.
    // Else Path A: prefer crisp emblem PNG + HTML wordmark.
    const preferFullBrandLogo =
      characterPaint === "none" ||
      /vernatun-logo\.png/i.test(
        (opts?.placeholders?.logoRef ?? "").trim() +
          (opts?.placeholders?.logoRefRaw ?? ""),
      );
    let logoUrl: string | undefined;
    let usingFullWordmarkPng = false;
    if (preferFullBrandLogo) {
      logoUrl = await resolveBrandLogoForPlaywright(opts?.placeholders);
      usingFullWordmarkPng = Boolean(
        logoUrl &&
          /vernatun-logo\.png/i.test(
            (opts?.placeholders?.logoRef ?? "").trim() +
              (opts?.placeholders?.logoRefRaw ?? ""),
          ),
      );
      if (!logoUrl) {
        logoUrl = await resolvePlaywrightImageSrc(BRAND_EMBLEM_REF);
        usingFullWordmarkPng = false;
      }
    } else {
      logoUrl = await resolvePlaywrightImageSrc(BRAND_EMBLEM_REF);
      if (!logoUrl) {
        logoUrl = await resolveBrandLogoForPlaywright(opts?.placeholders);
      }
    }
    // Strip edge white/cream matte plate around circular mark (keep alpha art).
    if (logoUrl) {
      const stripped = await stripLogoEdgeMatteDataUri(logoUrl);
      if (stripped) logoUrl = stripped;
    }
    const cutoutRaw =
      opts?.characterCutoutUrl?.trim() ||
      (() => {
        // Best-effort: first http(s)/file photo from catalog JSON (not LLM-sanitized stubs)
        const cat = opts?.placeholders?.characterCatalog?.trim();
        if (!cat || cat === "[]") return "";
        try {
          const arr = JSON.parse(cat) as Array<{
            photoUrls?: string[];
          }>;
          for (const c of arr) {
            for (const u of c.photoUrls ?? []) {
              if (
                /^https?:\/\//i.test(u) ||
                u.startsWith("file://") ||
                u.startsWith("data:image") ||
                u.startsWith("/")
              ) {
                return u;
              }
            }
          }
        } catch {
          /* ignore */
        }
        return "";
      })();
    const characterPhoto = cutoutRaw
      ? await resolvePlaywrightImageSrc(cutoutRaw)
      : null;
    const hasHero =
      layeredJson.character_id != null ||
      Boolean(characterPhoto) ||
      Boolean(cutoutRaw) ||
      // vision_ref + in_image: always paint conductor on cover/cta even if catalog path flaky
      (visionRef && characterPaint === "in_image");
    const useHtmlCutout =
      characterPaint === "overlay_cutout" &&
      Boolean(characterPhoto || cutoutRaw);

    const conductorDesc =
      "Vernatun conductor «Ануш» matching catalog identity — same drawing language as etalon (not Pixar / not forced 3D invent): long dark wavy hair, red traditional dress with gold trim, white apron, warm friendly face, presenter stance facing camera";

    const imagePrompts: string[] = slides.map((slide, i) => {
      // vision_ref HARD: always rebuild plate+object prompt (ignore lifestyle kitchen invent)
      if (visionRef) {
        const coverOrCta = i === 0 || i >= slides.length - 1;
        let prompt = buildVisionRefBackgroundImagePrompt({
          visualPrompt: slide.visual_prompt ?? "",
          primaryCopy: slide.primary_copy,
          paletteJson,
          slideIndex0: i,
          slideTotal: slides.length,
          characterPaint,
          forceConductor: characterPaint === "in_image" && coverOrCta,
        });
        const check = assertBackgroundOnlyPrompt(prompt);
        if (!check.ok) {
          prompt = buildVisionRefBackgroundImagePrompt({
            visualPrompt: slide.visual_prompt ?? slide.primary_copy ?? "",
            slideIndex0: i,
            slideTotal: slides.length,
            characterPaint,
            forceConductor: characterPaint === "in_image" && coverOrCta,
          });
        }
        return prompt;
      }

      const existing = slide.image_prompt?.trim();
      let visual = slide.visual_prompt ?? "";
      if (characterPaint === "in_image" && hasHero) {
        visual = `${visual}. Include ${conductorDesc} IN the scene as conductor presenting to camera (WITH environment) — NOT a story actor inside the plot.`;
      }
      let prompt = existing
        ? sanitizeBackgroundImagePrompt(existing, characterPaint)
        : buildLayeredBackgroundImagePrompt({
            visualPrompt: visual,
            paletteJson,
            slideIndex0: i,
            characterPaint,
          });
      if (characterPaint === "in_image" && hasHero && existing) {
        prompt = sanitizeBackgroundImagePrompt(
          `${prompt} ${conductorDesc} in scene as to-camera conductor.`,
          characterPaint,
        );
      }
      const check = assertBackgroundOnlyPrompt(prompt);
      if (!check.ok) {
        prompt = buildLayeredBackgroundImagePrompt({
          visualPrompt: visual,
          paletteJson,
          slideIndex0: i,
          characterPaint,
        });
      }
      return prompt;
    });

    // overlay_cutout: SINGLE pose plates for cover+last (sheet = style ref only).
    // Never paste the multi-pose sheet grid into HTML cutout.
    const cutoutBySlide: Array<string | null> = slides.map(() => null);
    const cutoutPoseDir = path.join(
      process.cwd(),
      "generatedMedia",
      "cutout-poses",
      opts?.jobId?.trim() || randomUUID().slice(0, 8),
    );
    const resolveSheetLocalPath = (): string | null => {
      const raw = cutoutRaw.trim();
      if (!raw) return null;
      if (raw.startsWith("/") || !raw.includes("://")) {
        const abs = path.isAbsolute(raw)
          ? raw
          : path.join(process.cwd(), "public", raw.replace(/^\//, ""));
        return abs;
      }
      return null;
    };
    if (useHtmlCutout && opts?.generateCutoutPoses !== false) {
      const last = slides.length - 1;
      const poseIndexes = new Set<number>([0, last]);
      const sheetLocal = resolveSheetLocalPath();
      await mapPool([...poseIndexes], 2, async (i) => {
        const slide = slides[i]!;
        const role = normalizeCarouselSlideRole(
          slide.layout_variant,
          i,
          slides.length,
        );
        const cutPrompt = buildCharacterCutoutPrompt({
          characterCatalogLine: conductorDesc,
          slideRole: role,
          primaryCopy: slide.primary_copy,
          secondaryCopyExcerpt: slide.secondary_copy,
        });
        try {
          const rich = await generateAggregatorImageWithOptionalRef({
            prompt: cutPrompt,
            model,
            ...(sheetLocal
              ? { referenceImagePath: sheetLocal }
              : characterPhoto?.startsWith("data:") ||
                  characterPhoto?.startsWith("http")
                ? { referenceImageUrl: characterPhoto }
                : cutoutRaw.startsWith("http")
                  ? { referenceImageUrl: cutoutRaw }
                  : {}),
          });
          if (rich?.url) {
            const saved = await materializeCutoutUrlToFile(
              rich.url,
              cutoutPoseDir,
              `s${i + 1}`,
            );
            let platePath = saved;
            let plateUri = saved
              ? (await fileToDataUri(saved)) || rich.url
              : rich.url;
            if (plateUri) {
              const knocked = await knockoutCutoutBackground({
                srcDataUriOrPath: plateUri,
                outPath: path.join(
                  cutoutPoseDir,
                  `pose-alpha-s${i + 1}-${randomUUID().slice(0, 8)}.png`,
                ),
              });
              if (knocked) {
                platePath = knocked;
                plateUri = (await fileToDataUri(knocked)) || plateUri;
              }
            }
            cutoutBySlide[i] = plateUri;
            void platePath;
            return;
          }
        } catch {
          /* soft-fail → crop */
        }
        // Soft-fail: crop ONE cell from sheet — never use whole grid
        if (characterPhoto || cutoutRaw) {
          const cropped = await cropSinglePoseFromSheet({
            sheetSrc: characterPhoto || cutoutRaw,
            outDir: cutoutPoseDir,
            cellIndex: defaultPoseCellForSlide(i, slides.length),
            label: `s${i + 1}`,
          });
          if (cropped) {
            const knocked = await knockoutCutoutBackground({
              srcDataUriOrPath: (await fileToDataUri(cropped)) || cropped,
              outPath: path.join(
                cutoutPoseDir,
                `pose-alpha-crop-s${i + 1}-${randomUUID().slice(0, 8)}.png`,
              ),
            });
            cutoutBySlide[i] = knocked
              ? (await fileToDataUri(knocked)) || null
              : (await fileToDataUri(cropped)) || null;
          }
        }
      });
    } else if (useHtmlCutout) {
      // Pose gen explicitly OFF: still crop single cells (ban whole-sheet paste)
      const last = slides.length - 1;
      for (const i of [0, last]) {
        if (!characterPhoto && !cutoutRaw) continue;
        const cropped = await cropSinglePoseFromSheet({
          sheetSrc: characterPhoto || cutoutRaw,
          outDir: cutoutPoseDir,
          cellIndex: defaultPoseCellForSlide(i, slides.length),
          label: `s${i + 1}`,
        });
        if (cropped) {
          const knocked = await knockoutCutoutBackground({
            srcDataUriOrPath: (await fileToDataUri(cropped)) || cropped,
            outPath: path.join(
              cutoutPoseDir,
              `pose-alpha-crop-s${i + 1}-${randomUUID().slice(0, 8)}.png`,
            ),
          });
          cutoutBySlide[i] = knocked
            ? (await fileToDataUri(knocked)) || null
            : (await fileToDataUri(cropped)) || null;
        }
      }
    }

    const promptTrace: CarouselDrawImagePromptTrace[] = slides.map(
      (slide, i) => {
        const role = normalizeCarouselSlideRole(
          slide.layout_variant,
          i,
          slides.length,
        );
        const charPlace = resolveCharacterPlacement(
          slide.html_layout,
          role,
          i,
          useHtmlCutout,
          { characterPaint, slideTotal: slides.length },
        );
        return {
          slide: i + 1,
          image_llm: model,
          exact_prompt: imagePrompts[i]!,
          html_inputs_summary: [
            `renderMode=layered_html`,
            `html_overlay=playwright`,
            `vision=OFF`,
            `designer_pack=${designerPack.source}`,
            `characterPaint=${characterPaint}`,
            `styleCopyMode=${styleCopyMode}`,
            visionRef
              ? `FULL_inject_skipped=true`
              : `FULL_inject_skipped=false`,
            styleCopySlotMap[i]
              ? `refSlot=${styleCopySlotMap[i]!.slot}`
              : "",
            styleCopySlotMap[i]?.refPath
              ? `refPath=${styleCopySlotMap[i]!.refPath}`
              : "",
            `layoutMap=${visionRef ? "vision_ref" : preset?.layoutMap ? "preset" : "none"}`,
            `numbering=${preset?.layoutMap?.numberingGlobal ?? "default"}`,
            `template=${slide.html_layout?.template ?? "fallback"}`,
            `bgFit=${(slide.html_layout as { bgFit?: string } | null)?.bgFit ?? "cover"}`,
            `variant=${slide.layout_variant}`,
            `role=${role}`,
            `primary=${(slide.primary_copy ?? "").slice(0, 80)}`,
            `secondary=${(slide.secondary_copy ?? "").slice(0, 80)}`,
            `cta=${
              resolveCtaCatalogLabel(slide.cta_type) ||
              rootCtaLabel ||
              "—"
            }`,
            `brand=${brandName}`,
            `fonts=${
              visionRef
                ? "etalon_mirror+system-ui+Noto Sans Armenian"
                : fonts.fonts.map((f) => f.familyName).join("+")
            }`,
            `character=${charPlace}`,
            `swipe_trigger=meta_never_painted`,
          ]
            .filter(Boolean)
            .join(" · "),
        };
      },
    );

    const bgConcurrency = Math.max(
      1,
      Math.min(
        2,
        Number.parseInt(process.env.CAROUSEL_BG_CONCURRENCY ?? "1", 10) || 1,
      ),
    );
    const bgUrls = await mapPool(slides, bgConcurrency, async (_slide, i) => {
      if (skipAllBg) return null;
      const slotMeta = styleCopySlotMap[i];
      const refPath =
        visionRef && slotMeta?.refPath ? slotMeta.refPath : undefined;
      const tryOnce = async (): Promise<string | null> => {
        if (refPath) {
          const rich = await generateAggregatorImageWithOptionalRef({
            prompt: imagePrompts[i]!,
            model,
            referenceImagePath: refPath,
          });
          return rich?.url ?? null;
        }
        return generateAggregatorImage({
          prompt: imagePrompts[i]!,
          model,
        });
      };
      let url = await tryOnce();
      // Soft retries — aggregator often flakes
      for (let attempt = 0; !url && attempt < 2; attempt++) {
        url = await tryOnce();
      }
      return url;
    });

    const liveBg = bgUrls.filter((u) => typeof u === "string" && u).length;
    if (liveBg < slides.length) {
      const missing = bgUrls
        .map((u, i) => (typeof u === "string" && u ? null : i + 1))
        .filter((n): n is number => n != null);
      return {
        ok: false,
        source: "error",
        error: {
          code: "generate_slides_fail",
          message: `${createCarouselErrorMessage("generate_slides_fail")} (bg missing slides: ${missing.join(",")}; characterPaint=${characterPaint})`,
        },
      };
    }

    const rendered: CarouselHtmlSlideOut[] = [];
    const pngPaths: string[] = [];
    let pngCount = 0;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]!;
      const remote = bgUrls[i];
      const fileName = slideFileName(i + 1);
      const outPath = path.join(outDir, fileName);
      const bgPath = path.join(
        outDir,
        fileName.replace(/\.png$/, ".bg.png"),
      );

      if (typeof remote !== "string" || !remote) {
        return {
          ok: false,
          source: "error",
          error: {
            code: "generate_slides_fail",
            message: createCarouselErrorMessage("generate_slides_fail"),
          },
        };
      }

      const bgSaved = await downloadImageUrlToPngFile(remote, bgPath);
      let bgForHtml: string | null = null;
      if (bgSaved) {
        bgForHtml = await fileToDataUri(bgPath);
      }
      if (!bgForHtml) {
        bgForHtml = remote.startsWith("data:")
          ? remote
          : (await resolvePlaywrightImageSrc(remote)) || remote;
      }

      const role = normalizeCarouselSlideRole(
        slide.layout_variant,
        i,
        slides.length,
      );
      const charPlace = resolveCharacterPlacement(
        slide.html_layout,
        role,
        i,
        useHtmlCutout,
        { characterPaint, slideTotal: slides.length },
      );
      const placeChar = charPlace !== "none";
      // Prefer per-slide single pose; NEVER fall back to multi-pose sheet grid.
      let cutoutForSlide: string | null = null;
      if (placeChar && cutoutBySlide[i]) {
        const resolved = await resolvePlaywrightImageSrc(cutoutBySlide[i]!);
        if (resolved) cutoutForSlide = resolved;
      }
      if (
        placeChar &&
        !cutoutForSlide &&
        characterPhoto &&
        !looksLikeCharacterSheetUrl(cutoutRaw)
      ) {
        // Non-sheet catalog photo (already a single pose) OK as cutout
        cutoutForSlide = characterPhoto;
      }
      if (placeChar && !cutoutForSlide && (characterPhoto || cutoutRaw)) {
        const cropped = await cropSinglePoseFromSheet({
          sheetSrc: characterPhoto || cutoutRaw,
          outDir: cutoutPoseDir,
          cellIndex: defaultPoseCellForSlide(i, slides.length),
          label: `fallback-s${i + 1}`,
        });
        if (cropped) {
          cutoutForSlide = (await fileToDataUri(cropped)) || null;
        }
      }

      const html = buildLayeredSlideHtml({
        slide: {
          primary_copy: slide.primary_copy,
          secondary_copy: slide.secondary_copy,
          layout_variant: slide.layout_variant,
          cta_type: slide.cta_type,
          alt_text: slide.alt_text,
          html_layout: slide.html_layout,
        },
        slideIndex0: i,
        slideTotal: slides.length,
        backgroundUrl: bgForHtml || solidBg,
        preset: preset!,
        fontFaceCss: fonts.fontFaceCss,
        fontCssVars: fonts.cssVars,
        brand: {
          brandName,
          logoUrl,
          // Full vernatun-logo.png already has wordmark → img_only (no double VERNATUN)
          // Path A emblem → HTML wordmark beside
          splitEmblemWordmark: !usingFullWordmarkPng,
        },
        character:
          placeChar && cutoutForSlide
            ? { photoUrl: cutoutForSlide }
            : null,
        rootCtaType: layeredJson.cta_type,
        cssVars: { ...cssVarsApplied, ...fonts.cssVars },
        layoutMap: preset?.layoutMap ?? null,
        characterPaint,
      });

      await writeFile(
        path.join(outDir, fileName.replace(/\.png$/, ".html")),
        html,
        "utf8",
      );

      const shotOk = await screenshotHtmlToPng(html, outPath);
      if (!shotOk) {
        return {
          ok: false,
          source: "error",
          error: {
            code: "generate_slides_fail",
            message: `${createCarouselErrorMessage("generate_slides_fail")} (puppeteer screenshot failed slide ${i + 1})`,
          },
        };
      }

      pngCount += 1;
      pngPaths.push(outPath);
      rendered.push({
        id: `create-carousel-slide-${i}`,
        index: i + 1,
        imageUrl: publicCarouselUrl(jobId, fileName),
        caption: captionFromSlide(slide),
        alt_text: slide.alt_text?.trim() || slide.primary_copy,
        role,
      });
    }

    const budget = await commitPngBudget(pngCount);
    let artifactDir: string | undefined;
    const shouldCopy =
      opts?.copyToWaveArtifacts !== false &&
      process.env.WAVE_VISUAL_COPY_ARTIFACTS !== "0";
    if (shouldCopy && pngPaths.length > 0) {
      const copied = await copySlidesToWaveArtifacts({
        presetId: preset!.preset,
        sourcePngPaths: pngPaths,
      });
      artifactDir = copied.dir;
    }

    return {
      ok: true,
      slides: rendered,
      model,
      renderMode: "layered_html",
      bgImageCalls: slides.length,
      htmlFirst: true,
      e2eTextInImage: false,
      cssVarsApplied: { ...cssVarsApplied, ...fonts.cssVars },
      artifactDir,
      budget: { count: budget.count, max: budget.max },
      imagePrompts,
      ...(promptTraceEnabled ? { promptTrace } : {}),
      // Vision OFF on layered — never needs_review from OCR
      needsReview: false,
      handoffWithLayouts: layeredJson,
      designerPackSource: designerPack.source,
      designerPromptDump: designerPack.promptDump,
      styleCopyMode,
      styleCopyPackId,
      styleCopySlotMap: styleCopySlotMap.length
        ? styleCopySlotMap
        : undefined,
    };
  }

  // ─── Archaeology: Phase4 E2E + Phase5 ANCHOR + Phase6 correct ─────────
  if (e2eOn) {
    const coverSlide = slides[0]!;
    const masterStyleBlock = anchorRef
      ? buildMasterStyleLockedBlock({
          coverVisualPrompt: coverSlide.visual_prompt?.trim() || "",
          approxColorsLine: formatApproxBrandColorsForPrompt(preset!),
          coverPrimary: coverSlide.primary_copy,
          coverSecondary: coverSlide.secondary_copy,
        })
      : undefined;

    const paletteJson =
      opts?.placeholders?.designPaletteJson?.trim() ||
      JSON.stringify({
        bg: preset!.colors.bg,
        text: preset!.colors.text,
        accent: preset!.colors.accent,
        muted: preset!.colors.muted,
      });
    const characterLine =
      opts?.placeholders?.characterCatalog?.trim() || undefined;

    const imagePrompts: string[] = slides.map((slide, i) => {
      if (correctOn) {
        // Designer image_prompt-only (or deterministic translate) — no invent.
        return buildCorrectImagePromptFromSlide({
          slide,
          slideIndex0: i,
          paletteJson,
          brandName: opts?.placeholders?.brandName,
          logoRef: opts?.placeholders?.logoRef,
          characterLine,
          rootCtaType: json.cta_type,
          ctaLabel:
            resolveCtaCatalogLabel(slide.cta_type) || rootCtaLabel || undefined,
        });
      }
      return anchorRef
        ? buildAnchorRefIntegratedSlidePrompt({
            slide,
            slideIndex0: i,
            preset: preset!,
            topicTitle: title,
            rootCtaLabel,
            rootCtaType: json.cta_type,
            masterStyleBlock,
          })
        : buildE2eIntegratedSlidePrompt({
            slide,
            slideIndex0: i,
            preset: preset!,
            topicTitle: title,
            rootCtaLabel,
            rootCtaType: json.cta_type,
          });
    });
    const paintLabel = correctOn
      ? "correct_pipeline"
      : anchorRef
        ? "anchor_ref_pipeline"
        : "e2e_diffusion";
    const promptTrace: CarouselDrawImagePromptTrace[] = slides.map(
      (slide, i) => ({
        slide: i + 1,
        image_llm: model,
        exact_prompt: imagePrompts[i]!,
        html_inputs_summary: [
          `html_overlay=none`,
          `paint=${paintLabel}`,
          `variant=${slide.layout_variant}`,
          `primary=${(slide.primary_copy ?? "").slice(0, 80)}`,
          `cta=${resolveCtaCatalogLabel(slide.cta_type) || rootCtaLabel || "—"}`,
        ].join(" · "),
      }),
    );

    const remoteUrls: Array<string | null> = new Array(slides.length).fill(
      null,
    );
    let followupContinuity: AggregatorImageContinuity | "cover_only" =
      "cover_only";
    const visionFailures: Array<{
      slide: number;
      reason: string;
      gensUsed: number;
    }> = [];
    /** Track gens per slide for correct vision cap (≤2). */
    const gensPerSlide: number[] = new Array(slides.length).fill(0);

    if (correctOn) {
      // Phase 6: sequential paint → vision ≤2 → deliver PNG + needs_review if still bad
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]!;
        const fileName = slideFileName(i + 1);
        const outPath = path.join(outDir, fileName);
        let lastUrl: string | null = null;
        let gens = 0;
        let passedVision = false;
        let lastFailReason = "text_mismatch";

        while (gens < MAX_VISION_GENS_PER_SLIDE) {
          const url = await generateAggregatorImage({
            prompt: imagePrompts[i]!,
            model,
          });
          gens += 1;
          gensPerSlide[i] = gens;
          if (!url) break;
          lastUrl = url;
          const saved = await downloadImageUrlToPngFile(url, outPath);
          if (!saved) {
            lastUrl = null;
            break;
          }

          if (opts?.skipVision) {
            passedVision = true;
            break;
          }

          const isCta =
            /cta/i.test(String(slide.layout_variant ?? "")) ||
            Boolean(slide.cta_type);
          const check = await checkCarouselSlideTextVision({
            imageUrl: url,
            expected: {
              headline: slide.primary_copy?.trim() || "",
              body: slide.secondary_copy?.trim() || "",
              ctaLabel: isCta
                ? resolveCtaCatalogLabel(slide.cta_type) ||
                  rootCtaLabel ||
                  undefined
                : undefined,
            },
            gensUsed: gens,
            model: process.env.CAROUSEL_VISION_MODEL,
          });

          if (!check.ok) {
            // Vision unavailable → soft pass, deliver (do not block forever)
            passedVision = true;
            break;
          }
          if (check.pass) {
            passedVision = true;
            break;
          }
          lastFailReason = check.reason;
          if (!canRetryVisionSlideGen(gens)) break;
        }

        remoteUrls[i] = lastUrl;
        if (!lastUrl) break;
        if (!passedVision) {
          visionFailures.push({
            slide: i + 1,
            reason: lastFailReason,
            gensUsed: gensPerSlide[i]!,
          });
        }
      }
    } else if (anchorRef) {
      // Sequential: cover first → persist → slides 2–N with optional ref image
      for (let i = 0; i < slides.length; i++) {
        const fileName = slideFileName(i + 1);
        const outPath = path.join(outDir, fileName);
        const coverPath =
          i > 0 ? path.join(outDir, slideFileName(1)) : undefined;
        const rich = await generateAggregatorImageWithOptionalRef({
          prompt: imagePrompts[i]!,
          model,
          ...(coverPath ? { referenceImagePath: coverPath } : {}),
        });
        if (!rich?.url) {
          remoteUrls[i] = null;
          break;
        }
        remoteUrls[i] = rich.url;
        if (i === 0) {
          const savedCover = await downloadImageUrlToPngFile(rich.url, outPath);
          if (!savedCover) {
            remoteUrls[i] = null;
            break;
          }
        } else {
          followupContinuity = rich.continuity;
        }
      }
    } else {
      const pooled = await mapPool(slides, 2, async (_slide, i) => {
        return generateAggregatorImage({ prompt: imagePrompts[i]!, model });
      });
      for (let i = 0; i < pooled.length; i++) remoteUrls[i] = pooled[i] ?? null;
    }

    const liveCount = remoteUrls.filter(
      (u) => typeof u === "string" && u,
    ).length;

    let e2eOk = liveCount >= slides.length;
    if (e2eOk) {
      const rendered: CarouselHtmlSlideOut[] = [];
      const pngPaths: string[] = [];
      let pngCount = 0;

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]!;
        const remote = remoteUrls[i];
        const fileName = slideFileName(i + 1);
        const outPath = path.join(outDir, fileName);
        if (typeof remote !== "string" || !remote) {
          e2eOk = false;
          break;
        }
        // Cover already written in sequential/correct branch; skip re-download if present.
        if (!(anchorRef && i === 0) && !correctOn) {
          const saved = await downloadImageUrlToPngFile(remote, outPath);
          if (!saved) {
            e2eOk = false;
            break;
          }
        }
        pngCount += 1;
        pngPaths.push(outPath);
        rendered.push({
          id: `create-carousel-slide-${i}`,
          index: i + 1,
          imageUrl: publicCarouselUrl(jobId, fileName),
          caption: captionFromSlide(slide),
          alt_text: slide.alt_text?.trim() || slide.primary_copy,
          role: normalizeCarouselSlideRole(
            slide.layout_variant,
            i,
            slides.length,
          ),
        });
      }

      if (e2eOk && rendered.length === slides.length) {
        const budget = await commitPngBudget(pngCount);
        let artifactDir: string | undefined;
        const shouldCopy =
          opts?.copyToWaveArtifacts !== false &&
          process.env.WAVE_VISUAL_COPY_ARTIFACTS !== "0";
        if (shouldCopy && pngPaths.length > 0) {
          const copied = await copySlidesToWaveArtifacts({
            presetId: preset.preset,
            sourcePngPaths: pngPaths,
          });
          artifactDir = copied.dir;
        }
        const needsReview = correctOn && visionFailures.length > 0;
        return {
          ok: true,
          slides: rendered,
          model,
          renderMode: correctOn
            ? "correct_pipeline"
            : anchorRef
              ? "anchor_ref_pipeline"
              : "e2e_diffusion",
          bgImageCalls: correctOn
            ? gensPerSlide.reduce((a, b) => a + b, 0)
            : slides.length,
          htmlFirst: false,
          e2eTextInImage: true,
          ...(anchorRef
            ? {
                anchorContinuity: followupContinuity,
                masterStyleBlock,
              }
            : {}),
          cssVarsApplied,
          artifactDir,
          budget: { count: budget.count, max: budget.max },
          imagePrompts,
          ...(promptTraceEnabled ? { promptTrace } : {}),
          ...(correctOn
            ? {
                needsReview,
                visionFailures:
                  visionFailures.length > 0 ? visionFailures : undefined,
              }
            : {}),
        };
      }
    }

    // Correct path never falls through to HTML overlay as success.
    if (correctOn || !isCarouselE2eFallbackHtml()) {
      return {
        ok: false,
        source: "error",
        error: {
          code: "generate_slides_fail",
          message: createCarouselErrorMessage("generate_slides_fail"),
        },
      };
    }
    // FALLBACK_HTML=1 → legacy HTML below (tagged legacy_html_overlay)
  }

  // ─── Legacy HTML/CSS-first (E2E OFF or emergency fallback) ──────────────
  const willCallImageApi = warrantFlags.map(
    (w) => Boolean(w) && !skipAllBg && aggregatorReady,
  );
  const bgImageCalls = willCallImageApi.filter(Boolean).length;
  const imagePrompts: string[] = slides.map((slide, i) => {
    if (!willCallImageApi[i]) return "";
    const vp = sanitizeLiveGenVisualPrompt(slide.visual_prompt?.trim() || "", {
      allowReadableText: false,
    });
    return [
      `Premium Instagram carousel BACKGROUND / ILLUSTRATION only, vertical 4:5 portrait (1080×1350).`,
      brandLine,
      `CRITICAL: zero readable text in the image. Do NOT paint letters, words, acronyms, digits-as-labels, UI chips, or placeholders.`,
      `FORBIDDEN baked strings include: HTML, ESPRESSO, CTA, TIP, HOOK, and stacked placeholder labels like 1 / 2 / CTA.`,
      `All headlines, body copy, and CTA pills are composited later via HTML/CSS — leave empty space for overlays.`,
      `Visual brief: ${vp || `Elegant club mood for slide ${i + 1}`}`,
      `Topic: ${title}.`,
    ].join(" ");
  });
  const promptTrace: CarouselDrawImagePromptTrace[] = slides.map((slide, i) => {
    const called = willCallImageApi[i];
    return {
      slide: i + 1,
      image_llm: called ? model : "skipped",
      exact_prompt: called
        ? imagePrompts[i]!
        : [
            "image_llm: skipped",
            `layout_variant: ${slide.layout_variant}`,
            `primary_copy: ${slide.primary_copy?.trim() || ""}`,
            `secondary_copy: ${slide.secondary_copy?.trim() || ""}`,
            `visual_prompt: ${slide.visual_prompt?.trim() || ""}`,
            `kitAesthetic: ${opts?.kitAesthetic ?? "(default)"}`,
            `htmlFirst: ${htmlFirst}`,
            `skipAllBg: ${skipAllBg}`,
            `warrant: ${Boolean(warrantFlags[i])}`,
          ].join("\n"),
      html_inputs_summary: [
        `variant=${slide.layout_variant}`,
        `primary=${(slide.primary_copy ?? "").slice(0, 80)}`,
        `cta=${resolveCtaCatalogLabel(slide.cta_type) || rootCtaLabel || "—"}`,
      ].join(" · "),
    };
  });
  const bgUrls = await mapPool(slides, 2, async (_slide, i) => {
    if (!willCallImageApi[i]) return null;
    const prompt = imagePrompts[i]!;
    return generateAggregatorImage({ prompt, model });
  });

  const liveBg = bgUrls.filter((u) => typeof u === "string" && u).length;
  if (!htmlFirst && !e2eOn && liveBg < 1) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "generate_slides_fail",
        message: createCarouselErrorMessage("generate_slides_fail"),
      },
    };
  }

  const backgroundUrlsForBuilder = slides.map((_, i) => {
    const remote = bgUrls[i];
    return typeof remote === "string" && remote ? remote : solidBg;
  });

  const built = carouselHtmlBuilder({
    slides: slides.map((s) => {
      const slideCta =
        resolveCtaCatalogLabel(s.cta_type) ||
        resolveCtaCatalogLabel(json.cta_type) ||
        rootCtaLabel;
      return {
        role: s.layout_variant,
        primary_copy: s.primary_copy,
        secondary_copy: s.secondary_copy,
        layout_variant: s.layout_variant,
        visual_prompt: s.visual_prompt,
        alt_text: s.alt_text,
        cta_label: slideCta,
        captionLine: slideCta,
      };
    }),
    preset,
    designMd,
    backgroundUrls: backgroundUrlsForBuilder,
    kitAesthetic: opts?.kitAesthetic,
    defaultCtaLabel: rootCtaLabel,
  });

  let allPng = true;
  const rendered: CarouselHtmlSlideOut[] = [];
  const pngPaths: string[] = [];
  let pngCount = 0;

  for (let i = 0; i < built.frames.length; i++) {
    const frame = built.frames[i]!;
    const slide = slides[i]!;
    const bgRemote = bgUrls[i];
    const fileName = slideFileName(frame.index);
    const outPath = path.join(outDir, fileName);

    await writeFile(
      path.join(outDir, fileName.replace(/\.png$/, ".html")),
      frame.html,
      "utf8",
    );

    const shotOk = await screenshotHtmlToPng(frame.html, outPath);
    if (shotOk) {
      pngCount += 1;
      pngPaths.push(outPath);
      rendered.push({
        id: `create-carousel-slide-${i}`,
        index: frame.index,
        imageUrl: publicCarouselUrl(jobId, fileName),
        caption: captionFromSlide(slide),
        alt_text: slide.alt_text?.trim() || slide.primary_copy,
        role: frame.role,
      });
    } else if (typeof bgRemote === "string" && bgRemote) {
      allPng = false;
      rendered.push({
        id: `create-carousel-slide-${i}`,
        index: frame.index,
        imageUrl: toPreviewUrl(bgRemote) || bgRemote,
        caption: captionFromSlide(slide),
        alt_text: slide.alt_text?.trim() || slide.primary_copy,
        role: frame.role,
      });
    } else {
      allPng = false;
    }
  }

  if (rendered.length < 1) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "generate_slides_fail",
        message: createCarouselErrorMessage("generate_slides_fail"),
      },
    };
  }

  if (rendered.length !== slides.length && rendered.length < 2) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "generate_slides_fail",
        message: createCarouselErrorMessage("generate_slides_fail"),
      },
    };
  }

  if (htmlFirst && rendered.length !== slides.length) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "generate_slides_fail",
        message: createCarouselErrorMessage("generate_slides_fail"),
      },
    };
  }

  const budget = await commitPngBudget(pngCount);

  let artifactDir: string | undefined;
  const shouldCopy =
    opts?.copyToWaveArtifacts !== false &&
    process.env.WAVE_VISUAL_COPY_ARTIFACTS !== "0";
  if (shouldCopy && pngPaths.length > 0) {
    const copied = await copySlidesToWaveArtifacts({
      presetId: preset.preset,
      sourcePngPaths: pngPaths,
    });
    artifactDir = copied.dir;
  }

  const legacyFromE2eFallback = e2eOn && isCarouselE2eFallbackHtml();
  return {
    ok: true,
    slides: rendered,
    model,
    renderMode: legacyFromE2eFallback
      ? "legacy_html_overlay"
      : allPng
        ? "html_png"
        : "bg_proxy_fallback",
    bgImageCalls,
    htmlFirst: legacyFromE2eFallback ? true : htmlFirst,
    e2eTextInImage: false,
    cssVarsApplied: built.cssVarsApplied,
    artifactDir,
    budget: { count: budget.count, max: budget.max },
    imagePrompts,
    ...(promptTraceEnabled ? { promptTrace } : {}),
  };
}


// Re-export alias name for Architect lock (same module, no fork).
export { carouselHtmlBuilder as buildCarouselHtml };
export { resolveLayoutPreset };
