# Architect spec — C-120 (feed 2-up density)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**

## Goal

Во всех Studio feed-секциях на `VerticalPostCarousel` (Наши + Конкуренты, любой модуль; вкладка Drafts при том же chrome) карточки ~**2× меньше** за счёт **ровно 2 в ряд** внутри каждой колонки. Метрики и username остаются читаемыми под медиа. **Без Apify.**

## Supersedes

**C-118** single-column stack (`flex flex-col`) — **superseded for layout density only**. Live badge / metrics readability / dual workspace Наши|Конкуренты остаются.

## Root cause (locked)

`VerticalPostCarousel.tsx` published scroll (~L403–406): `layout=stack` → `flex flex-col gap-3` (C-118); `layout=grid` → `grid-cols-3`. Нужен единый **2-up** для всех аспектов и модулей.

## ID lock

| ID | Scope |
|----|--------|
| **C-120** | FE: always 2-up inside carousel scroll + Drafts parity; compact readable metrics |

## Decision locks

| Lock | Decision |
|------|----------|
| **D1** | Inside `VerticalPostCarousel` **published** scroll when `layout=stack`: `grid grid-cols-2 gap-2 content-start` (or `gap-3`) — **always 2-up**, all aspects (`9/16` and `4/5`), all modules. **NOT** single `flex-col`. |
| **D2** | Dual workspace Наши\|Конкуренты `lg:grid-cols-2` on `workspace-dual-carousels` — **unchanged**. |
| **D3** | If `layout=grid` was `grid-cols-3` → change to **`grid-cols-2`** for consistency («all sections»). |
| **D4** | `DraftsPanel` same 2-up when rendered inside carousel (`showDraftsBody` / drafts list) — stack → `grid-cols-2`; grid → `grid-cols-2` (no `grid-cols-3`). |
| **D5** | Metrics / `@username` remain visible under media (compact OK, **not clipped**). Live badge / live usernames still required for «не mock». |
| **D6** | Client **Playwright mandatory** @1440. **No Apify** scrape / cache bust / Backend data path. |

## In scope — Frontend

Paths (path lock — UI density only):

- `components/studio/workspace/VerticalPostCarousel.tsx` — published scroll: stack → `grid grid-cols-2 gap-2|3 content-start`; grid → `grid-cols-2` (was 3). Skeletons in 2-up cells if needed for parity.
- `components/studio/workspace/DraftsPanel.tsx` — drafts list: same 2-up rules (D4).
- `components/studio/workspace/FeedPostCard.tsx` — only if compact 2-up clips metrics/username; keep chrome readable (D5). Prefer surgical typography/spacing; no aspect revert.

Optional parity check: any other list wrapper that duplicates carousel chrome for the same modules — align to 2-up; primary surfaces are `VerticalPostCarousel` + `DraftsPanel`.

## Out of scope

- Apify / `ig-apify-scraper` / Redis-Postgres feed data
- Backend, Motion redesign, Mesh, Schedule, Settings
- Changing dual workspace columns (D2)
- Prod/VPS deploy

## Acceptance (Client language)

1. **Two cards per row everywhere:** In Наши and Конкуренты (and Drafts tab of the same chrome), visible feed cards sit in a **2-column** grid inside each carousel — not a single-column stack and not 3-up.
2. **Dual workspace intact:** Side-by-side Наши | Конкуренты on desktop (`lg`) still two workspace columns.
3. **Readable under-media chrome:** On Playwright @1440, `@username` and metrics stay visible (compact OK, not clipped); no new Apify run.

## Skills

`content-factory-ui`, `client-scenarios`, `client-review`, `tester`.

## Non-goals for Fixer

No architecture / data-path change; surgical CSS/layout only if Tester red.
