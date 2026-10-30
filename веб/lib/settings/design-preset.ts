/**
 * C-visual-style-deconstructor / C-carousel-css-vars-builder —
 * Shared DesignPresetFile helpers + golden seeds (Architect D-vd-1 / D-vd-5).
 * Types live in `@/types/design` — re-exported here for Backend/FE imports.
 */

import {
  CF_DESIGN_CSS_VARS,
  colorTokensToCssVars,
  isDesignPresetId,
  toCarouselStylePreset,
  type ColorTokens,
  type ComponentPrimitiveConfig,
  type DesignPresetFile,
  type DesignPresetId,
  type LayoutMap,
  type LayoutMapChrome,
  type LayoutMapNumbering,
  type LayoutMapNumberingGlobal,
  type LayoutMapSlide,
  type LayoutMapSlideRole,
  type LayoutMapTextAnchor,
  type TypographyTokens,
} from "@/types/design";
import {
  SEED_BENTO_GLASS_ID,
  SEED_BENTO_GLASS_MD,
  SEED_BENTO_GLASS_PRESET,
  SEED_DARK_NOTES_ID,
  SEED_DARK_NOTES_MD,
  SEED_DARK_NOTES_PRESET,
} from "@/lib/settings/design-presets";

export { SEED_BENTO_GLASS_ID, SEED_DARK_NOTES_ID };

export type {
  ColorTokens,
  ComponentPrimitiveConfig,
  DesignPresetFile,
  DesignPresetId,
  LayoutMap,
  LayoutMapChrome,
  LayoutMapNumbering,
  LayoutMapNumberingGlobal,
  LayoutMapSlide,
  LayoutMapSlideRole,
  LayoutMapTextAnchor,
  TypographyTokens,
} from "@/types/design";

export {
  CF_DESIGN_CSS_VARS,
  DESIGN_PRESET_IDS,
  colorTokensToCssVars,
  isDesignPresetId,
  normalizeCarouselSlideRole,
  toCarouselStylePreset,
  type CarouselSlideRole,
  type CarouselStylePreset,
} from "@/types/design";

export type DeconstructStyleResponse = {
  presetFile: DesignPresetFile;
  markdown: string;
  html?: string;
  source: "live" | "mock";
};

/** Wave PNG hard cap (Architect D-vd-8 / D-cb-8). */
export const PNG_BUDGET_MAX = 40;

/**
 * Map ColorTokens + overrides → `--cf-design-*` record for HTML :root / frame.
 */
export function designPresetToCssVars(
  preset: DesignPresetFile,
  extraOverrides?: Partial<Record<string, string>>,
): Record<string, string> {
  return colorTokensToCssVars(preset.colors, {
    ...(preset.cssVarOverrides ?? {}),
    ...(extraOverrides ?? {}),
  });
}

export function cssVarsToInlineStyle(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

function isCssColor(v: unknown): v is string {
  if (typeof v !== "string" || !v.trim()) return false;
  const s = v.trim();
  return (
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s) ||
    /^rgba?\(/i.test(s) ||
    /^hsla?\(/i.test(s)
  );
}

const LAYOUT_ANCHOR_X = new Set(["left", "center", "right"]);
const LAYOUT_ANCHOR_Y = new Set(["top", "middle", "bottom"]);
const LAYOUT_SLIDE_ROLES = new Set(["cover", "body_slide", "cta_slide"]);
const LAYOUT_NUMBERING_GLOBAL = new Set([
  "absent",
  "pretty_N_M",
  "digits_only",
  "corner_badge",
]);
const LAYOUT_NUMBERING_FORMAT = new Set([
  "pretty_N_M",
  "digits_only",
  "corner_badge",
  "omit",
]);

function parseLayoutMapTextAnchor(raw: unknown): LayoutMapTextAnchor | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const x = typeof o.x === "string" ? o.x.trim().toLowerCase() : "";
  const y = typeof o.y === "string" ? o.y.trim().toLowerCase() : "";
  if (!LAYOUT_ANCHOR_X.has(x) || !LAYOUT_ANCHOR_Y.has(y)) return null;
  return {
    x: x as LayoutMapTextAnchor["x"],
    y: y as LayoutMapTextAnchor["y"],
  };
}

function parseLayoutMapNumbering(raw: unknown): LayoutMapNumbering {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { present: false, format: "omit", slot: "absent" };
  }
  const o = raw as Record<string, unknown>;
  const present = o.present === true;
  const formatRaw =
    typeof o.format === "string" ? o.format.trim() : undefined;
  const format =
    formatRaw && LAYOUT_NUMBERING_FORMAT.has(formatRaw)
      ? (formatRaw as LayoutMapNumbering["format"])
      : present
        ? "pretty_N_M"
        : "omit";
  const slot =
    typeof o.slot === "string" && o.slot.trim()
      ? o.slot.trim()
      : present
        ? undefined
        : "absent";
  const position =
    typeof o.position === "string" && o.position.trim()
      ? o.position.trim()
      : undefined;
  const style =
    typeof o.style === "string" && o.style.trim()
      ? o.style.trim()
      : undefined;
  return {
    present,
    format,
    ...(slot ? { slot } : {}),
    ...(position ? { position } : {}),
    ...(style ? { style } : {}),
  };
}

function parseLayoutMapChrome(raw: unknown): LayoutMapChrome {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { present: false, slot: "absent" };
  }
  const o = raw as Record<string, unknown>;
  const present = o.present === true;
  const slot =
    typeof o.slot === "string" && o.slot.trim()
      ? o.slot.trim()
      : present
        ? undefined
        : "absent";
  return { present, ...(slot ? { slot } : {}) };
}

function normalizeLayoutMapSlideRole(
  raw: unknown,
  index0: number,
  total: number,
): LayoutMapSlideRole {
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (LAYOUT_SLIDE_ROLES.has(v)) return v as LayoutMapSlideRole;
  if (v === "mid" || v === "mida" || v === "midb" || v === "body" || v === "point") {
    return "body_slide";
  }
  if (v === "cta" || v === "finale") return "cta_slide";
  if (v === "hook" || v === "hook_cover") return "cover";
  if (total <= 1) return "cover";
  if (index0 === 0) return "cover";
  if (index0 === total - 1) return "cta_slide";
  return "body_slide";
}

/**
 * Soft-parse layoutMap from deconstruct / seed JSON.
 * Returns null if unusable — never throws; colors-only presets stay valid.
 */
export function parseLayoutMap(raw: unknown): LayoutMap | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const slidesRaw = Array.isArray(o.slides) ? o.slides : null;
  if (!slidesRaw || slidesRaw.length === 0) return null;

  const slides: LayoutMapSlide[] = [];
  for (let i = 0; i < slidesRaw.length; i++) {
    const s = slidesRaw[i];
    if (!s || typeof s !== "object" || Array.isArray(s)) continue;
    const sr = s as Record<string, unknown>;
    const textAnchor =
      parseLayoutMapTextAnchor(sr.textAnchor) ??
      parseLayoutMapTextAnchor(sr.text_anchor) ?? {
        x: "left" as const,
        y: "top" as const,
      };
    slides.push({
      role: normalizeLayoutMapSlideRole(sr.role, i, slidesRaw.length),
      textAnchor,
      numbering: parseLayoutMapNumbering(sr.numbering),
      logoChrome: parseLayoutMapChrome(sr.logoChrome ?? sr.logo_chrome),
      ctaChrome: parseLayoutMapChrome(sr.ctaChrome ?? sr.cta_chrome),
    });
  }
  if (!slides.length) return null;

  const anyNumberPresent = slides.some((s) => s.numbering.present);
  const globalRaw =
    typeof o.numberingGlobal === "string"
      ? o.numberingGlobal.trim()
      : typeof o.numbering_global === "string"
        ? o.numbering_global.trim()
        : "";
  let numberingGlobal: LayoutMapNumberingGlobal;
  if (LAYOUT_NUMBERING_GLOBAL.has(globalRaw)) {
    numberingGlobal = globalRaw as LayoutMapNumberingGlobal;
  } else if (!anyNumberPresent) {
    numberingGlobal = "absent";
  } else {
    numberingGlobal = "pretty_N_M";
  }

  // HARD: no ref numbers → absent (mirror omit)
  if (!anyNumberPresent) numberingGlobal = "absent";

  const grammarNote =
    typeof o.grammarNote === "string" && o.grammarNote.trim()
      ? o.grammarNote.trim()
      : typeof o.grammar_note === "string" && o.grammar_note.trim()
        ? o.grammar_note.trim()
        : undefined;

  return {
    slides,
    numberingGlobal,
    ...(grammarNote ? { grammarNote } : {}),
  };
}

/**
 * Soft-parse unknown JSON into DesignPresetFile (active sync / library migrate).
 * Returns null if unusable — never throws.
 */
export function parseDesignPresetFile(raw: unknown): DesignPresetFile | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : "";
  const preset = isDesignPresetId(o.preset) ? o.preset : null;
  const name = typeof o.name === "string" && o.name.trim() ? o.name.trim() : "";
  const designMd =
    typeof o.designMd === "string"
      ? o.designMd
      : typeof o.design_md === "string"
        ? o.design_md
        : "";
  const colorsRaw =
    o.colors && typeof o.colors === "object" && !Array.isArray(o.colors)
      ? (o.colors as Record<string, unknown>)
      : null;
  if (!id || !preset || !name || !colorsRaw) return null;

  const bg = isCssColor(colorsRaw.bg) ? colorsRaw.bg.trim() : null;
  const surface = isCssColor(colorsRaw.surface)
    ? colorsRaw.surface.trim()
    : null;
  const text = isCssColor(colorsRaw.text) ? colorsRaw.text.trim() : null;
  const muted = isCssColor(colorsRaw.muted) ? colorsRaw.muted.trim() : null;
  const accent = isCssColor(colorsRaw.accent) ? colorsRaw.accent.trim() : null;
  if (!bg || !surface || !text || !muted || !accent) return null;

  const typoRaw =
    o.typography &&
    typeof o.typography === "object" &&
    !Array.isArray(o.typography)
      ? (o.typography as Record<string, unknown>)
      : {};
  const display =
    typeof typoRaw.display === "string" && typoRaw.display.trim()
      ? typoRaw.display.trim()
      : '"Cormorant Garamond", "Times New Roman", serif';
  const body =
    typeof typoRaw.body === "string" && typoRaw.body.trim()
      ? typoRaw.body.trim()
      : "Manrope, system-ui, sans-serif";

  const components =
    o.components &&
    typeof o.components === "object" &&
    !Array.isArray(o.components)
      ? (o.components as ComponentPrimitiveConfig)
      : {};

  let cssVarOverrides: DesignPresetFile["cssVarOverrides"];
  if (
    o.cssVarOverrides &&
    typeof o.cssVarOverrides === "object" &&
    !Array.isArray(o.cssVarOverrides)
  ) {
    const ov: Record<string, string> = {};
    for (const [k, v] of Object.entries(
      o.cssVarOverrides as Record<string, unknown>,
    )) {
      if (typeof v === "string" && v.trim()) ov[k] = v.trim();
    }
    if (Object.keys(ov).length) cssVarOverrides = ov;
  }

  const version =
    typeof o.version === "number" && Number.isFinite(o.version)
      ? Math.max(1, Math.round(o.version))
      : 1;

  const scaleRaw =
    typoRaw.scale &&
    typeof typoRaw.scale === "object" &&
    !Array.isArray(typoRaw.scale)
      ? (typoRaw.scale as TypographyTokens["scale"])
      : undefined;

  const layoutMap =
    parseLayoutMap(o.layoutMap) ??
    parseLayoutMap(o.layout_map) ??
    undefined;

  const parsed: DesignPresetFile = {
    id,
    preset,
    name,
    designMd: designMd || `# ${name}\n`,
    colors: {
      bg,
      surface,
      text,
      muted,
      accent,
      accentSoft: isCssColor(colorsRaw.accentSoft)
        ? colorsRaw.accentSoft.trim()
        : undefined,
    },
    typography: {
      display,
      body,
      mono:
        typeof typoRaw.mono === "string" && typoRaw.mono.trim()
          ? typoRaw.mono.trim()
          : undefined,
      armenianSafe:
        typeof typoRaw.armenianSafe === "string" &&
        typoRaw.armenianSafe.trim()
          ? typoRaw.armenianSafe.trim()
          : undefined,
      scale: scaleRaw,
    },
    components,
    cssVarOverrides,
    referenceImageUrl:
      typeof o.referenceImageUrl === "string" && o.referenceImageUrl.trim()
        ? o.referenceImageUrl.trim()
        : undefined,
    ...(layoutMap ? { layoutMap } : {}),
    version,
  };
  // Embla / design-active persist: never drop typography.scale (FULL inject)
  return ensurePresetTypographyScale(parsed);
}

/** Vernatun-safe defaults when deconstruct / migrate omit scale. */
export const PRESET_FALLBACK_SCALE = {
  cover: 48,
  h2: 32,
  body: 22,
  caption: 16,
} as const;

/**
 * S52 + wave design-inject-logo-br — FULL DESIGN role table for Designer inject.
 * Per role: family + sizePx + color. No COVER/BODY/CTA layout kits.
 */
export function buildDesignTokensPayload(
  preset: DesignPresetFile,
): Record<string, unknown> {
  const scale = preset.typography.scale;
  const cover = scale?.cover ?? PRESET_FALLBACK_SCALE.cover;
  const h2 = scale?.h2 ?? PRESET_FALLBACK_SCALE.h2;
  const body = scale?.body ?? PRESET_FALLBACK_SCALE.body;
  const caption = scale?.caption ?? PRESET_FALLBACK_SCALE.caption;
  const display = preset.typography.display;
  const bodyFamily = preset.typography.body;
  const contentFamily = preset.typography.mono?.trim() || bodyFamily;
  const text = preset.colors.text;
  const muted = preset.colors.muted;
  const accent = preset.colors.accent;

  const roles = {
    title: {
      family: display,
      weight: 700,
      sizePx: cover,
      lineHeight: 1.1,
      color: text,
    },
    body: {
      family: bodyFamily,
      weight: 400,
      sizePx: body,
      lineHeight: 1.4,
      color: text,
    },
    content: {
      family: contentFamily,
      weight: 600,
      sizePx: h2,
      lineHeight: 1.2,
      color: text,
    },
    accent: { color: accent },
    muted: { color: muted },
    slideNumber: {
      family: bodyFamily,
      sizePx: body,
      color: text,
    },
    brandName: {
      family: contentFamily,
      sizePx: caption,
      color: text,
    },
    cta: {
      family: contentFamily,
      weight: 700,
      sizePx: body,
      color: text,
    },
  };

  const paletteMood = [
    `Match scene lighting mood to type colors: text ${text}, accent ${accent}, muted ${muted}, bg ${preset.colors.bg}.`,
    "Cool/lavender text → cool mist / dusk violet; warm cognac/gold → warm dusk / amber rim light — not flat black mud.",
  ].join(" ");

  return {
    id: preset.id,
    preset: preset.preset,
    name: preset.name,
    colors: preset.colors,
    typography: {
      display: preset.typography.display,
      body: preset.typography.body,
      mono: preset.typography.mono,
      armenianSafe: preset.typography.armenianSafe,
      scale: scale ?? { cover, h2, body, caption },
    },
    roles,
    paletteMood,
    textBlock: {
      displayFamily: display,
      bodyFamily,
      armenianSafe: preset.typography.armenianSafe,
      scale: scale ?? { cover, h2, body, caption },
      cardRadius: preset.components.card?.radius ?? null,
    },
    smallElement: {
      chipAccent: accent,
      labelMuted: muted,
      progressAccent: accent,
      marker: preset.components.markerHighlight?.color ?? null,
      cardRadius: preset.components.card?.radius ?? null,
    },
    cssVarOverrides: preset.cssVarOverrides ?? {},
    // Wave layout-copy: grammar for Designer/composite mirror (omit when absent)
    ...(preset.layoutMap ? { layoutMap: preset.layoutMap } : {}),
  };
}

/**
 * Ensure DesignPresetFile.typography.scale has cover/h2/body/caption.
 * Used by deconstruct persist + parseDesignPresetFile (Embla → FULL inject).
 */
export function ensurePresetTypographyScale(
  preset: DesignPresetFile,
): DesignPresetFile {
  const scale = preset.typography?.scale;
  const hasAny =
    scale &&
    typeof scale === "object" &&
    (typeof scale.cover === "number" ||
      typeof scale.h2 === "number" ||
      typeof scale.body === "number" ||
      typeof scale.caption === "number");
  const nextScale = {
    cover:
      (hasAny && typeof scale?.cover === "number" && scale.cover > 0
        ? scale.cover
        : PRESET_FALLBACK_SCALE.cover),
    h2:
      (hasAny && typeof scale?.h2 === "number" && scale.h2 > 0
        ? scale.h2
        : PRESET_FALLBACK_SCALE.h2),
    body:
      (hasAny && typeof scale?.body === "number" && scale.body > 0
        ? scale.body
        : PRESET_FALLBACK_SCALE.body),
    caption:
      (hasAny && typeof scale?.caption === "number" && scale.caption > 0
        ? scale.caption
        : PRESET_FALLBACK_SCALE.caption),
  };
  if (
    scale?.cover === nextScale.cover &&
    scale?.h2 === nextScale.h2 &&
    scale?.body === nextScale.body &&
    scale?.caption === nextScale.caption
  ) {
    return preset;
  }
  return {
    ...preset,
    typography: {
      ...preset.typography,
      scale: nextScale,
    },
  };
}

/** Golden seed — chalkboard / yellow marker / doodle / seamless arrows (bzhak3 refs). */
export function createDarkNotesSeedPreset(
  overrides?: Partial<Pick<DesignPresetFile, "id" | "name" | "designMd">>,
): DesignPresetFile {
  return {
    ...SEED_DARK_NOTES_PRESET,
    id: overrides?.id ?? SEED_DARK_NOTES_ID,
    name: overrides?.name ?? SEED_DARK_NOTES_PRESET.name,
    designMd: overrides?.designMd ?? SEED_DARK_NOTES_MD.trim(),
  };
}

/** Golden seed — glass bento / gold-amber telemetry (uchuftu refs). */
export function createBentoGlassSeedPreset(
  overrides?: Partial<Pick<DesignPresetFile, "id" | "name" | "designMd">>,
): DesignPresetFile {
  return {
    ...SEED_BENTO_GLASS_PRESET,
    id: overrides?.id ?? SEED_BENTO_GLASS_ID,
    name: overrides?.name ?? SEED_BENTO_GLASS_PRESET.name,
    designMd: overrides?.designMd ?? SEED_BENTO_GLASS_MD.trim(),
  };
}

/** Fallback Vernatun editorial when deconstruct cannot map. */
export function createDefaultVernatunPreset(
  nameHint = "Vernatun Design",
): DesignPresetFile {
  return {
    id: `preset-${Date.now().toString(36)}`,
    preset: "dark_editorial",
    name: nameHint.trim() || "Vernatun Design",
    designMd: [
      "---",
      `name: ${nameHint.trim() || "Vernatun Design"}`,
      "preset: dark_editorial",
      "---",
      "",
      "# Vernatun dark editorial (stub)",
      "",
      "Dark luxury night atmosphere, cognac / soft gold accents.",
    ].join("\n"),
    colors: {
      bg: "#090A0F",
      surface: "#14161E",
      text: "#F5E6C8",
      muted: "#A89880",
      accent: "#C25E28",
      accentSoft: "#E6B25A",
    },
    typography: {
      display: '"Cormorant Garamond", "Times New Roman", serif',
      body: "Manrope, system-ui, sans-serif",
      armenianSafe: '"Noto Sans Armenian", Manrope, sans-serif',
    },
    components: {
      buttonCta: { glow: true },
      card: { glass: false, radius: "16px" },
      seamlessConnector: { enabled: false },
    },
    version: 1,
  };
}

/**
 * Heuristic map from DESIGN.md color frontmatter / prose → nearest preset.
 */
export function inferPresetIdFromMarkdown(markdown: string): DesignPresetId {
  const lower = markdown.toLowerCase();
  if (
    /chalk|marker|doodle|checklist|hand.?drawn|yellow.?highlight|dark.?notes/.test(
      lower,
    )
  ) {
    return "dark_notes";
  }
  if (/bento|glass|telemetry|gauge|blur|frost/.test(lower)) {
    return "bento_glass";
  }
  if (/poster|bold|high.?contrast|solid.?block/.test(lower)) {
    return "bold_poster";
  }
  return "dark_editorial";
}

/** Extract simple hex colors from DESIGN.md YAML-ish body. */
export function extractColorsFromMarkdown(
  markdown: string,
): Partial<ColorTokens> {
  const out: Partial<ColorTokens> = {};
  const pick = (keys: string[], target: keyof ColorTokens) => {
    for (const key of keys) {
      const re = new RegExp(
        `(?:^|\\n)\\s*${key}\\s*:\\s*['"]?(#[0-9a-fA-F]{3,8}|rgba?\\([^)]+\\))['"]?`,
        "i",
      );
      const m = markdown.match(re);
      if (m?.[1]) {
        out[target] = m[1];
        return;
      }
    }
  };
  pick(["bg", "background"], "bg");
  pick(["surface", "surface-container", "surface_container"], "surface");
  pick(["text", "on-surface", "on_surface"], "text");
  pick(["muted", "outline", "secondary-text"], "muted");
  pick(["accent", "primary"], "accent");
  pick(["accentSoft", "accent_soft", "secondary"], "accentSoft");
  return out;
}

/**
 * Build DesignPresetFile from parsed markdown (+ optional name).
 * Used by deconstruct soft path when AI Bridge typed JSON is absent.
 */
export function presetFileFromMarkdown(opts: {
  markdown: string;
  name?: string;
  html?: string;
  id?: string;
  referenceImageUrl?: string;
}): DesignPresetFile {
  const inferred = inferPresetIdFromMarkdown(opts.markdown);
  const base =
    inferred === "dark_notes"
      ? createDarkNotesSeedPreset()
      : inferred === "bento_glass"
        ? createBentoGlassSeedPreset()
        : createDefaultVernatunPreset(opts.name);

  const extracted = extractColorsFromMarkdown(opts.markdown);
  const colors: ColorTokens = {
    bg: extracted.bg ?? base.colors.bg,
    surface: extracted.surface ?? base.colors.surface,
    text: extracted.text ?? base.colors.text,
    muted: extracted.muted ?? base.colors.muted,
    accent: extracted.accent ?? base.colors.accent,
    accentSoft: extracted.accentSoft ?? base.colors.accentSoft,
  };

  const name =
    opts.name?.trim() ||
    markdownNameFromFrontmatter(opts.markdown) ||
    base.name;

  return {
    ...base,
    id: opts.id ?? `preset-${Date.now().toString(36)}`,
    preset: inferred,
    name,
    designMd: opts.markdown.trim() || base.designMd,
    colors,
    referenceImageUrl: opts.referenceImageUrl,
    version: 1,
  };
}

function markdownNameFromFrontmatter(markdown: string): string | null {
  const m = markdown.match(/(?:^|\n)name:\s*['"]?([^\n'"]+)/i);
  return m?.[1]?.trim() || null;
}

/** HTML kit companion from preset (Settings sliced CSS mocks / debug). */
export function buildHtmlKitFromPreset(preset: DesignPresetFile): string {
  const vars = designPresetToCssVars(preset);
  const decls = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  const glass = preset.components.card?.glass
    ? `backdrop-filter: blur(${preset.components.card.blur ?? "16px"});`
    : "";
  const bridge = preset.components.seamlessConnector?.enabled
    ? `/* seamlessConnector: ${preset.components.seamlessConnector.style ?? "on"} ${preset.components.seamlessConnector.color ?? ""} */`
    : "/* seamlessConnector: off */";
  return [
    `<!-- Vernatun kit ${preset.preset} · 1080×1350 safe 120/160/80 -->`,
    bridge,
    `:root {`,
    decls,
    `}`,
    `.cf-frame { background: var(--cf-design-bg); color: var(--cf-design-text); }`,
    `.cf-card { background: var(--cf-design-surface); ${glass} border-radius: ${preset.components.card?.radius ?? "16px"}; }`,
    `.cf-accent { color: var(--cf-design-accent); }`,
    `.cf-cta { background: var(--cf-design-accent); ${preset.components.buttonCta?.glow ? "box-shadow: 0 0 24px color-mix(in srgb, var(--cf-design-accent) 55%, transparent);" : ""} }`,
  ].join("\n");
}

/** Alias used by builder callers. */
export function presetToCarouselStyle(preset: DesignPresetFile) {
  return toCarouselStylePreset(preset);
}
