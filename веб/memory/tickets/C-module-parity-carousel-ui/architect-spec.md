# Architect spec — C-module-parity-carousel-ui

Wave: `W-2026-10-14-razbor-live-boards`. Priority: **P0**.

## Goal

S48 feed + Razbor chrome patterns on **all** studio modules via shared components (not carousel-only forks).

## Locks

| Item | Lock |
|------|------|
| Shared | `FeedPostCard`, `VerticalPostCarousel`, `RazborModal`, preload, motion |
| Modules | carousel-engine, aesthetic-graphics, cartoon-reels, heygen-reels, custom-* |
| No fork | Do not create module-specific plaque/metrics clones |

## Acceptance

Open custom-reels / non-carousel module → same plaque scale, metrics, Разбор visible, Boards if competitors column present.
