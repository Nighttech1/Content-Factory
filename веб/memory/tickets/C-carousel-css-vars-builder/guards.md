# Guards — C-carousel-css-vars-builder

Wave: `W-2026-10-13-visual-deconstructor` · Scenario: **S44.B** (builder + artifacts)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `carouselHtmlBuilder` exported from `lib/studio/carousel-html-renderer.ts` (alias OK; no second dead renderer). |
| G2 | Frames inject `--cf-design-*` via `designPresetToCssVars` (colors + overrides) — not hardcoded hex ignoring preset. |
| G3 | Role kits: `cover` / `body_slide` / `cta_slide` (+ aliases point/proof/cta). Rhythm N≥2: first cover, last cta. |
| G4 | Preset primitives respected: marker/doodle/bridges (dark_notes), glass/gauge/CTA glow (bento_glass). |
| G5 | Safe-zone `CAROUSEL_SAFE` 120 / 160 / 80; canvas 1080×1350. |
| G6 | Sliced export `slide_NN.png`; wave copy to `generatedMedia/wave-visual-deconstructor/{presetId}/`. |
| G7 | Budget gate `reservePngBudget` / `commitPngBudget` — max **40**; stop-report at cap. |
| G8 | Artifacts for Client: `dark_notes/` (≥3) + `bento_glass/` (≤6) under wave folder; README lists files. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts
npx tsx scripts/generate-wave-visual-artifacts-pngs.ts
# Expect: SMOKE_…_OK + WAVE_VISUAL_ARTIFACTS_OK; PNG count ≤40
```

Live Client: **S44.B** — Create draw with active golden preset → N×4:5 sliced, not panorama/black.

## Class of defect

Panorama product preview; builder ignores active preset CSS vars; no role kits; budget silent overspend; missing wave artifact PNGs.
