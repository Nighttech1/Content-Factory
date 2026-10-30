# C-boards-s49-upload — Architect spec

**Priority:** P0 · Wave S49

## Goal

Boards upload chrome: «Загрузить» in search row; no helper copy; board cards without engagement metrics.

## Locks

| ID | Lock |
|----|------|
| D-boards-s49 | Label **«Загрузить»**; same header row as search when Доски; remove «Локально · несколько кадров…»; `showEngagement={false}` (+ no plaque) on board cards |

## Paths

- `components/studio/workspace/VerticalPostCarousel.tsx` (header row upload when boards)
- `components/studio/workspace/BoardsPanel.tsx` (strip helper + upload from panel body; wire props)
- `components/studio/workspace/FeedPostCard.tsx` (`showEngagement` prop)
- `lib/studio/boards-store.ts` (optional: omit username/followers on board posts)

## Acceptance (Client S49.B)

1. Доски → «Загрузить» visible same row as search.
2. Helper «Локально · несколько кадров…» gone.
3. Board cards show media (+ Разбор) without engagement row / plaque.
