# Architect spec — C-carousel-preload-slides

Wave: `W-2026-10-14-razbor-live-boards`. Priority: **P0**.

## Goal

Preload **all** slide images when Razbor/Create/feed card opens so swipe never re-fetches hang.

## Locks

| Item | Lock |
|------|------|
| Helper | `lib/image-cache.ts` — Map + `new Image()` + `decode()`; `prefetchAll` |
| Surfaces | RazborSlidesCarousel, CreateCarouselPreview, FeedPostCard (multi-slide) |
| Gate | Motion may run after decode; never block forever |

## Acceptance

Open Razbor on multi-slide post → L/R swipe instant (no blank hang).
