# Guards — C-audit-03 HTML/CSS-first render

Wave: `2026-10-16-carousel-audit-fix` · Spec: `architect-spec.md`

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Fixture 3-slide JSON → `runCreateCarouselDraw` returns `ok`, `renderMode: html_png`, **3** PNG paths under `public/generated/carousel/<jobId>/`. |
| G2 | With `CAROUSEL_DRAW_SKIP_BG=1` (or text-kit warrants) → `bgImageCalls === 0`, `htmlFirst === true`. |
| G3 | When image bg is used → model id = `DEFAULT_CAROUSEL_IMAGE_MODEL` / `openai/gpt-5.4-image-2`. |
| G4 | dark_notes chalk/marker kits: `slideWarrantsOptionalBg` = **false**; cinematic/photo prompts = **true**. |
| G5 | Each PNG ≥ ~12KB + valid PNG magic (not black/tiny stub). |
| G6 | Zod / handoff keys stable (`carousel-json-contract`). |

## Commands

```bash
npx tsx scripts/smoke-c-audit-03-html-first.ts
# Expect: C-audit-03 HTML-first smoke PASS
# Artifacts: public/generated/carousel/c-audit-03-smoke/slide_01..03.png
```

## Class of defect

Draw path requires live image-2 for every slide; HTML path skipped; black/tiny PNG; wrong model id on optional bg; soft-mock success without files.

## Out of scope this guard

**Full LIVE 6-PNG** wave gen (2 carousels × 3 slides into `generatedMedia/wave-carousel-audit-fix/`) — **Deployer** after green static smokes; not run by Tester in this pass.
