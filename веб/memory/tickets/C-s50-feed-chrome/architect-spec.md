# C-s50-feed-chrome — Architect spec

**Priority:** P0 · Wave S50 · CRITICAL bottom chrome

## Goal

Feed reaches near window bottom (no thick black bar clipping cards). Clean column headers. Boards dropdown+rename. Sort+filter+search on both columns.

## Locks

| ID | Lock |
|----|------|
| D-feed-bottom | Dual-feed `h≈calc(100dvh−header)`; minimal `pb-*` on workspace/scroll |
| D-no-dots | Remove accent bullets left of Наши/Конкуренты |
| D-no-45 | Module title without «(4:5)» (`carousel-engine` manifest) |
| D-boards-dd | Dropdown all boards + create + rename; no «1» on Доски |
| D-sort-filter | Sort+filter left of search; Ours gets search+sort+filter too |

## Paths

- `components/studio/StudioModuleWorkspace.tsx`
- `components/studio/workspace/VerticalPostCarousel.tsx`
- `components/studio/workspace/BoardsPanel.tsx`
- `lib/studio/boards-store.ts`
- `src/modules/carousel-engine/manifest.ts`

## Acceptance (Client S50.A)

1. @1440 last feed row near window bottom; cards not clipped by thick black band.
2. No orange dots; title without (4:5).
3. Boards dropdown works; rename/create; no count on Доски.
4. Both columns: sort+filter left of search.
