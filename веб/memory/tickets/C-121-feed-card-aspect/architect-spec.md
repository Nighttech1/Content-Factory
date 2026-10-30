# C-121 — Feed card aspect collapse (P0)

## Goal
Карточки 2-up снова **портретные** (не горизонтальные «ленты»). Root cause: `overflow-hidden` on grid item + CSS Grid `min-height:auto` → высота схлопывается.

## Locks
- D1: Grid scroll: `grid grid-cols-2 gap-2 content-start **items-start**`
- D2: `FeedPostCard` article: **never** `overflow-hidden` when it is a grid item; clip only on media (`overflow-hidden` on `.group/media`). Use `min-h-0` carefully; prefer `self-start w-full overflow-visible`
- D3: `carousel-engine` aspect **`4/5`** (title). Reels / custom-reels / CapCut: **`9/16`**
- D4: Keep 2-up all sections. No Apify.
- D5: Client Playwright: media box ratio ≈ 0.8 (4:5) or ≈ 0.56 (9:16); card height ≫ 100px at ~260px width

## Chain
Frontend → Client (Playwright)
