/**
 * Golden factory presets — dark_notes (bzhak3 refs) + bento_glass (uchuftu refs).
 * Stable ids: seed-dark-notes / seed-bento-glass. Do not overwrite customized user slots.
 * Companion JSON/MD fixtures live beside this file for Backend/FE seed jobs.
 */

import type { DesignPresetFile } from "@/types/design";

/** Stable seed slot ids (Architect D-vd-5). */
export const SEED_DARK_NOTES_ID = "seed-dark-notes";
export const SEED_BENTO_GLASS_ID = "seed-bento-glass";

/** Inline DESIGN.md bodies (keep in sync with seed-*.DESIGN.md fixtures). */
export const SEED_DARK_NOTES_MD = `---
name: Dark Notes
preset: dark_notes
version: 1
colors:
  bg: '#121212'
  surface: '#1A1A1A'
  text: '#FFFFFF'
  muted: '#A0A0A0'
  accent: '#F5D742'
  accentSoft: 'rgba(245, 215, 66, 0.35)'
---

# Dark Notes — chalkboard carousel system

Vernatun golden ref: charcoal notebook / chalkboard with **yellow marker** highlights, hand doodles, checklist boxes, and **seamless bridge arrows** across sliced 4:5 frames.

## Canvas & safe-zone

- Frame: **1080×1350** (4:5) — product preview = **sliced** slides, never panorama-only.
- Safe padding: top ≥120, bottom ≥160, sides ≥80.
- Background: continuous charcoal grid across the row; each PNG is still a separate cut.

## Colors

| Token | Hex / value | Use |
|-------|-------------|-----|
| bg | \`#121212\` | Chalkboard / graph-paper field |
| surface | \`#1A1A1A\` | Slight lift panels |
| text | \`#FFFFFF\` | Body + questions |
| muted | \`#A0A0A0\` | Meta, pagination \`01\` |
| accent | \`#F5D742\` | Marker tape blocks, arrows, underlines |
| accentSoft | \`rgba(245,215,66,0.35)\` | Soft glow under marker |

Text on yellow marker blocks = **inverse** (near-black).

## Typography

- **Display:** bold geometric sans, often UPPERCASE inside ragged yellow tape.
- **Body:** clean grotesque or light mono/typewriter feel for RU notes.
- **Armenian-safe:** Noto Sans Armenian (or equivalent) — never Inter-only.
- Cover hook ≤6–8 words; marker title may wrap 1–2 lines.

## Component primitives

- **markerHighlight:** solid yellow tape, slightly irregular / ragged edges.
- **doodle:** white chalk line-art (coffee steam, stars, swirls).
- **checkbox:** hand-drawn squares; empty or bold \`X\`.
- **seamlessConnector:** chunky yellow hand arrows + white swirls split across PNGs.
- **logoMark:** Vernatun pomegranate on CTA slide.

## Role kits

| Role | Duty |
|------|------|
| cover | Yellow marker hook + 1 doodle + optional empty checkboxes |
| body_slide | Numbered insight, underline accent, one checked box |
| cta_slide | Question / save instruction + pomegranate + checkbox «сохрани» |

## Do

- Keep grid faint (\`rgba(255,255,255,0.05)\`).
- Preserve cross-cut arrow continuity when frames sit in a row.
- CSS vars: \`--cf-design-bg\`, \`--cf-design-accent\`, \`--cf-design-text\`, …

## Don't

- Flat gray boxes without marker/doodle language.
- Purple glow / Inter-default stock AI look.
- Ship uncut panorama as Create preview.
- Drop Armenian glyphs or crop copy outside safe-zone.
`;

export const SEED_BENTO_GLASS_MD = `---
name: Bento Glass
preset: bento_glass
version: 1
colors:
  bg: '#0C0C0C'
  surface: 'rgba(28, 28, 30, 0.72)'
  text: '#FFFFFF'
  muted: '#A3A3A3'
  accent: '#F59E0B'
  accentSoft: 'rgba(245, 158, 11, 0.32)'
---

# Bento Glass — dark glass + telemetry carousel system

Vernatun golden ref: matte black / charcoal with **glass** cards, bento modules, **amber/gold** glow, optional timers/gauges, cinematic photo cover, solid gold CTA.

## Canvas & safe-zone

- Frame: **1080×1350** (4:5) — **sliced** product preview only.
- Safe padding: top ≥120, bottom ≥160, sides ≥80.
- Glass cards stay inside safe-zone; photo cover may bleed at edges.

## Colors

| Token | Hex / value | Use |
|-------|-------------|-----|
| bg | \`#0C0C0C\` | Matte black stage |
| surface | \`rgba(28,28,30,0.72)\` | Glass card fill |
| text | \`#FFFFFF\` | Headlines |
| muted | \`#A3A3A3\` | Labels / meta |
| accent | \`#F59E0B\` | Borders, chart line, CTA fill |
| accentSoft | \`rgba(245,158,11,0.32)\` | Outer glow |

## Typography

- **Display:** large bold geometric sans (Armenian + Latin/RU OK).
- **Body:** medium sans, generous line-height.
- **Mono:** timer / metric numerals (\`00:45:00\`).
- **Armenian-safe:** Noto Sans Armenian.
- Slide chips: small uppercase labels (\`01 / HOOK\`).

## Component primitives

- **card.glass:** \`backdrop-blur\` + 1px luminous border + ~12–16px radius.
- **gauge:** optional telemetry / line chart with amber stroke + glow.
- **buttonCta:** large amber→gold gradient button with glow («СОХРАНИТЬ РИТУАЛ»).
- **seamlessConnector:** soft amber glow bleed across adjacent cuts.
- **logoMark:** Vernatun pomegranate on final CTA.

## Role kits

| Role | Duty |
|------|------|
| cover | Photo or bold type hook; minimal glass chrome |
| body_slide | Bento glass cards / timers / comparison / chart |
| cta_slide | Manifest line + glowing gold CTA button + mark |

## Do

- Real glass (blur + thin border), not flat gray rectangles.
- Gold/amber CTA readable and glowing.
- CSS vars from active preset (\`--cf-design-*\`).

## Don't

- Yellow marker chalkboard language (that's \`dark_notes\`).
- Purple AI-slop gradients.
- Panorama-only Settings/Create preview.
- Missing cover→body→cta rhythm.
`;

export const SEED_DARK_NOTES_PRESET: DesignPresetFile = {
  id: SEED_DARK_NOTES_ID,
  preset: "dark_notes",
  name: "Dark Notes",
  designMd: SEED_DARK_NOTES_MD.trim(),
  colors: {
    bg: "#121212",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    muted: "#A0A0A0",
    accent: "#F5D742",
    accentSoft: "rgba(245, 215, 66, 0.35)",
  },
  typography: {
    display: "Geist Sans, Manrope, system-ui, sans-serif",
    body: "Geist Mono, ui-monospace, monospace",
    mono: "Geist Mono, ui-monospace, monospace",
    armenianSafe: "Noto Sans Armenian, Manrope, sans-serif",
    scale: { cover: 56, h2: 36, body: 22, caption: 16 },
  },
  components: {
    card: {
      glass: false,
      radius: "4px",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    buttonCta: { glow: false, radius: "6px" },
    markerHighlight: { color: "#F5D742", ragged: true },
    doodle: { enabled: true, ink: "#FFFFFF" },
    checkbox: { style: "hand", stroke: "#FFFFFF" },
    logoMark: "vernatun_pomegranate",
    seamlessConnector: {
      enabled: true,
      style: "arrow",
      color: "#F5D742",
    },
  },
  cssVarOverrides: {
    "--cf-design-grid": "rgba(255, 255, 255, 0.05)",
    "--cf-design-marker": "#F5D742",
    "--cf-design-inverse": "#121212",
  },
  referenceImageUrl: "assets/Gemini_Generated_Image_bzhak3bzhak3bzha",
  version: 1,
};

export const SEED_BENTO_GLASS_PRESET: DesignPresetFile = {
  id: SEED_BENTO_GLASS_ID,
  preset: "bento_glass",
  name: "Bento Glass",
  designMd: SEED_BENTO_GLASS_MD.trim(),
  colors: {
    bg: "#0C0C0C",
    surface: "#16181F",
    text: "#FFFFFF",
    muted: "#A3A3A3",
    accent: "#F59E0B",
    accentSoft: "rgba(245, 158, 11, 0.32)",
  },
  typography: {
    display: "Geist Sans, Manrope, system-ui, sans-serif",
    body: "Manrope, system-ui, sans-serif",
    mono: "Geist Mono, ui-monospace, monospace",
    armenianSafe: "Noto Sans Armenian, Manrope, sans-serif",
    scale: { cover: 52, h2: 32, body: 20, caption: 14 },
  },
  components: {
    card: {
      glass: true,
      blur: "16px",
      radius: "16px",
      border: "1px solid rgba(255,255,255,0.14)",
    },
    buttonCta: { glow: true, radius: "14px", labelWeight: 700 },
    markerHighlight: { color: "#F59E0B", ragged: false },
    doodle: { enabled: false },
    checkbox: { style: "ui", stroke: "#F59E0B" },
    gauge: { stroke: "#F59E0B", glow: true },
    logoMark: "vernatun_pomegranate",
    seamlessConnector: {
      enabled: true,
      style: "glow",
      color: "rgba(245, 158, 11, 0.45)",
    },
  },
  cssVarOverrides: {
    "--cf-design-glass-blur": "16px",
    "--cf-design-cta-glow": "0 0 28px rgba(245, 158, 11, 0.45)",
  },
  referenceImageUrl: "assets/Gemini_Generated_Image_uchuftuchuftuchu",
  version: 1,
};

export const FACTORY_SEED_PRESETS: DesignPresetFile[] = [
  SEED_DARK_NOTES_PRESET,
  SEED_BENTO_GLASS_PRESET,
];

export function getFactorySeedPreset(
  id: string,
): DesignPresetFile | undefined {
  return FACTORY_SEED_PRESETS.find((p) => p.id === id || p.preset === id);
}
