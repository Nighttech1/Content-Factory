/**
 * S57 layered_html — HTML/CSS overlay composite over bg plate.
 * Variant A: executes Designer `html_layout` (template → CSS, accent wraps, chrome).
 * Order: bg → optional character cut-out → brand chrome → type → CTA button.
 * swipe_trigger NEVER painted. Canvas 1080×1350. Safe ~120/160.
 */

import path from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

import type { DesignPresetFile } from "@/lib/settings/design-preset";
import {
  designPresetToCssVars,
  cssVarsToInlineStyle,
} from "@/lib/settings/design-preset";
import {
  DEFAULT_CHARACTER_PAINT,
  type CharacterPaintPath,
  type BgFit,
} from "@/lib/studio/create-carousel-prompts";
import {
  htmlLayoutSchema,
  type HtmlLayout,
  type HtmlLayoutTemplate,
} from "@/lib/studio/carousel-json-contract";
import {
  normalizeCarouselSlideRole,
  type CarouselSlideRole,
  type LayoutMap,
} from "@/types/design";

/** DESIGN / DesignPreset typography.scale (px) — SoT for composite font-size. */
export type CompositeTypographyScale = {
  cover?: number;
  h2?: number;
  body?: number;
  caption?: number;
};

/** Keep in sync with carousel-html-renderer (avoid circular import). */
const FRAME_W = 1080;
const FRAME_H = 1350;
const SAFE = { top: 120, bottom: 160, left: 80, right: 80 } as const;

// CTA flags (sheet): 1 = встреча разговорного клуба (детали в шапке профиля),
// 2 = делитесь в комментариях, 3 = сохрани и подпишись на подборки.
const CTA_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Приходите на встречу · детали в профиле",
  2: "Делитесь в комментариях",
  3: "Сохрани и подпишись",
  4: "Сохрани и подпишись",
};

function resolveCtaLabel(ctaType?: number | null): string | undefined {
  if (ctaType === 1 || ctaType === 2 || ctaType === 3 || ctaType === 4) {
    return CTA_LABELS[ctaType];
  }
  return undefined;
}

export type LayeredBrandChrome = {
  brandName: string;
  /**
   * Absolute file:// or https / data URL for mark.
   * Phase 2 Path A: prefer emblem PNG; HTML wordmark uses brandName + textColor.
   */
  logoUrl?: string;
  /**
   * When true (default for Path A), always render `.brand-name` beside emblem.
   * When false (legacy wordmark-img-only), hide name if logoUrl present.
   */
  splitEmblemWordmark?: boolean;
};

export type LayeredCharacterCutout = {
  name?: string;
  /** Absolute file:// or https URL */
  photoUrl: string;
};

export type LayeredSlideIn = {
  primary_copy?: string;
  secondary_copy?: string;
  layout_variant?: string;
  cta_type?: number | null;
  alt_text?: string;
  /** Variant A — Designer layout schema (optional for legacy archaeology). */
  html_layout?: HtmlLayout | null;
};

export type BuildLayeredSlideHtmlInput = {
  slide: LayeredSlideIn;
  slideIndex0: number;
  slideTotal: number;
  /** Background plate URL (data: / https / file://) — no text */
  backgroundUrl: string;
  preset: DesignPresetFile;
  /** Injected @font-face + imports from carousel-fonts */
  fontFaceCss: string;
  fontCssVars?: Record<string, string>;
  brand?: LayeredBrandChrome;
  /** Conductor cut-out OVER bg — only when caller opts in for this slide */
  character?: LayeredCharacterCutout | null;
  rootCtaType?: number | null;
  cssVars?: Record<string, string>;
  /**
   * Active DesignPreset layoutMap — numbering omit + logo/CTA chrome mirror.
   * Falls back to preset.layoutMap when omitted.
   */
  layoutMap?: LayoutMap | null;
  /** Dual paint path — in_image / none → never HTML cutout */
  characterPaint?: CharacterPaintPath | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap first exact occurrence of each highlight phrase in <span class="accent">.
 * Phrase must be a substring of `copy`; otherwise skipped (escape still applied).
 */
export function applyAccentHighlights(
  copy: string,
  highlights: Array<{ phrase: string; style?: string }> | undefined,
): string {
  if (!copy) return "";
  const list = (highlights ?? []).filter(
    (h) => h?.style === "accent" && typeof h.phrase === "string" && h.phrase,
  );
  if (list.length === 0) return escapeHtml(copy);

  type Seg = { text: string; accent: boolean };
  let segs: Seg[] = [{ text: copy, accent: false }];

  for (const h of list) {
    const phrase = h.phrase;
    const next: Seg[] = [];
    let applied = false;
    for (const seg of segs) {
      if (seg.accent || applied) {
        next.push(seg);
        continue;
      }
      const idx = seg.text.indexOf(phrase);
      if (idx < 0) {
        next.push(seg);
        continue;
      }
      applied = true;
      if (idx > 0) next.push({ text: seg.text.slice(0, idx), accent: false });
      next.push({ text: phrase, accent: true });
      const after = seg.text.slice(idx + phrase.length);
      if (after) next.push({ text: after, accent: false });
    }
    segs = next;
  }

  return segs
    .map((s) =>
      s.accent
        ? `<span class="accent">${escapeHtml(s.text)}</span>`
        : escapeHtml(s.text),
    )
    .join("");
}

/**
 * Body-slide brand chrome default — logo-placement-v2.
 * Prefer `defaultLogoPlacementForRole` (cover/cta → top-left; body → bottom-left).
 */
export const DEFAULT_BRAND_CHROME = "bottom-left" as const;

/**
 * Brand mark box px — logo-placement-v2 was 176; Phase 2 Path A bumps to 200
 * (crisper emblem; HTML wordmark colored separately).
 * Full wordmark PNG uses a slightly smaller box so title clear-zone stays readable.
 */
export const BRAND_LOGO_SIZE_PX = 200;
/** Full vernatun-logo.png (landscape wordmark) — readable but not covering title. */
export const BRAND_FULL_LOGO_SIZE_PX = 148;

type LogoPlacement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "none";

/**
 * Extra padding so type-stack never sits under `.brand` when logo is top/bottom
 * and type shares that edge (cover/cta TOP + left type).
 */
export function typeClearPadPx(opts: {
  logoPlacement: LogoPlacement;
  vertical?: "top" | "middle" | "bottom" | null;
  safeJustify: string;
  logoSizePx?: number;
}): { padTop: number; padBottom: number } {
  const logoSize = opts.logoSizePx ?? BRAND_LOGO_SIZE_PX;
  const logoTop = Math.max(36, SAFE.top - 70);
  const logoBottom = 44;
  const gap = 28;
  const typeAtTop =
    opts.safeJustify === "flex-start" ||
    opts.vertical === "top" ||
    opts.vertical == null;
  const typeAtBottom =
    opts.safeJustify === "flex-end" || opts.vertical === "bottom";
  let padTop = 0;
  let padBottom = 0;
  if (
    opts.logoPlacement !== "none" &&
    opts.logoPlacement.startsWith("top") &&
    typeAtTop
  ) {
    const logoEnd = logoTop + logoSize + gap;
    padTop = Math.max(0, logoEnd - SAFE.top);
  }
  if (
    opts.logoPlacement !== "none" &&
    opts.logoPlacement.startsWith("bottom") &&
    typeAtBottom
  ) {
    const logoSpan = logoBottom + logoSize + gap;
    padBottom = Math.max(0, logoSpan - SAFE.bottom);
  }
  return { padTop, padBottom };
}

/** Phase 2 Path A — circle emblem (HTML wordmark beside). */
export const BRAND_EMBLEM_REF = "/brand/vernatun-emblem.png";

/** Legacy wordmark PNG — fallback when emblem missing. */
export const BRAND_WORDMARK_REF = "/brand/vernatun-logo.png";

const LOGO_TEXT_COLOR_RE = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

/**
 * Resolve HTML wordmark color from html_layout.logo.textColor.
 * Fallback: white on even vision plates / near-black on odd (legacy polarity).
 */
export function resolveLogoTextColor(
  layout: HtmlLayout | null | undefined,
  opts?: { slideIndex0?: number; layoutMapSource?: string | null },
): string {
  const raw = (layout?.logo as { textColor?: string } | undefined)?.textColor;
  if (typeof raw === "string" && LOGO_TEXT_COLOR_RE.test(raw.trim())) {
    return raw.trim();
  }
  const vision =
    opts?.layoutMapSource === "vision_ref" ||
    (layout as { layoutMapSource?: string } | null | undefined)?.layoutMapSource ===
      "vision_ref";
  if (vision) {
    const i0 = opts?.slideIndex0 ?? 0;
    return i0 % 2 === 0 ? "#FFFFFF" : "#1A1A1A";
  }
  return "color-mix(in srgb, var(--cf-design-text, #F5E6C8) 92%, white)";
}

/**
 * Product SoT (logo-placement-v2): COVER + LAST(cta) → top-left; body → bottom-left.
 */
export function defaultLogoPlacementForRole(
  role: CarouselSlideRole,
  slideIndex0?: number,
  slideTotal?: number,
): Exclude<LogoPlacement, "none"> {
  const last = Math.max(0, (slideTotal ?? 1) - 1);
  const i0 = slideIndex0 ?? 0;
  if (role === "cover" || i0 === 0) return "top-left";
  if (role === "cta_slide" || i0 >= last) return "top-left";
  return "bottom-left";
}

const VARIETY_ANCHORS = ["left", "center", "right"] as const;
const VARIETY_VERTICAL = ["top", "middle", "bottom"] as const;
const VARIETY_BODY_TEMPLATES = [
  "body_left",
  "body_split",
  "tip_card",
  "quote_band",
] as const;

/**
 * Deterministic fallback when legacy slides lack html_layout (archaeology only).
 * Rotates anchors / vertical / body templates by slideIndex — never all top-left.
 * New Create / smoke must prefer Designer-emitted layouts.
 */
export function synthesizeFallbackHtmlLayout(
  role: CarouselSlideRole,
  slideIndex0 = 0,
): HtmlLayout {
  const i = Math.max(0, Math.floor(slideIndex0));
  const anchor = VARIETY_ANCHORS[i % VARIETY_ANCHORS.length]!;
  const vertical = VARIETY_VERTICAL[i % VARIETY_VERTICAL.length]!;
  const logoPlacement = defaultLogoPlacementForRole(role, i);

  if (role === "cover") {
    return htmlLayoutSchema.parse({
      template: "cover_center",
      text_block: {
        anchor: i % 2 === 0 ? "center" : anchor,
        align: "center",
        safe: true,
        vertical: i % 2 === 0 ? "middle" : vertical,
      },
      primary: { highlights: [] },
      secondary: { highlights: [] },
      logo: { placement: logoPlacement },
      brandChrome: logoPlacement,
      character: { placement: "none" },
      cta: { placement: "none" },
      scrim: "soft",
    });
  }
  if (role === "cta_slide") {
    return htmlLayoutSchema.parse({
      template: "cta_bottom",
      text_block: {
        anchor: "center",
        align: "center",
        safe: true,
        vertical: "middle",
      },
      primary: { highlights: [] },
      secondary: { highlights: [] },
      logo: { placement: logoPlacement },
      brandChrome: logoPlacement,
      character: { placement: "none" },
      cta: { placement: "bottom" },
      scrim: "soft",
    });
  }
  const template =
    VARIETY_BODY_TEMPLATES[i % VARIETY_BODY_TEMPLATES.length]!;
  return htmlLayoutSchema.parse({
    template,
    text_block: {
      anchor,
      align: anchor === "center" ? "center" : anchor,
      safe: true,
      vertical,
    },
    primary: { highlights: [] },
    secondary: { highlights: [] },
    logo: { placement: logoPlacement },
    brandChrome: logoPlacement,
    character: { placement: "none" },
    cta: { placement: "none" },
    scrim: "soft",
  });
}

export function resolveHtmlLayoutForSlide(
  slide: LayeredSlideIn,
  role: CarouselSlideRole,
  slideIndex0 = 0,
): { layout: HtmlLayout; fromFallback: boolean } {
  if (slide.html_layout) {
    const parsed = htmlLayoutSchema.safeParse(slide.html_layout);
    if (parsed.success) {
      return { layout: parsed.data, fromFallback: false };
    }
  }
  return {
    layout: synthesizeFallbackHtmlLayout(role, slideIndex0),
    fromFallback: true,
  };
}

/**
 * Soft-shuffle anchors (and templates if identical) when every slide shares
 * the same text_block.anchor / vertical. Used in ensureDesigner pack merge.
 */
export function softShuffleIdenticalAnchors(
  layouts: HtmlLayout[],
): { layouts: HtmlLayout[]; shuffled: boolean } {
  if (layouts.length < 2) return { layouts, shuffled: false };
  const first = layouts[0]?.text_block;
  const allSameAnchor = layouts.every(
    (l) =>
      l.text_block.anchor === first?.anchor &&
      (l.text_block.vertical ?? "top") === (first?.vertical ?? "top"),
  );
  const allSameTemplate = layouts.every(
    (l) => l.template === layouts[0]?.template,
  );
  if (!allSameAnchor && !allSameTemplate) {
    return { layouts, shuffled: false };
  }
  const next = layouts.map((layout, i) => {
    const anchor = allSameAnchor
      ? VARIETY_ANCHORS[i % VARIETY_ANCHORS.length]!
      : layout.text_block.anchor;
    const vertical = allSameAnchor
      ? VARIETY_VERTICAL[i % VARIETY_VERTICAL.length]!
      : (layout.text_block.vertical ?? "top");
    const template =
      allSameTemplate && layout.template !== "cta_bottom" && layout.template !== "cover_center"
        ? VARIETY_BODY_TEMPLATES[i % VARIETY_BODY_TEMPLATES.length]!
        : layout.template;
    return {
      ...layout,
      template,
      text_block: {
        ...layout.text_block,
        anchor,
        align:
          layout.text_block.align === "center" || anchor === "center"
            ? ("center" as const)
            : anchor,
        vertical,
      },
      logo: {
        placement:
          layout.logo?.placement ??
          defaultLogoPlacementForRole(
            // soft-shuffle has no role — body default
            "body_slide",
            i,
            layouts.length,
          ),
      },
      brandChrome:
        layout.brandChrome ??
        defaultLogoPlacementForRole("body_slide", i, layouts.length),
    };
  });
  return { layouts: next, shuffled: true };
}

/** True when adjacent slides vary in anchor.x and/or vertical (layout_variety). */
export function validateLayoutVariety(layouts: HtmlLayout[]): {
  ok: boolean;
  reason?: string;
} {
  if (layouts.length < 2) return { ok: true };
  const allLeftTop = layouts.every(
    (l) =>
      l.text_block.anchor === "left" &&
      (l.text_block.vertical ?? "top") === "top",
  );
  if (allLeftTop) {
    return {
      ok: false,
      reason: "all_slides_top_left",
    };
  }
  const allIdentical = layouts.every(
    (l) =>
      l.text_block.anchor === layouts[0]!.text_block.anchor &&
      (l.text_block.vertical ?? "top") ===
        (layouts[0]!.text_block.vertical ?? "top"),
  );
  if (allIdentical) {
    return { ok: false, reason: "identical_anchors" };
  }
  return { ok: true };
}

/** Hardcoded fallbacks — used ONLY when typography.scale missing. */
function templatePrimarySizeFallback(template: HtmlLayoutTemplate): string {
  switch (template) {
    case "cover_center":
      return "64px";
    case "cta_bottom":
      return "52px";
    case "quote_band":
      return "56px";
    case "tip_card":
      return "44px";
    default:
      return "48px";
  }
}

function pxOrUndefined(n: number | undefined): string | undefined {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return undefined;
  return `${Math.round(n)}px`;
}

/**
 * Map DESIGN typography.scale → CSS roles (Architect §5.1).
 * LLM must not invent sizes — composite owns px.
 */
export function resolveTypeScaleCss(
  template: HtmlLayoutTemplate,
  scale?: CompositeTypographyScale | null,
): {
  primary: string;
  secondary: string;
  brandName: string;
  slideNum: string;
  cta: string;
  scaleApplied: boolean;
} {
  const coverish =
    template === "cover_center" ||
    template === "quote_band" ||
    template === "cta_bottom";
  const primaryFromScale = coverish
    ? pxOrUndefined(scale?.cover)
    : pxOrUndefined(scale?.h2) ?? pxOrUndefined(scale?.cover);
  const secondaryFromScale = pxOrUndefined(scale?.body);
  const captionFromScale = pxOrUndefined(scale?.caption);
  const brandFromScale =
    pxOrUndefined(scale?.caption) ?? pxOrUndefined(scale?.body);
  const ctaFromScale =
    pxOrUndefined(scale?.body) ?? pxOrUndefined(scale?.h2);

  const scaleApplied = Boolean(
    primaryFromScale || secondaryFromScale || captionFromScale,
  );

  // slideNum tokens = body paragraph (Architect slide_num_own_slot)
  const slideNumFromScale = secondaryFromScale ?? captionFromScale;
  return {
    primary: primaryFromScale ?? templatePrimarySizeFallback(template),
    secondary: secondaryFromScale ?? "28px",
    brandName: brandFromScale ?? "22px",
    slideNum: slideNumFromScale ?? "28px",
    cta: ctaFromScale ?? "26px",
    scaleApplied,
  };
}

/** Pretty slide badge: zero-pad current / total → `01 / 06` (own HTML slot). */
export function formatPrettySlideNum(
  slideIndex0: number,
  slideTotal: number,
): string {
  const total = Math.max(1, Math.floor(slideTotal) || 1);
  const n = Math.min(Math.max(1, Math.floor(slideIndex0) + 1), total);
  const pad = total <= 99 ? 2 : String(total).length;
  return `${String(n).padStart(pad, "0")} / ${String(total).padStart(pad, "0")}`;
}

/**
 * fontFit / fontSizeOverride — reduce-only vs DESIGN base px.
 * Never returns a size larger than `designPx`.
 */
export function applyFontFitReduceOnly(
  designPx: number,
  opts?: {
    fontFit?: { role?: string; deltaPx?: number | null } | null;
    fontSizeOverride?: number | null;
    role?: string;
  },
): { px: number; deltaPx: number; reduced: boolean; designPx: number } {
  const base = Math.max(1, Math.round(designPx));
  let next = base;
  const fit = opts?.fontFit;
  if (
    fit &&
    typeof fit.deltaPx === "number" &&
    Number.isFinite(fit.deltaPx) &&
    (!opts?.role || !fit.role || fit.role === opts.role || roleAliasesMatch(fit.role, opts.role))
  ) {
    // Only negative (or zero) deltas apply
    const delta = Math.min(0, fit.deltaPx);
    next = Math.max(10, base + delta);
  }
  const override = opts?.fontSizeOverride;
  if (typeof override === "number" && Number.isFinite(override) && override > 0) {
    // Reduce-only: clamp override to ≤ design base
    next = Math.min(next, Math.min(base, Math.round(override)));
  }
  // Hard clamp: never above DESIGN
  next = Math.min(next, base);
  const deltaPx = next - base;
  return {
    px: next,
    deltaPx,
    reduced: deltaPx < 0,
    designPx: base,
  };
}

function roleAliasesMatch(a: string, b: string): boolean {
  const norm = (r: string) => {
    if (r === "title" || r === "primary") return "primary";
    if (r === "body" || r === "secondary") return "secondary";
    if (r === "content") return "content";
    return r;
  };
  return norm(a) === norm(b);
}

function parsePx(s: string): number {
  const m = /^(\d+(?:\.\d+)?)px$/i.exec(s.trim());
  return m ? Number(m[1]) : 28;
}

/** Read scale from preset.typography (SoT). */
export function scaleFromPreset(
  preset: DesignPresetFile,
): CompositeTypographyScale | null {
  const scale = preset.typography?.scale;
  if (!scale || typeof scale !== "object") return null;
  const out: CompositeTypographyScale = {};
  for (const key of ["cover", "h2", "body", "caption"] as const) {
    const n = scale[key];
    if (typeof n === "number" && Number.isFinite(n) && n > 0) out[key] = n;
  }
  return Object.keys(out).length ? out : null;
}

function anchorToFlex(
  anchor: "left" | "center" | "right",
  vertical?: "top" | "middle" | "bottom" | null,
): { justify: string; alignItems: string } {
  const v = vertical ?? (anchor === "center" ? "middle" : "top");
  const justify =
    v === "middle" ? "center" : v === "bottom" ? "flex-end" : "flex-start";
  if (anchor === "center") {
    return { justify, alignItems: "center" };
  }
  if (anchor === "right") {
    return { justify, alignItems: "flex-end" };
  }
  return { justify, alignItems: "flex-start" };
}

function mapChromeSlotToLogoPlacement(
  slot: string | undefined,
): LogoPlacement | null {
  if (!slot || slot === "absent") return "none";
  if (
    slot === "top-left" ||
    slot === "top-right" ||
    slot === "bottom-left" ||
    slot === "bottom-right" ||
    slot === "none"
  ) {
    return slot;
  }
  // Ambiguous map slots → body SoT (logo-placement-v2)
  if (slot === "bottom" || slot === "center") return "bottom-left";
  return null;
}

/**
 * Mirror layoutMap.logoChrome when present; else role SoT
 * (cover/cta → top-left; body → bottom-left). html_layout placement
 * is ignored for product chrome when role is known (v2 HARD).
 */
export function resolveLogoPlacement(
  layout: HtmlLayout,
  opts?: {
    layoutMap?: LayoutMap | null;
    role?: CarouselSlideRole;
    slideIndex0?: number;
    slideTotal?: number;
  },
): LogoPlacement {
  const map = opts?.layoutMap;
  if (map && opts?.role != null && opts.slideIndex0 != null) {
    const slide = layoutMapSlideForIndex(
      map,
      opts.role,
      opts.slideIndex0,
      opts.slideTotal ?? 1,
    );
    if (slide?.logoChrome) {
      if (!slide.logoChrome.present) return "none";
      const mapped = mapChromeSlotToLogoPlacement(
        typeof slide.logoChrome.slot === "string"
          ? slide.logoChrome.slot
          : undefined,
      );
      if (mapped) return mapped;
    }
  }
  if (opts?.role != null) {
    return defaultLogoPlacementForRole(
      opts.role,
      opts.slideIndex0,
      opts.slideTotal,
    );
  }
  const raw =
    layout.logo?.placement ?? layout.brandChrome ?? DEFAULT_BRAND_CHROME;
  if (
    raw === "top-left" ||
    raw === "top-right" ||
    raw === "bottom-left" ||
    raw === "bottom-right" ||
    raw === "none"
  ) {
    return raw;
  }
  return DEFAULT_BRAND_CHROME;
}

/** Mirror layoutMap.ctaChrome → force/suppress CTA placement. */
export function resolveCtaPlacementFromMap(
  layout: HtmlLayout,
  role: CarouselSlideRole,
  opts?: {
    layoutMap?: LayoutMap | null;
    slideIndex0?: number;
    slideTotal?: number;
  },
): "none" | "bottom" | "inline" | null {
  const map = opts?.layoutMap;
  if (!map || opts?.slideIndex0 == null) return null;
  const slide = layoutMapSlideForIndex(
    map,
    role,
    opts.slideIndex0,
    opts.slideTotal ?? 1,
  );
  if (!slide?.ctaChrome) return null;
  if (!slide.ctaChrome.present || slide.ctaChrome.slot === "absent") {
    return "none";
  }
  if (slide.ctaChrome.slot === "center" || slide.ctaChrome.slot === "inline") {
    return "inline";
  }
  if (slide.ctaChrome.slot === "bottom") return "bottom";
  return layout.cta?.placement ?? "bottom";
}

/** Brand chrome absolute CSS — role corners (v2: TL cover/cta, BL body). */
function brandChromeCss(placement: LogoPlacement): string {
  if (placement === "none") return "";
  const isBottom = placement.startsWith("bottom");
  const isRight = placement.endsWith("right");
  const vert = isBottom
    ? `bottom: 44px; top: auto;`
    : `top: ${Math.max(36, SAFE.top - 70)}px; bottom: auto;`;
  const horiz = isRight
    ? `right: ${SAFE.right}px; left: auto;`
    : `left: ${SAFE.left}px; right: auto;`;
  return `${vert} ${horiz}`;
}

/**
 * Slide-num opposite to logo to avoid collision.
 * Logo bottom-right → num bottom-left; logo top-* → num bottom opposite.
 */
function slideNumCss(logoPlacement: LogoPlacement): string {
  if (logoPlacement === "bottom-right" || logoPlacement === "top-right") {
    return `left: ${SAFE.left}px; right: auto; bottom: 44px; top: auto;`;
  }
  if (logoPlacement === "bottom-left" || logoPlacement === "top-left") {
    return `right: ${SAFE.right}px; left: auto; bottom: 44px; top: auto;`;
  }
  // none → keep bottom-left (away from typical CTA)
  return `left: ${SAFE.left}px; right: auto; bottom: 44px; top: auto;`;
}

function scrimCss(scrim: HtmlLayout["scrim"]): string {
  if (scrim === "none") {
    return "display: none;";
  }
  if (scrim === "heavy") {
    return `background: linear-gradient(
      180deg,
      rgba(0,0,0,0.42) 0%,
      rgba(0,0,0,0.28) 40%,
      rgba(0,0,0,0.72) 100%
    );`;
  }
  return `background: linear-gradient(
    180deg,
    rgba(0,0,0,0.18) 0%,
    rgba(0,0,0,0.08) 42%,
    rgba(0,0,0,0.45) 100%
  );`;
}

/**
 * Resolve Settings logoRef / photo path to a Playwright-usable URL.
 * Relative `/…` → public/ file:// ; absolute file kept; http(s)/data passthrough.
 */
export function resolveAssetUrlForPlaywright(
  ref: string | undefined | null,
): string | undefined {
  const raw = (ref ?? "").trim();
  if (!raw) return undefined;
  if (
    raw.startsWith("data:") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("file://")
  ) {
    return raw;
  }
  const rel = raw.startsWith("/") ? raw.slice(1) : raw;
  const candidates = [
    path.join(process.cwd(), "public", rel),
    path.join(process.cwd(), rel),
  ];
  for (const abs of candidates) {
    if (existsSync(abs)) return pathToFileURL(abs).href;
  }
  // Fallback: treat as site-relative (Playwright setContent may not load it)
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function shouldPlaceCharacterOnSlide(
  role: CarouselSlideRole,
  slideIndex0: number,
  hasCharacter: boolean,
  opts?: {
    characterPaint?: CharacterPaintPath | null;
    slideTotal?: number;
  },
): boolean {
  if (!hasCharacter) return false;
  const paint = opts?.characterPaint ?? DEFAULT_CHARACTER_PAINT;
  if (paint === "in_image" || paint === "none") return false;
  // overlay_cutout: cover + last (cta) mandatory
  const last = Math.max(0, (opts?.slideTotal ?? 1) - 1);
  if (role === "cover" || slideIndex0 === 0) return true;
  if (role === "cta_slide" || slideIndex0 === last) return true;
  return false;
}

/**
 * Prefer html_layout.character.placement when present.
 * Dual paint: in_image / none → always none (no HTML cutout).
 * overlay_cutout: cover + last mandatory when placement omitted.
 */
export function resolveCharacterPlacement(
  layout: HtmlLayout | null | undefined,
  role: CarouselSlideRole,
  slideIndex0: number,
  hasCharacter: boolean,
  opts?: {
    characterPaint?: CharacterPaintPath | null;
    slideTotal?: number;
  },
): "none" | "right-cutout" | "left-cutout" {
  const paint =
    opts?.characterPaint ??
    (layout as { characterPaint?: CharacterPaintPath } | null | undefined)
      ?.characterPaint ??
    DEFAULT_CHARACTER_PAINT;
  if (!hasCharacter || paint === "in_image" || paint === "none") {
    return "none";
  }
  const fromLayout = layout?.character?.placement;
  if (
    fromLayout === "none" ||
    fromLayout === "right-cutout" ||
    fromLayout === "left-cutout"
  ) {
    // Still force cover+last when Designer said none but path is overlay
    if (
      fromLayout === "none" &&
      shouldPlaceCharacterOnSlide(role, slideIndex0, true, {
        characterPaint: paint,
        slideTotal: opts?.slideTotal,
      })
    ) {
      return "right-cutout";
    }
    return fromLayout;
  }
  return shouldPlaceCharacterOnSlide(role, slideIndex0, hasCharacter, {
    characterPaint: paint,
    slideTotal: opts?.slideTotal,
  })
    ? "right-cutout"
    : "none";
}

/** Map layoutMap role index for 6-slide carousels (cover · bodies · cta). */
export function layoutMapSlideForIndex(
  layoutMap: LayoutMap | null | undefined,
  role: CarouselSlideRole,
  slideIndex0: number,
  slideTotal: number,
): LayoutMap["slides"][number] | null {
  if (!layoutMap?.slides?.length) return null;
  if (role === "cover") {
    return layoutMap.slides.find((s) => s.role === "cover") ?? layoutMap.slides[0]!;
  }
  if (role === "cta_slide" || slideIndex0 >= slideTotal - 1) {
    return (
      layoutMap.slides.find((s) => s.role === "cta_slide") ??
      layoutMap.slides[layoutMap.slides.length - 1]!
    );
  }
  const bodies = layoutMap.slides.filter((s) => s.role === "body_slide");
  if (!bodies.length) return layoutMap.slides[Math.min(slideIndex0, layoutMap.slides.length - 1)]!;
  return bodies[(slideIndex0 - 1) % bodies.length]!;
}

/**
 * numbering_mirror: omit `.slide-num` when numberingGlobal=absent or slide numbering absent.
 * Without layoutMap → keep pretty N/M (prior default).
 */
export function shouldShowSlideNumber(
  layoutMap: LayoutMap | null | undefined,
  role: CarouselSlideRole,
  slideIndex0: number,
  slideTotal: number,
): boolean {
  if (!layoutMap) return true;
  if (layoutMap.numberingGlobal === "absent") return false;
  const slide = layoutMapSlideForIndex(
    layoutMap,
    role,
    slideIndex0,
    slideTotal,
  );
  // numberingGlobal narrowed past "absent" above → show numbers when slide map missing
  if (!slide) return true;
  if (slide.numbering?.present === false) return false;
  if (
    slide.numbering?.format === "omit" ||
    slide.numbering?.slot === "absent"
  ) {
    return false;
  }
  return true;
}

/**
 * Honor html_layout.bgFit + optional photoZone (vision style-copy / partial etalon).
 * - cover: object-fit cover full-bleed (legacy default)
 * - contain: letterbox — full image visible; plate fill in gaps
 * - mask: image only inside normalized inset photoZone; rest = plate
 */
export function resolveBgFitCss(
  layout: HtmlLayout | null | undefined,
  backgroundUrlEscaped?: string,
): { mode: BgFit; css: string } {
  const raw = (layout as { bgFit?: BgFit } | null | undefined)?.bgFit;
  const layoutSource = (
    layout as { layoutMapSource?: string } | null | undefined
  )?.layoutMapSource;
  // vision_ref etalon (RE orange) = object-on-solid → default contain, not full-bleed cover
  const fallback: BgFit =
    layoutSource === "vision_ref" ? "contain" : "cover";
  const mode: BgFit =
    raw === "contain" || raw === "mask" || raw === "cover" ? raw : fallback;
  const zone = (layout as {
    photoZone?: { x: number; y: number; w: number; h: number };
  } | null | undefined)?.photoZone;
  const objectPosition =
    (
      layout as { objectPosition?: string } | null | undefined
    )?.objectPosition?.trim() || "center center";
  const bgUrl = backgroundUrlEscaped ?? "";

  if (mode === "contain") {
    return {
      mode,
      css: `.bg {
  position: absolute;
  inset: 0;
  background-color: var(--cf-design-bg, #090A0F);
  background-image: url("${bgUrl}");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: ${objectPosition};
}`,
    };
  }

  if (mode === "mask") {
    const x = Math.min(1, Math.max(0, zone?.x ?? 0.08));
    const y = Math.min(1, Math.max(0, zone?.y ?? 0.06));
    const w = Math.min(1 - x, Math.max(0.1, zone?.w ?? 0.84));
    const h = Math.min(1 - y, Math.max(0.1, zone?.h ?? 0.55));
    return {
      mode,
      css: `.bg {
  position: absolute;
  inset: 0;
  background: var(--cf-design-bg, #090A0F);
}
.bg-photo {
  position: absolute;
  left: ${(x * 100).toFixed(2)}%;
  top: ${(y * 100).toFixed(2)}%;
  width: ${(w * 100).toFixed(2)}%;
  height: ${(h * 100).toFixed(2)}%;
  background-image: url("${bgUrl}");
  background-size: cover;
  background-position: ${objectPosition};
  background-repeat: no-repeat;
  border-radius: 12px;
  overflow: hidden;
}`,
    };
  }

  return {
    mode: "cover",
    css: `.bg {
  position: absolute;
  inset: 0;
  background-image: url("${bgUrl}");
  background-size: cover;
  background-position: ${objectPosition};
  background-repeat: no-repeat;
}`,
  };
}

/**
 * Build one layered HTML document for Puppeteer screenshot @ 1080×1350.
 * Executes Variant A `html_layout` when present; else role-based fallback.
 */
export function buildLayeredSlideHtml(input: BuildLayeredSlideHtmlInput): string {
  const role = normalizeCarouselSlideRole(
    input.slide.layout_variant,
    input.slideIndex0,
    input.slideTotal,
  );
  const { layout } = resolveHtmlLayoutForSlide(
    input.slide,
    role,
    input.slideIndex0,
  );
  const template = layout.template;
  const primaryRaw =
    (input.slide.primary_copy ?? "").trim() || `Slide ${input.slideIndex0 + 1}`;
  const secondaryRaw = (input.slide.secondary_copy ?? "").trim();
  const isCta = role === "cta_slide";
  const ctaLabel =
    resolveCtaLabel(input.slide.cta_type) ||
    resolveCtaLabel(input.rootCtaType) ||
    undefined;

  const layoutMap = input.layoutMap ?? input.preset.layoutMap ?? null;
  const characterPaint =
    input.characterPaint ??
    (layout as { characterPaint?: CharacterPaintPath }).characterPaint ??
    null;

  const layoutSource = (
    layout as { layoutMapSource?: string }
  ).layoutMapSource;
  // HIGVEN / characterPaint=none: NEVER apply RE-orange polarity (dark text on
  // charcoal photos = weak contrast). Force industrial white type + orange accent.
  const higvenIndustrial = characterPaint === "none";
  // vision_ref RE-orange rhythm: even slides = orange plate + white type;
  // odd = white plate + dark type (etalon polarity — fixes white-on-white).
  const visionPlate = higvenIndustrial
    ? {
        "--cf-design-bg": "#0B0B0B",
        "--cf-design-surface": "#0B0B0B",
        "--cf-design-text": "#FFFFFF",
        "--cf-design-muted": "#E8E8E8",
        "--cf-design-accent": "#F58220",
        "--cf-design-inverse": "#FFFFFF",
      }
    : layoutSource === "vision_ref"
      ? input.slideIndex0 % 2 === 0
        ? {
            "--cf-design-bg": "#FF5A1F",
            "--cf-design-surface": "#FF5A1F",
            "--cf-design-text": "#FFFFFF",
            "--cf-design-muted": "#1A1A1A",
            "--cf-design-accent": "#1A1A1A",
            "--cf-design-inverse": "#1A1A1A",
          }
        : {
            "--cf-design-bg": "#FFFFFF",
            "--cf-design-surface": "#FFFFFF",
            "--cf-design-text": "#1A1A1A",
            "--cf-design-muted": "#5A5A5A",
            "--cf-design-accent": "#FF5A1F",
            "--cf-design-inverse": "#FFFFFF",
          }
      : null;
  const vars = {
    ...designPresetToCssVars(input.preset, input.cssVars),
    ...(input.fontCssVars ?? {}),
    ...(visionPlate ?? {}),
  };
  const inlineVars = cssVarsToInlineStyle(vars);
  const bg = escapeHtml(input.backgroundUrl);
  const brandName = (input.brand?.brandName ?? "").trim();
  const logoUrlRaw = (input.brand?.logoUrl ?? "").trim();
  const logoUrl = logoUrlRaw ? escapeHtml(logoUrlRaw) : "";
  /** Full wordmark PNG already has letters — do not add HTML VERNATUN beside it. */
  const isFullWordmarkPng =
    /vernatun-logo\.png/i.test(logoUrlRaw) ||
    (Boolean(logoUrlRaw) && input.brand?.splitEmblemWordmark === false);
  const logoTextColor = higvenIndustrial
    ? "#FFFFFF"
    : resolveLogoTextColor(layout, {
        slideIndex0: input.slideIndex0,
        layoutMapSource: layoutSource,
      });
  /** Phase 2 Path A: emblem + HTML wordmark; full PNG = img_only. */
  const splitEmblemWordmark =
    !isFullWordmarkPng &&
    input.brand?.splitEmblemWordmark !== false &&
    Boolean(brandName);
  const brandLogoSizePx = isFullWordmarkPng
    ? BRAND_FULL_LOGO_SIZE_PX
    : BRAND_LOGO_SIZE_PX;

  const logoPlacement = resolveLogoPlacement(layout, {
    layoutMap,
    role,
    slideIndex0: input.slideIndex0,
    slideTotal: input.slideTotal,
  });
  const charPlacement = resolveCharacterPlacement(
    layout,
    role,
    input.slideIndex0,
    Boolean(input.character?.photoUrl),
    {
      characterPaint,
      slideTotal: input.slideTotal,
    },
  );
  const charUrl =
    charPlacement !== "none" && input.character?.photoUrl
      ? escapeHtml(input.character.photoUrl)
      : "";
  const mapCta = resolveCtaPlacementFromMap(layout, role, {
    layoutMap,
    slideIndex0: input.slideIndex0,
    slideTotal: input.slideTotal,
  });
  const showSlideNum = shouldShowSlideNumber(
    layoutMap,
    role,
    input.slideIndex0,
    input.slideTotal,
  );

  const textAlign = layout.text_block.align;
  const { justify: contentJustify, alignItems } = anchorToFlex(
    layout.text_block.anchor,
    layout.text_block.vertical,
  );
  // CTA slides keep type upper/mid; CTA button at bottom via flex spacer
  const safeJustify =
    isCta && layout.cta?.placement === "bottom"
      ? "flex-start"
      : template === "cta_bottom" && isCta
        ? "flex-start"
        : contentJustify;

  const typeScale = resolveTypeScaleCss(
    template,
    scaleFromPreset(input.preset),
  );
  const fontFit = layout.fontFit ?? null;
  const sizeOverride = layout.fontSizeOverride ?? null;
  const primaryFit = applyFontFitReduceOnly(parsePx(typeScale.primary), {
    fontFit,
    fontSizeOverride: sizeOverride?.primary ?? sizeOverride?.title,
    role: "primary",
  });
  const secondaryFit = applyFontFitReduceOnly(parsePx(typeScale.secondary), {
    fontFit,
    fontSizeOverride: sizeOverride?.secondary ?? sizeOverride?.body,
    role: "secondary",
  });
  const brandFit = applyFontFitReduceOnly(parsePx(typeScale.brandName), {
    fontFit,
    fontSizeOverride: sizeOverride?.brand ?? sizeOverride?.content,
    role: "brand",
  });
  // Slide-num = body paragraph tokens (family/color/size) — Architect §5.4
  const slideNumFit = applyFontFitReduceOnly(parsePx(typeScale.secondary), {
    fontFit,
    fontSizeOverride: sizeOverride?.slideNumber ?? sizeOverride?.body,
    role: "slideNumber",
  });
  const primarySize = `${primaryFit.px}px`;
  const secondarySize = `${secondaryFit.px}px`;
  const brandNameSize = `${brandFit.px}px`;
  const slideNumSize = `${slideNumFit.px}px`;
  const ctaSize = typeScale.cta;
  const fontFitMeta = [
    primaryFit.reduced ? `primary:${primaryFit.deltaPx}` : "",
    secondaryFit.reduced ? `secondary:${secondaryFit.deltaPx}` : "",
    slideNumFit.reduced ? `slideNum:${slideNumFit.deltaPx}` : "",
  ]
    .filter(Boolean)
    .join(",");
  const prettySlideNum = formatPrettySlideNum(
    input.slideIndex0,
    input.slideTotal,
  );
  const hasChar = Boolean(charUrl);
  const textMax =
    hasChar && (template === "body_left" || template === "body_split")
      ? "58%"
      : template === "body_split"
        ? "52%"
        : "100%";

  const ctaPlacement =
    mapCta ??
    layout.cta?.placement ??
    (template === "cta_bottom" ? "bottom" : "none");
  const showCta =
    isCta &&
    Boolean(ctaLabel) &&
    mapCta !== "none" &&
    (ctaPlacement === "bottom" ||
      ctaPlacement === "inline" ||
      (layout.cta?.placement == null &&
        mapCta == null &&
        template === "cta_bottom"));

  const ctaInline = ctaPlacement === "inline";
  const primaryHtml = applyAccentHighlights(
    primaryRaw,
    layout.primary?.highlights,
  );
  const secondaryHtml = secondaryRaw
    ? applyAccentHighlights(secondaryRaw, layout.secondary?.highlights)
    : "";

  const showBrand =
    logoPlacement !== "none" && Boolean(brandName || logoUrl);
  const brandPosCss = brandChromeCss(logoPlacement);
  const slideNumPosCss = slideNumCss(logoPlacement);
  const typeClear = typeClearPadPx({
    logoPlacement,
    vertical: layout.text_block.vertical,
    safeJustify,
    logoSizePx: brandLogoSizePx,
  });

  const tipCard = template === "tip_card";
  const quoteBand = template === "quote_band";

  const bgFitCss = resolveBgFitCss(layout, bg);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=${FRAME_W}"/>
<meta name="cf-render" content="layered_html"/>
<meta name="cf-role" content="${role}"/>
<meta name="cf-template" content="${template}"/>
<meta name="cf-bg-fit" content="${bgFitCss.mode}"/>
<style>
${input.fontFaceCss}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: ${FRAME_W}px;
  height: ${FRAME_H}px;
  overflow: hidden;
  background: var(--cf-design-bg, #090A0F);
}
.frame {
  position: relative;
  width: ${FRAME_W}px;
  height: ${FRAME_H}px;
  background: var(--cf-design-bg, #090A0F);
}
${bgFitCss.css}
.scrim {
  position: absolute;
  inset: 0;
  ${scrimCss(
    higvenIndustrial
      ? layout.scrim === "heavy"
        ? "heavy"
        : "soft"
      : (layout.scrim ?? "soft"),
  )}
  z-index: 1;
}
.character {
  position: absolute;
  bottom: ${SAFE.bottom - 20}px;
  height: 58%;
  max-width: 46%;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 18px 40px rgba(0,0,0,0.55));
  pointer-events: none;
}
.character.right-cutout {
  right: 40px;
  object-position: bottom right;
}
.character.left-cutout {
  left: 40px;
  object-position: bottom left;
}
/* Brand chrome: role placement; transparent plate (no white/orange matte box) */
.brand {
  position: absolute;
  ${brandPosCss}
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  z-index: 4;
  max-width: calc(100% - ${SAFE.left + SAFE.right}px);
  pointer-events: none;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0;
}
.brand img {
  max-width: ${brandLogoSizePx}px;
  max-height: ${brandLogoSizePx}px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 0;
  background: transparent !important;
  background-color: transparent !important;
  flex-shrink: 0;
  /* Keep PNG alpha; drop-shadow for legibility without opaque plate */
  filter: drop-shadow(0 2px 10px rgba(0,0,0,0.45));
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
/* Brand name: Path A HTML wordmark — color from logo.textColor */
.brand-name {
  font-family: var(--cf-font-content, var(--cf-font-body));
  font-weight: 600;
  font-size: ${brandNameSize};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${logoTextColor};
  text-shadow: 0 2px 12px rgba(0,0,0,0.45);
  white-space: nowrap;
}
.safe {
  position: absolute;
  top: ${SAFE.top}px;
  bottom: ${SAFE.bottom}px;
  left: ${SAFE.left}px;
  right: ${SAFE.right}px;
  display: flex;
  flex-direction: column;
  justify-content: ${safeJustify};
  align-items: ${alignItems};
  gap: 22px;
  z-index: 3;
  /* HARD: primary never under .brand — clear under/above logo box */
  padding-top: ${typeClear.padTop}px;
  padding-bottom: ${typeClear.padBottom}px;
  box-sizing: border-box;
}
.type-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: ${alignItems};
  width: ${textMax};
  max-width: 100%;
}
.type-stack.tip-card {
  padding: 36px 40px;
  border-radius: 28px;
  background: color-mix(in srgb, var(--cf-design-bg, #090A0F) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--cf-design-accent, #C25E28) 45%, transparent);
  box-shadow: 0 18px 48px rgba(0,0,0,0.35);
  backdrop-filter: blur(10px);
}
.type-stack.quote-band .primary {
  font-style: italic;
  border-left: 4px solid var(--cf-design-accent, #C25E28);
  padding-left: 22px;
}
.frame[data-template="body_split"] .type-stack {
  width: 52%;
  align-self: flex-start;
}
.primary {
  font-family: var(--cf-font-title, var(--cf-font-display));
  font-weight: 700;
  font-size: ${primarySize};
  line-height: 1.1;
  letter-spacing: 0.01em;
  color: var(--cf-design-text, #FFFFFF);
  text-align: ${textAlign};
  text-shadow:
    0 2px 4px rgba(0,0,0,0.75),
    0 4px 28px rgba(0,0,0,0.55);
  width: 100%;
}
.accent {
  color: var(--cf-design-accent, #C25E28);
  font-weight: 800;
}
.accent-rule {
  width: ${template === "cover_center" ? "120px" : "72px"};
  height: 2px;
  background: linear-gradient(90deg, var(--cf-design-accent, #C25E28), color-mix(in srgb, var(--cf-design-accent, #C25E28) 40%, white));
  ${textAlign === "center" ? "margin: 0 auto;" : textAlign === "right" ? "margin: 0 0 0 auto;" : ""}
  opacity: 0.95;
}
.secondary {
  font-family: var(--cf-font-body);
  font-weight: 500;
  font-size: ${secondarySize};
  line-height: 1.45;
  /* Full opacity — weak 90% mix failed charcoal HIGVEN body slides */
  color: var(--cf-design-text, #FFFFFF);
  text-align: ${textAlign};
  text-shadow:
    0 1px 2px rgba(0,0,0,0.85),
    0 2px 18px rgba(0,0,0,0.65),
    0 0 1px rgba(0,0,0,0.9);
  width: 100%;
}
.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: ${textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start"};
  margin-top: 8px;
  min-height: 64px;
  padding: 16px 36px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, var(--cf-design-accent, #C25E28), color-mix(in srgb, var(--cf-design-accent, #C25E28) 55%, #E6B25A));
  color: #0b0b0f;
  font-family: var(--cf-font-content, var(--cf-font-body));
  font-weight: 700;
  font-size: ${ctaSize};
  letter-spacing: 0.02em;
  box-shadow: 0 10px 32px rgba(194, 94, 40, 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset;
}
.cta-spacer { flex: 1 1 auto; min-height: 24px; }
/* Pretty N / M chip — own slot; body family/color/size; opposite corner from logo */
.slide-num {
  position: absolute;
  ${slideNumPosCss}
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 10px 16px;
  border-radius: 999px;
  font-family: var(--cf-font-body);
  font-size: ${slideNumSize};
  font-weight: 600;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--cf-design-text, #F5E6C8) 90%, transparent);
  background: color-mix(in srgb, var(--cf-design-bg, #090A0F) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--cf-design-accent, #C25E28) 55%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--cf-design-accent, #C25E28) 25%, transparent),
    0 8px 24px rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  text-shadow: 0 1px 8px rgba(0,0,0,0.55);
  pointer-events: none;
}
</style>
</head>
<body>
  <div class="frame" style="${inlineVars}" data-role="${role}" data-template="${template}" data-anchor="${layout.text_block.anchor}" data-vertical="${layout.text_block.vertical ?? (layout.text_block.anchor === "center" ? "middle" : "top")}" data-render="layered_html" data-type-scale="${typeScale.scaleApplied ? "preset" : "fallback"}" data-brand-chrome="${logoPlacement}" data-font-fit="${fontFitMeta || "none"}" data-bg-fit="${bgFitCss.mode}">
    <div class="bg">${bgFitCss.mode === "mask" ? `<div class="bg-photo"></div>` : ""}</div>
    <div class="scrim"></div>
    ${
      charUrl
        ? `<img class="character ${charPlacement}" src="${charUrl}" alt="" />`
        : ""
    }
    ${
      showBrand
        ? `<div class="brand" data-placement="${logoPlacement}" data-logo-mode="${
            splitEmblemWordmark && logoUrl
              ? "emblem_wordmark"
              : logoUrl
                ? "img_only"
                : "name_only"
          }" data-logo-text-color="${escapeHtml(logoTextColor)}">${
            // Phase 2 Path A: emblem <img> + HTML wordmark (textColor).
            // Legacy: img_only when splitEmblemWordmark=false and logoUrl set.
            [
              logoUrl ? `<img src="${logoUrl}" alt="" />` : "",
              splitEmblemWordmark && brandName
                ? `<div class="brand-name">${escapeHtml(brandName)}</div>`
                : !logoUrl && brandName
                  ? `<div class="brand-name">${escapeHtml(brandName)}</div>`
                  : "",
            ]
              .filter(Boolean)
              .join("")
          }</div>`
        : ""
    }
    <div class="safe">
      <div class="type-stack${tipCard ? " tip-card" : ""}${quoteBand ? " quote-band" : ""}">
        <div class="primary">${primaryHtml}</div>
        <div class="accent-rule"></div>
        ${secondaryHtml ? `<div class="secondary">${secondaryHtml}</div>` : ""}
        ${
          showCta && ctaInline && ctaLabel
            ? `<button class="cta-btn" type="button">${escapeHtml(ctaLabel)}</button>`
            : ""
        }
      </div>
      ${
        showCta && !ctaInline && ctaLabel
          ? `<div class="cta-spacer"></div><button class="cta-btn" type="button">${escapeHtml(ctaLabel)}</button>`
          : ""
      }
    </div>
    ${
      showSlideNum
        ? `<div class="slide-num" aria-label="Slide ${input.slideIndex0 + 1} of ${input.slideTotal}">${prettySlideNum}</div>`
        : ""
    }
  </div>
</body>
</html>`;
}
