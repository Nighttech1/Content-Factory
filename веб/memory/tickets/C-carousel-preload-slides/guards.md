# Guards — C-carousel-preload-slides

Wave: `W-2026-10-14-razbor-live-boards` · Scenario: **S48.C** (preload)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `prefetchAll` from `lib/image-cache.ts` on FeedPostCard / RazborSlidesCarousel / CreateCarouselPreview. |
| G2 | Motion never waits on network for next slide decode. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
# Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK
```

Live Client: rapid L/R — no blank hang.

## Class of defect

Black flash on swipe; hang waiting decode; missing prefetchAll.
