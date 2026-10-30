/**
 * C-visual-style-deconstructor / C-carousel-css-vars-builder — DesignPresetFile canon.
 * AI Bridge owns names; Backend/FE consume. Re-exported from `lib/settings/design-preset`.
 */

/** Product preset family ids (golden: dark_notes, bento_glass). */
export type DesignPresetId =
  | "dark_notes"
  | "bento_glass"
  | "dark_editorial"
  | "bold_poster";

export const DESIGN_PRESET_IDS: readonly DesignPresetId[] = [
  "dark_notes",
  "bento_glass",
  "dark_editorial",
  "bold_poster",
] as const;

/** Palette mapped live → `--cf-design-*` CSS vars. */
export type ColorTokens = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft?: string;
  danger?: string;
  success?: string;
};

/** Type stacks for HTML frames (Armenian-safe required for Vernatun). */
export type TypographyTokens = {
  display: string;
  body: string;
  mono?: string;
  /** e.g. "Noto Sans Armenian" — never drop Armenian glyphs */
  armenianSafe?: string;
  scale?: {
    cover: number;
    h2: number;
    body: number;
    caption: number;
  };
};

/**
 * Wave 2026-10-18 layout-copy — vision-extracted layout grammar from 4-ref grid.
 * Generation **mirrors** anchors/chrome/numbering presence; invents content+bg+CTA only.
 */
export type LayoutMapTextAnchor = {
  x: "left" | "center" | "right";
  y: "top" | "middle" | "bottom";
};

export type LayoutMapNumberingFormat =
  | "pretty_N_M"
  | "digits_only"
  | "corner_badge"
  | "omit";

export type LayoutMapNumbering = {
  present: boolean;
  format?: LayoutMapNumberingFormat;
  /** HTML slot hint, or `absent` when no numbers on refs. */
  slot?: string | "absent";
  position?: string;
  style?: string;
};

export type LayoutMapChromeSlot =
  | "bottom-right"
  | "top-right"
  | "top-left"
  | "bottom"
  | "center"
  | "absent";

export type LayoutMapChrome = {
  present: boolean;
  slot?: LayoutMapChromeSlot | string;
};

export type LayoutMapSlideRole = "cover" | "body_slide" | "cta_slide";

export type LayoutMapSlide = {
  role: LayoutMapSlideRole;
  textAnchor: LayoutMapTextAnchor;
  numbering: LayoutMapNumbering;
  logoChrome: LayoutMapChrome;
  ctaChrome: LayoutMapChrome;
};

export type LayoutMapNumberingGlobal =
  | "absent"
  | "pretty_N_M"
  | "digits_only"
  | "corner_badge";

/** Companion layout grammar on DesignPresetFile (optional until 4-up deconstruct). */
export type LayoutMap = {
  slides: LayoutMapSlide[];
  numberingGlobal: LayoutMapNumberingGlobal;
  grammarNote?: string;
};

/**
 * Layout primitives per preset.
 * `seamlessConnector` — cross-cut arrows/steam/glow split across adjacent 4:5 PNGs.
 */
export type ComponentPrimitiveConfig = {
  card?: {
    radius?: string;
    blur?: string;
    border?: string;
    glass?: boolean;
  };
  buttonCta?: {
    radius?: string;
    glow?: boolean;
    labelWeight?: number;
  };
  checkbox?: {
    style: "hand" | "ui";
    stroke?: string;
  };
  gauge?: {
    stroke?: string;
    glow?: boolean;
  };
  doodle?: {
    enabled: boolean;
    ink?: string;
  };
  markerHighlight?: {
    color: string;
    ragged?: boolean;
  };
  logoMark?: "vernatun_pomegranate" | "none" | string;
  /** Bridge art across sliced frames (dark_notes arrows / bento glow bleed). */
  seamlessConnector?: {
    enabled: boolean;
    style?: "arrow" | "glow" | "line" | "steam" | "swirl";
    color?: string;
  };
};

/** Typed companion to DESIGN.md — Embla library slot.presetFile. */
export type DesignPresetFile = {
  /** Library slot id (seed: seed-dark-notes / seed-bento-glass). */
  id: string;
  preset: DesignPresetId;
  name: string;
  /** DESIGN.md body (also mirrored on DesignLibrarySlot.markdown). */
  designMd: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  components: ComponentPrimitiveConfig;
  /** Quick Theme Tuner / live overrides — builder merges over colors. */
  cssVarOverrides?: Partial<Record<string, string>>;
  referenceImageUrl?: string;
  /**
   * Wave layout-copy: 4-ref grid grammar (text anchors, numbering present|absent,
   * logo/CTA chrome). Soft-optional — colors-only presets stay valid without it.
   */
  layoutMap?: LayoutMap;
  version: number;
};

/** Role kits for carouselHtmlBuilder rhythm. */
export type CarouselSlideRole = "cover" | "body_slide" | "cta_slide";

/**
 * Builder-facing view of an active DesignPresetFile:
 * resolved `--cf-design-*` map + primitives for cover/body/cta kits.
 */
export type CarouselStylePreset = {
  presetId: DesignPresetId;
  slotId: string;
  name: string;
  /** Fully resolved CSS custom properties for the frame wrapper. */
  cssVars: Record<string, string>;
  colors: ColorTokens;
  typography: TypographyTokens;
  components: ComponentPrimitiveConfig;
  designMd?: string;
  version: number;
};

/** Canonical CSS var names (D-cb-2 / design-system). */
export const CF_DESIGN_CSS_VARS = {
  bg: "--cf-design-bg",
  surface: "--cf-design-surface",
  text: "--cf-design-text",
  muted: "--cf-design-muted",
  accent: "--cf-design-accent",
  accentSoft: "--cf-design-accent-soft",
} as const;

/** Map ColorTokens → `--cf-design-*` (overrides win). */
export function colorTokensToCssVars(
  colors: ColorTokens,
  overrides?: Partial<Record<string, string>> | null,
): Record<string, string> {
  const base: Record<string, string> = {
    [CF_DESIGN_CSS_VARS.bg]: colors.bg,
    [CF_DESIGN_CSS_VARS.surface]: colors.surface,
    [CF_DESIGN_CSS_VARS.text]: colors.text,
    [CF_DESIGN_CSS_VARS.muted]: colors.muted,
    [CF_DESIGN_CSS_VARS.accent]: colors.accent,
  };
  if (colors.accentSoft) {
    base[CF_DESIGN_CSS_VARS.accentSoft] = colors.accentSoft;
  }
  if (overrides) {
    for (const [k, v] of Object.entries(overrides)) {
      if (typeof v === "string" && v.trim()) {
        const key = k.startsWith("--")
          ? k
          : `--cf-design-${k.replace(/^cf-design-/, "")}`;
        base[key] = v.trim();
      }
    }
  }
  return base;
}

/** DesignPresetFile → CarouselStylePreset for builder / prompts. */
export function toCarouselStylePreset(
  file: DesignPresetFile,
): CarouselStylePreset {
  return {
    presetId: file.preset,
    slotId: file.id,
    name: file.name,
    cssVars: colorTokensToCssVars(file.colors, file.cssVarOverrides),
    colors: file.colors,
    typography: file.typography,
    components: file.components,
    designMd: file.designMd,
    version: file.version,
  };
}

/**
 * Normalize Scriptwriter layout_variant / role aliases → kit id.
 * Single source — carousel-html-renderer re-exports this.
 */
export function normalizeCarouselSlideRole(
  raw: string | undefined | null,
  index0: number,
  total: number,
): CarouselSlideRole {
  const v = (raw ?? "").trim().toLowerCase();
  if (
    v === "cover" ||
    v === "hook_cover" ||
    v === "hook" ||
    v === "cover_hook"
  ) {
    return "cover";
  }
  if (v === "cta" || v === "cta_slide" || v === "finale") {
    return "cta_slide";
  }
  if (
    v === "body_slide" ||
    v === "body" ||
    v === "point" ||
    v === "proof" ||
    v === "statement_split" ||
    v === "statement" ||
    v === "split"
  ) {
    return "body_slide";
  }
  // Rhythm for N≥2: 1 cover, 2…N−1 body, N cta
  if (total <= 1) return "cover";
  if (index0 === 0) return "cover";
  if (index0 === total - 1) return "cta_slide";
  return "body_slide";
}

export function isDesignPresetId(v: unknown): v is DesignPresetId {
  return (
    typeof v === "string" &&
    (DESIGN_PRESET_IDS as readonly string[]).includes(v)
  );
}
