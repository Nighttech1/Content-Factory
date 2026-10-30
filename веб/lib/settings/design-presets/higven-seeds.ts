/**
 * Wave 2026-10-18 pipeline-practice-higven-3 — DesignPreset seeds.
 * 01 HIGVEN (ACTIVE) · 02 SUA (inactive library OK).
 * Seed via `scripts/seed-pipeline-practice-higven-3.ts`.
 */

import type { DesignPresetFile, LayoutMap, LayoutMapNumbering } from "@/types/design";

const ETALON_DIR =
  "generatedMedia/эталон карусели/pipeline-practice-2026-10-18";

export const SEED_HIGVEN_01_ID = "seed-higven-01";
export const SEED_SUA_02_ID = "seed-sua-02";

export const HIGVEN_PACK_ID = "higven_01";
export const HIGVEN_GRID_FILE = "01-higven-heavy-lifting-grid.png";
export const SUA_GRID_FILE = "02-sua-logo-moto-grid.png";

function omitNumbering(): LayoutMapNumbering {
  return { present: false, format: "omit", slot: "absent" };
}

/**
 * 01 HIGVEN — industrial dark / safety orange; left type.
 * Logo locks (wave attempt-3): cover+cta TOP-LEFT · body BOTTOM-LEFT
 * (type clear-zone under top logo is composite CSS — never overlap primary).
 */
export const LAYOUT_MAP_HIGVEN: LayoutMap = {
  numberingGlobal: "absent",
  grammarNote:
    "Industrial dark plates + safety-orange accents; bold left hierarchy; logo cover+cta top-left / body bottom-left; CTA bottom orange bar; desaturated machinery photo zones; no slide-number chips",
  slides: [
    {
      role: "cover",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "top-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
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

/** 02 SUA — red/black moto (inactive library). */
export const LAYOUT_MAP_SUA: LayoutMap = {
  numberingGlobal: "absent",
  grammarNote:
    "Auto/moto red-black-white; logo bottom-left; bold short headlines",
  slides: [
    {
      role: "cover",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "body_slide",
      textAnchor: { x: "left", y: "middle" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: false, slot: "absent" },
    },
    {
      role: "cta_slide",
      textAnchor: { x: "left", y: "top" },
      numbering: omitNumbering(),
      logoChrome: { present: true, slot: "bottom-left" },
      ctaChrome: { present: true, slot: "bottom" },
    },
  ],
};

export const SEED_HIGVEN_01_MD = `---
name: HIGVEN Industrial
preset: bold_poster
version: 1
colors:
  bg: '#0B0B0B'
  surface: '#FFFFFF'
  text: '#FFFFFF'
  muted: '#1A1A1A'
  accent: '#F58220'
  accentSoft: 'rgba(245, 130, 32, 0.35)'
---

# HIGVEN Industrial — heavy lifting grid (pipeline-practice 01)

Etalon: \`${ETALON_DIR}/${HIGVEN_GRID_FILE}\`

## Canvas
- 1080×1350 · safe top≥120 bottom≥160 sides≥80
- Style SoT = **vision_ref** image (not this token table)

## Colors
| Token | Hex | Use |
|-------|-----|-----|
| bg | \`#0B0B0B\` | Dark industrial field |
| surface | \`#FFFFFF\` | White plate / framed box |
| text | \`#FFFFFF\` | Type on dark |
| muted | \`#1A1A1A\` | Type on white |
| accent | \`#F58220\` | Safety orange keywords / CTA bar |

## Layout grammar (HARD)
- **numberingGlobal: absent**
- Logo chrome: cover + cta **top-left**; body **bottom-left** (type clears under top logo)
- CTA chrome: **bottom** orange bar on cta_slide
- Text: bold left hierarchy; orange accent words; high-contrast white on dark

## Don't
- Girl / conductor · purple slop · RE-orange stock plates · inventing parallel layout markup
`;

export const SEED_SUA_02_MD = `---
name: SUA Moto
preset: bold_poster
version: 1
colors:
  bg: '#111111'
  surface: '#FFFFFF'
  text: '#FFFFFF'
  muted: '#1A1A1A'
  accent: '#E10600'
  accentSoft: 'rgba(225, 6, 0, 0.35)'
---

# SUA Moto — inactive library (pipeline-practice 02)

Etalon: \`${ETALON_DIR}/${SUA_GRID_FILE}\`

Inactive library only — do **not** activate for HIGVEN-3 smoke.
`;

export const SEED_HIGVEN_01_PRESET: DesignPresetFile = {
  id: SEED_HIGVEN_01_ID,
  preset: "bold_poster",
  name: "HIGVEN Industrial",
  designMd: SEED_HIGVEN_01_MD.trim(),
  colors: {
    bg: "#0B0B0B",
    surface: "#FFFFFF",
    text: "#FFFFFF",
    muted: "#1A1A1A",
    accent: "#F58220",
    accentSoft: "rgba(245, 130, 32, 0.35)",
  },
  typography: {
    display: "Montserrat, Geist Sans, system-ui, sans-serif",
    body: "Montserrat, system-ui, sans-serif",
    armenianSafe: "Noto Sans Armenian, Montserrat, sans-serif",
    scale: { cover: 52, h2: 34, body: 20, caption: 14 },
  },
  components: {
    card: { glass: false, radius: "4px", border: "none" },
    buttonCta: { glow: false, radius: "4px", labelWeight: 700 },
    logoMark: "none",
  },
  cssVarOverrides: {
    "--cf-design-accent": "#F58220",
  },
  referenceImageUrl: `${ETALON_DIR}/${HIGVEN_GRID_FILE}`,
  layoutMap: LAYOUT_MAP_HIGVEN,
  version: 1,
};

export const SEED_SUA_02_PRESET: DesignPresetFile = {
  id: SEED_SUA_02_ID,
  preset: "bold_poster",
  name: "SUA Moto",
  designMd: SEED_SUA_02_MD.trim(),
  colors: {
    bg: "#111111",
    surface: "#FFFFFF",
    text: "#FFFFFF",
    muted: "#1A1A1A",
    accent: "#E10600",
    accentSoft: "rgba(225, 6, 0, 0.35)",
  },
  typography: {
    display: "Montserrat, Geist Sans, system-ui, sans-serif",
    body: "Montserrat, system-ui, sans-serif",
    armenianSafe: "Noto Sans Armenian, Montserrat, sans-serif",
    scale: { cover: 48, h2: 32, body: 20, caption: 14 },
  },
  components: {
    card: { glass: false, radius: "4px", border: "none" },
    buttonCta: { glow: false, radius: "4px", labelWeight: 700 },
    logoMark: "none",
  },
  referenceImageUrl: `${ETALON_DIR}/${SUA_GRID_FILE}`,
  layoutMap: LAYOUT_MAP_SUA,
  version: 1,
};

export const HIGVEN_SEED_PRESETS: DesignPresetFile[] = [
  SEED_HIGVEN_01_PRESET,
  SEED_SUA_02_PRESET,
];

export function getHigvenSeedPreset(
  id: string,
): DesignPresetFile | undefined {
  return HIGVEN_SEED_PRESETS.find((p) => p.id === id);
}
