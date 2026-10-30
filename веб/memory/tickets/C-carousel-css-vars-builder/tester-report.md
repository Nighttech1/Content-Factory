# Tester report — C-carousel-css-vars-builder

**Role:** Тестировщик (+ Deployer artifacts)  
**Wave:** `W-2026-10-13-visual-deconstructor`  
**Date:** 2026-10-13  
**Verdict:** **PASS** (static + unit + wave PNG artifacts). Live Create draw **S44.B** → Client.

## What ran

```bash
npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts
# → SMOKE_W_2026_10_13_VISUAL_DECONSTRUCTOR_OK

npx tsx scripts/generate-wave-visual-artifacts-pngs.ts
# → WAVE_VISUAL_ARTIFACTS_OK
# Budget: 9/40 · PNG on disk: 9
```

## Covered

| Guard | Result |
|-------|--------|
| G1 carouselHtmlBuilder export | PASS |
| G2 CSS vars from preset | PASS (unit) |
| G3 role kits cover/body/cta | PASS (unit) |
| G4 primitives marker/glass/doodle | PASS (static + visual spot-check PNGs) |
| G5 safe-zone 120/160/80 | PASS |
| G6 wave artifact copy path | PASS (direct write via generator) |
| G7 budget ≤40 | PASS (9/40) |
| G8 dark_notes×3 + bento_glass×6 | PASS |

## Artifact folder

**Path:** `generatedMedia/wave-visual-deconstructor/`  
**PNG count:** **9**

| Preset | Files |
|--------|-------|
| `dark_notes/` | `slide_01.png` … `slide_03.png` (Coffee Doctrine) |
| `bento_glass/` | `slide_01.png` … `slide_06.png` |

README: `generatedMedia/wave-visual-deconstructor/README.md`  
Budget file: `_png_budget.json` → `count: 9`, `max: 40`

Mode: pure HTML kits + Playwright screenshot (seed CSS, Vernatun sample copy). No picsum.

## Fixer backlog (non-blocking polish)

1. **CTA pill copy** — `cta_slide` puts truncated `secondary` into `.cta-pill`, duplicating body and cutting mid-phrase (`bento_glass/slide_06`). Prefer short CTA label field / `captionLine`.
2. **Dual `normalizeCarouselSlideRole`** — `types/design.ts` vs `lib/studio/carousel-html-renderer.ts` (renderer has more aliases). Diverge risk → single source.
3. **Cover glass** — bento cover kit still marker-centered; glass card mainly on body slides (OK for smoke; Client may want cover glass too).
