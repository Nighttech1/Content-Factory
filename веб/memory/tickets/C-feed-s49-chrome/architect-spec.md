# C-feed-s49-chrome — Architect spec

**Priority:** P0 · Wave S49 · `ticket_limit: default≤3`

## Goal

Competitors feed chrome: single plaque `username | followers`, Ours without plaque, Published/Drafts-style toggle for Конкуренты|Доски with search same row, white tab labels, minimal bottom gap.

## Locks

| ID | Lock |
|----|------|
| D-plaque-s49 | One black plaque; followers **inside** after `\|` as RU `Nк` |
| D-ours-no-plaque | `source === "ours"` → no plaque row |
| D-toggle-s49 | Segment toggle (not MultiButton); search right same row |
| D-labels-white | Опубликовано / Черновики / count = white |
| D-feed-clip | Reduce `pb-12` / page `pb-16` under feed |

## Paths

- `components/studio/workspace/FeedPostCard.tsx`
- `components/studio/workspace/VerticalPostCarousel.tsx`
- `components/studio/StudioModuleWorkspace.tsx` (bottom padding)
- `lib/studio/format-followers-ru.ts` (unchanged API; plaque string concat in FE)
- Backend (same wave): map `followers` on Apify/Graph posts when present

## Acceptance (Client S49.A)

1. Competitor card plaque reads like `@name | 1564к` (single chip).
2. Ours cards have zero username/followers chrome.
3. Top: Конкуренты|Доски simple toggle + search same row (no MultiButton).
4. Опубликовано / Черновики / count text white on snapshot.
5. Minimal empty band under last feed row @1440.
