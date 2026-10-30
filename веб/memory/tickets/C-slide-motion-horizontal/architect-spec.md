# Architect spec — C-slide-motion-horizontal

Wave: `W-2026-10-14-razbor-live-boards`. Priority: **P1**. Role: **Motion**.

## Goal

Expensive horizontal L/R slide change (extends C-131; no black flash).

## Locks

| Item | Lock |
|------|------|
| Motion | enter from ±8–16% X + light opacity; exit opposite; 280–420ms ease-out/spring |
| Surfaces | `RazborSlidesCarousel`, `CreateCarouselPreview`, `FeedPostCard` carousel |
| A11y | `prefers-reduced-motion` → instant cut |
| Preload | Depends on C-carousel-preload-slides |

## Acceptance

Visible L/R travel on swipe; no hang; no fade-to-black.
