/**
 * Wave 2026-10-18 layout-copy — hand-crafted DesignPresetFile ×3 from etalon grids
 * 01 RE orange · 02 luma coffee · 03 omkopa teal (+ layoutMap).
 * Seed via `scripts/seed-layout-copy-dual-char.ts`.
 */

import type { DesignPresetFile, LayoutMap, LayoutMapNumbering } from "@/types/design";

const ETALON_DIR =
  "generatedMedia/эталон карусели/layout-copy-refs-2026-10-18";

export const SEED_RE_ORANGE_ID = "seed-layout-re-orange-01";
export const SEED_LUMA_COFFEE_ID = "seed-layout-luma-coffee-02";
export const SEED_OMKOPA_TEAL_ID = "seed-layout-omkopa-teal-03";

/** Stable Landscapes conductor number for sheet 04 «Ануш». */
export const LAYOUT_COPY_CONDUCTOR_NUMBER = 1;
export const LAYOUT_COPY_CONDUCTOR_NAME = "Ануш";

function omitNumbering(): LayoutMapNumbering {
  return { present: false, format: "omit", slot: "absent" };
}

/** 01 RE orange — solid orange/white blocks; no N/M chrome; CTA bottom; logo top. */
export const LAYOUT_MAP_RE_ORANGE: LayoutMap = {
  numberingGlobal: "absent",
  grammarNote:
    "Bold orange/white editorial blocks; headline top-left or center; logo top; CTA bottom-left chrome; no slide-number chips",
  slides: [
    {
      role: "cover",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: true, slot: "bottom" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: true, slot: "bottom" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "center", y: "middle" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "cta_slide",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: true, slot: "bottom" },
    },
  ],
};

/** 02 Luma coffee — cinematic photo; logo bottom-left footer; CTA near headline; no N/M. */
export const LAYOUT_MAP_LUMA_COFFEE: LayoutMap = {
  numberingGlobal: "absent",
  grammarNote:
    "Warm photo editorial; type top/center; logo bottom-left footer; pill CTA under headline; no slide numbers",
  slides: [
    {
      role: "cover",
      textAnchor: { x: "center", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: true, slot: "center" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "center", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "right", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "cta_slide",
      textAnchor: { x: "center", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: true, slot: "center" },
    },
  ],
};

/** 03 Omkopa teal — beige stage; logo top-left; teal header boxes; 3D nums are scene (not HTML N/M). */
export const LAYOUT_MAP_OMKOPA_TEAL: LayoutMap = {
  numberingGlobal: "absent",
  grammarNote:
    "Beige corporate surrealism; teal header boxes top; gold MK logo top-left; footer URL; scene 3D nums ≠ HTML slide-num",
  slides: [
    {
      role: "cover",
      textAnchor: { x: "right", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "right", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "right", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "cta_slide",
      textAnchor: { x: "right", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
  ],
};

export const SEED_RE_ORANGE_MD = `---
name: RE Orange
preset: bold_poster
version: 1
colors:
  bg: '#FF5A1F'
  surface: '#FFFFFF'
  text: '#FFFFFF'
  muted: '#1A1A1A'
  accent: '#FF5A1F'
  accentSoft: 'rgba(255, 90, 31, 0.35)'
---

# RE Orange — real-estate orange grid (layout-copy 01)

Etalon: \`${ETALON_DIR}/01-real-estate-orange-grid.png\`

## Canvas
- 1080×1350 · safe top≥120 bottom≥160 sides≥80
- Product = sliced 4:5; grammar from **layoutMap** (no invent numbers)

## Colors
| Token | Hex | Use |
|-------|-----|-----|
| bg | \`#FF5A1F\` | Orange field / accent blocks |
| surface | \`#FFFFFF\` | White alternate slides |
| text | \`#FFFFFF\` | Type on orange |
| muted | \`#1A1A1A\` | Type on white |
| accent | \`#FF5A1F\` | Keywords / CTA icon |

## Typography
- Display: bold geometric sans (Manrope / Geist)
- Body: clean sans · Armenian-safe Noto Sans Armenian
- scale: cover 52 · h2 34 · body 22 · caption 16

## Layout grammar (HARD)
- **numberingGlobal: absent** — composite omits \`.slide-num\`
- Logo chrome: **top-left**
- CTA chrome: **bottom** (catalog 1–4 button on cta_slide)
- Text anchors: cover/body left-top; mid body center; invent content only

## Don't
- Pretty N/M chips · purple slop · inventing parallel layout markup
`;

export const SEED_LUMA_COFFEE_MD = `---
name: Luma Coffee
preset: dark_editorial
version: 1
colors:
  bg: '#1C1410'
  surface: '#2A1F18'
  text: '#FFF8F0'
  muted: '#C4A484'
  accent: '#C45C26'
  accentSoft: 'rgba(196, 92, 38, 0.35)'
---

# Luma Coffee — warm cinematic grid (layout-copy 02)

Etalon: \`${ETALON_DIR}/02-luma-coffee-grid.jpg\`

## Colors
Warm espresso browns + cream type + terracotta accent.

## Layout grammar
- numberingGlobal: **absent**
- Logo: **bottom-left** footer
- CTA: **center** under headline when present
- Photo-first; type top band

## Typography scale
cover 48 · h2 32 · body 20 · caption 14
`;

export const SEED_OMKOPA_TEAL_MD = `---
name: Omkopa Teal
preset: bold_poster
version: 1
colors:
  bg: '#E8DCC8'
  surface: '#F5EDE0'
  text: '#1A1A1A'
  muted: '#5A6A6E'
  accent: '#0D7377'
  accentSoft: 'rgba(13, 115, 119, 0.35)'
---

# Omkopa Teal — corporate surreal grid (layout-copy 03)

Etalon: \`${ETALON_DIR}/03-omkopa-teal-character-grid.png\`

## Colors
Sand beige stage · teal headers · gold logo accents.

## Layout grammar
- numberingGlobal: **absent** (3D scene numbers ≠ HTML slide-num)
- Logo: **top-left**
- CTA chrome: usually absent (footer URL only) — CTA catalog still on last slide if needed
- Text: right/top teal boxes

## Typography scale
cover 44 · h2 30 · body 20 · caption 14
`;

export const SEED_RE_ORANGE_PRESET: DesignPresetFile = {
  id: SEED_RE_ORANGE_ID,
  preset: "bold_poster",
  name: "RE Orange",
  designMd: SEED_RE_ORANGE_MD.trim(),
  colors: {
    bg: "#FF5A1F",
    surface: "#FFFFFF",
    text: "#FFFFFF",
    muted: "#1A1A1A",
    accent: "#FF5A1F",
    accentSoft: "rgba(255, 90, 31, 0.35)",
  },
  typography: {
    display: "Manrope, Geist Sans, system-ui, sans-serif",
    body: "Manrope, system-ui, sans-serif",
    armenianSafe: "Noto Sans Armenian, Manrope, sans-serif",
    scale: { cover: 52, h2: 34, body: 22, caption: 16 },
  },
  components: {
    card: { glass: false, radius: "8px", border: "none" },
    buttonCta: { glow: false, radius: "999px", labelWeight: 700 },
    logoMark: "vernatun_pomegranate",
    doodle: { enabled: false },
  },
  cssVarOverrides: {
    "--cf-design-inverse": "#1A1A1A",
  },
  referenceImageUrl: `${ETALON_DIR}/01-real-estate-orange-grid.png`,
  layoutMap: LAYOUT_MAP_RE_ORANGE,
  version: 1,
};

export const SEED_LUMA_COFFEE_PRESET: DesignPresetFile = {
  id: SEED_LUMA_COFFEE_ID,
  preset: "dark_editorial",
  name: "Luma Coffee",
  designMd: SEED_LUMA_COFFEE_MD.trim(),
  colors: {
    bg: "#1C1410",
    surface: "#2A1F18",
    text: "#FFF8F0",
    muted: "#C4A484",
    accent: "#C45C26",
    accentSoft: "rgba(196, 92, 38, 0.35)",
  },
  typography: {
    display: "Manrope, Geist Sans, system-ui, sans-serif",
    body: "Manrope, system-ui, sans-serif",
    armenianSafe: "Noto Sans Armenian, Manrope, sans-serif",
    scale: { cover: 48, h2: 32, body: 20, caption: 14 },
  },
  components: {
    card: {
      glass: true,
      blur: "12px",
      radius: "16px",
      border: "1px solid rgba(255,248,240,0.12)",
    },
    buttonCta: { glow: true, radius: "999px", labelWeight: 700 },
    logoMark: "vernatun_pomegranate",
  },
  referenceImageUrl: `${ETALON_DIR}/02-luma-coffee-grid.jpg`,
  layoutMap: LAYOUT_MAP_LUMA_COFFEE,
  version: 1,
};

export const SEED_OMKOPA_TEAL_PRESET: DesignPresetFile = {
  id: SEED_OMKOPA_TEAL_ID,
  preset: "bold_poster",
  name: "Omkopa Teal",
  designMd: SEED_OMKOPA_TEAL_MD.trim(),
  colors: {
    bg: "#E8DCC8",
    surface: "#F5EDE0",
    text: "#1A1A1A",
    muted: "#5A6A6E",
    accent: "#0D7377",
    accentSoft: "rgba(13, 115, 119, 0.35)",
  },
  typography: {
    display: "Manrope, Geist Sans, system-ui, sans-serif",
    body: "Manrope, system-ui, sans-serif",
    armenianSafe: "Noto Sans Armenian, Manrope, sans-serif",
    scale: { cover: 44, h2: 30, body: 20, caption: 14 },
  },
  components: {
    card: { glass: false, radius: "4px", border: "none" },
    buttonCta: { glow: false, radius: "8px", labelWeight: 700 },
    logoMark: "none",
  },
  cssVarOverrides: {
    "--cf-design-gold": "#C9A227",
  },
  referenceImageUrl: `${ETALON_DIR}/03-omkopa-teal-character-grid.png`,
  layoutMap: LAYOUT_MAP_OMKOPA_TEAL,
  version: 1,
};

export const LAYOUT_COPY_SEED_PRESETS: DesignPresetFile[] = [
  SEED_RE_ORANGE_PRESET,
  SEED_LUMA_COFFEE_PRESET,
  SEED_OMKOPA_TEAL_PRESET,
];

export function getLayoutCopySeedPreset(
  id: string,
): DesignPresetFile | undefined {
  return LAYOUT_COPY_SEED_PRESETS.find((p) => p.id === id);
}
