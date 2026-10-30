# C-s57-layered-default — guards

**Wave:** 2026-10-17-layered-html-pipeline  
**Class:** product renderMode default = layered_html (not type-on-PNG / correct_pipeline ship)

## Permanent asserts

1. `isCarouselLayeredHtmlPipeline()` true when `CAROUSEL_PIPELINE` missing or `layered_html|layered|s57|default|html`.
2. `resolveCarouselRenderMode()` → `layered_html` for product default.
3. `drawCreateCarouselSlides` / intake draw with no archaeology env → `renderMode: "layered_html"`.
4. Explicit `CAROUSEL_PIPELINE=correct` may use archaeology; must not be product default.

## Evidence

- `lib/studio/create-carousel-prompts.ts` (`isCarouselLayeredHtmlPipeline`, `resolveCarouselRenderMode`)
- `lib/studio/carousel-html-renderer.ts` (`layeredOn` primary branch)
- `lib/intake/correct-pipeline-job.ts` (`pipeline: "layered_html"`)
- Wave: `memory/waves/2026-10-17-layered-html-pipeline/guards.md` + `tester-unit.json`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-17 S57.
