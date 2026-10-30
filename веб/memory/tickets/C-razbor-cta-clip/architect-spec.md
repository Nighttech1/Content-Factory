# Architect spec — C-razbor-cta-clip

Wave: `W-2026-10-14-razbor-live-boards`. Priority: **P0**.

## Goal

«Разбор» CTA never clipped on bottom cards in feed columns (all modules).

## Locks

| Item | Lock |
|------|------|
| Card | `overflow-visible` on article; footer CTA fully in flow |
| Column | Extra bottom padding on scroll container (`pb-10`+) |
| Grid | No parent `overflow-hidden` that clips footer |

## Paths

`FeedPostCard.tsx`, `VerticalPostCarousel.tsx`.

## Acceptance

Scroll to last competitor cards @1440 — full «Разбор» label visible.
