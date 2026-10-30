# Backend report — 2026-10-18 layout-copy-dual-char

**Role:** Backend (step 3)  
**Date:** 2026-10-18  
**Tickets:** C-seed-designs-landscapes · C-grid-layout-map · C-numbering-mirror · C-sw-secondary-wide (zod/critic) · C-dual-char-smoke

## Done

### 1. Seed 3 Design presets + activate 01
- Hand-crafted presets with `layoutMap` (`numberingGlobal: "absent"`):
  - `seed-layout-re-orange-01` (ACTIVE)
  - `seed-layout-luma-coffee-02`
  - `seed-layout-omkopa-teal-03`
- Module: `lib/settings/design-presets/layout-copy-seeds.ts`
- Script: `npx tsx scripts/seed-layout-copy-dual-char.ts`
- Persist: Sprint8 fallback design-slots + `data/local/design-active.json` (RE Orange + layoutMap)

### 2. Landscapes conductor «Ануш»
- Sheet `04-vernatun-girl-character-sheet.jpg` → `public/characters/anush-sheet.jpg`
- Landscapes #1 name **Ануш**, `photoUrls: ["/characters/anush-sheet.jpg"]`

### 3. Deconstruct 4-up persist
- `lib/studio/deconstruct-style.ts` — multi-image + `gridMode` → layoutMap instruction
- `app/api/settings/design-deconstruct/route.ts` — accepts `images` / cover·midA·midB·cta / `imagesBase64[]`

### 4. Composite numbering + chrome mirror
- `carousel-layered-composite.ts`:
  - `shouldShowSlideNumber` — omit `.slide-num` when `numberingGlobal: absent`
  - logo/CTA from `layoutMap` chrome when present
  - dual `characterPaint`: `in_image`/`none` → no HTML cutout; `overlay_cutout` → cover+last mandatory

### 5. Dual paint draw path
- `runCreateCarouselDraw` + `runCorrectPipelineGenerate` accept `characterPaint` / `forceHero` / `generateCutoutPoses`
- `in_image`: bg prompt includes conductor; no HTML cutout
- `overlay_cutout`: bg without girl; HTML cutout cover+last (sheet photo; pose gen via `SMOKE_GEN_CUTOUT_POSES=1`)
- Designer Variant A pack receives `layoutMap` + `characterPaint`

### 6. Critic / secondary_copy_wide
- `carousel-critic-05.ts`: body bar **≥220 chars AND ≥5 clauses** (or ≥4 paras / dense ≥45 words)
- Soft clause counting for dense RU blobs
- User message HARD reminder in Scriptwriter intake

### 7. Dual smoke GREEN
| Arm | Path | Row | Topic | Dir | PNG | Notes |
|-----|------|-----|-------|-----|-----|-------|
| **A** | `in_image` | **17** | Армянская кухня… | `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/` | **6** | no `.slide-num`; no HTML cutout |
| **B** | `overlay_cutout` | **13** | удалёнка | `docs/карусель тест/layout-copy-dual-char-smoke-B-overlay/` | **6** | no `.slide-num`; cutout on 01+06 |

Both: active design RE Orange 01 · hero Ануш #1 · timeline.md + README + meta.json

### Unit
`npx tsx scripts/verify-layout-copy-composite-unit.ts` → OK

## How to re-run
```bash
npx tsx scripts/seed-layout-copy-dual-char.ts
npx tsx scripts/smoke-layout-copy-dual-char.ts
# or SMOKE_ARM=A|B
```

## Risks / notes
- Postgres unreachable locally → Sprint8 **fallback** JSON SoT (expected).
- PNG budget honors raised `max` in `_png_budget.json` (≥ factory 40).
- Smoke freed prior `smoke_design_*` filler slots to stay under library cap 10.
- Secrets not logged.

## Fixer follow-up (overlay cutout)
- Bug: smoke B pasted whole 6-pose sheet as HTML cutout.
- Fix: single-pose gen (sheet = style ref) + cell-crop fallback; never whole sheet. See `fixer-note.md`.
- Smoke B **01+06** re-composited via `scripts/fix-smoke-b-overlay-cutout.ts` (`image_ref_generations`). Smoke A untouched.

## Files touched (Backend)
- `lib/settings/design-presets/layout-copy-seeds.ts` (new)
- `scripts/seed-layout-copy-dual-char.ts` (new)
- `scripts/smoke-layout-copy-dual-char.ts` (new)
- `scripts/verify-layout-copy-composite-unit.ts` (new)
- `lib/studio/deconstruct-style.ts`
- `app/api/settings/design-deconstruct/route.ts`
- `lib/studio/carousel-layered-composite.ts`
- `lib/studio/carousel-html-renderer.ts`
- `lib/studio/designer-variant-a-pack.ts`
- `lib/intake/correct-pipeline-job.ts`
- `lib/studio/carousel-critic-05.ts`
- `lib/studio/carousel-json-contract.ts` (`characterPaint` / `layoutMapSource` / `assertCarouselSecondaryCopyWide`)
- `lib/studio/wave-visual-artifacts.ts` (honor file max)

```
🔌 BACKEND: seeds 01–03+Ануш · layoutMap persist · numbering omit · dual paint · critic ≥220 · smoke A17/B13 ×6 GREEN
Next: Tester (G1–G12)
```
