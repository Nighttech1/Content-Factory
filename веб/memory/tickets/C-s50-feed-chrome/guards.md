# Guards — C-s50-feed-chrome (S50.A)

## Class of defect

Thick bottom chrome clipping feed cards; aspect suffix in title; orange header dots; Boards not a dropdown; missing sort/filter left of search; mock competitors painted as live.

## Permanent checks

1. Playwright @1440 `/studio/carousel-engine`:
   - `h1` text **does not** contain `(4:5)`.
   - Column headers **Наши** / **Конкуренты** have **no** orange/amber bullet dots.
   - Both columns: controls **Сортировка** + **Фильтр** sit **left of** search in the same toolbar row.
   - Tab **Доски** → trigger `[data-testid=boards-dropdown-trigger]` opens menu with **Создать доску**; label has **no** count badge «1».
   - Viewport bottom: no thick black dead band clipping the visible card stack (feed shell near `100dvh`).
2. Competitors column: when `IG_SCRAPER_API_KEY` set and `USE_FEED_FIXTURES` unset → **zero mock competitor cards** (empty OK).
3. Smoke: `npx tsx scripts/smoke-s50-competitors-live-vs-mock.ts --url http://127.0.0.1:3000`  
   Expect `competitors mock=0`; live>0 **or** empty WARN — never mock-only competitors.

## Evidence (2026-10-14)

- `memory/waves/W-2026-10-14-s50-client-ui-live/s50-carousel-1440.png`
- `memory/waves/W-2026-10-14-s50-client-ui-live/s50-boards-1440.png`
- Smoke: `VERDICT: WARN — scraper on, competitors empty (… not mock)`
