# Architect spec — C-feed-plaque-metrics-s48

Wave: `W-2026-10-14-razbor-live-boards`. Priority: **P0**.

## Goal

Scale feed plaque + engagement; show followers; all 5 metrics.

## Locks

| Item | Lock |
|------|------|
| Plaque | ≈1.5× S47 (padding + font) |
| Followers | Right of plaque, white CG, format `1564к` / `12,3к` from `post.followers` (Architect: add optional field; mock seed OK) |
| Metrics | ≈2× icons+numbers; always views/likes/comments/shares/saves |

## Paths

`FeedPostCard.tsx`, `feed-types.ts`, fixtures mock followers.

## Acceptance

Plaque visibly larger; followers readable; 5 engagement icons present @1440.
