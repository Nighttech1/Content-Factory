# C-s57-secondary-bg-vision — guards

**Wave:** 2026-10-17-layered-html-pipeline  
**Class:** secondary_copy required · bg ban logo/text · vision OFF on layered

## Permanent asserts

1. Zod: every slide `secondary_copy` non-empty (`z.string().min(1)` + belt reject).
2. Bg helpers export and enforce HARD ban NO TEXT / NO LOGO(S):
   - `BACKGROUND_ONLY_HARD_BAN`
   - `appendBackgroundOnlyGuard` / `sanitizeBackgroundImagePrompt` / `assertBackgroundOnlyPrompt`
   - `buildLayeredBackgroundImagePrompt`
3. Layered draw: vision/OCR text-check **OFF**; `needsReview` never set from vision on layered path.
4. CTA 1–4 = HTML on cta slide; `swipe_trigger` never painted.

## Evidence

- `lib/studio/carousel-json-contract.ts`
- `lib/studio/create-carousel-prompts.ts` (ban helpers)
- `lib/studio/carousel-html-renderer.ts` (`vision=OFF`, `needsReview: false`)
- `lib/studio/carousel-critic-05.ts`
- Wave `tester-unit.json` + `guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-17 S57.
