# Architect spec — C-118 (feed stack sizes) + C-119 (Playwright re-accept)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> Wave retry2: `memory/waves/W-2026-10-09-ig-scraper-live.md`.  
> **No product code in this ticket from Architect.**

## Goal

На `/studio/carousel-engine` карточки в колонках **Наши** / **Конкуренты** снова читаются как живой фид: одна карточка на ширину колонки (не tiny 2-up), метрики и username видны под медиа. Данные уже live из Apify-кэша/API — **не** перезапрашивать Apify.

## Complaint (user screenshot)

- Внутри каждой колонки карточки в 2 колонки (`lg:grid-cols-2`) → слишком мелкие.
- Метрики нечитаемы → выглядит как mock, хотя API уже отдаёт live.

## Root cause (locked)

`VerticalPostCarousel.tsx` (~L406–408): для `aspectRatio === "9/16"` stack стоит  
`grid … lg:grid-cols-2` (**C-73**). Это ломает intent **C-64** (single-column 9/16 stack).  
Dual-колонка workspace (`workspace-dual-carousels` `lg:grid-cols-2` = Наши|Конкуренты) — **оставить**.

## ID lock

| ID | Scope |
|----|--------|
| **C-118** | FE: restore single-column stack + readable metrics under media |
| **C-119** | Client: Playwright-only re-acceptance @1440 (HARD GATE) |

Former wave C-114…C-117 **data path closed**; this retry is **UI density + Client gate** only.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1** | Inside each `VerticalPostCarousel` for **stack + 9/16**: restore **single-column** vertical list — `flex flex-col gap-3`. **REMOVE** `lg:grid-cols-2` 2-up. Dual columns Наши\|Конкуренты stay (`lg:grid-cols-2` on `workspace-dual-carousels` only). |
| **D2** | `FeedPostCard` metrics (views / likes / comments) clearly visible under media in stack mode — no clipping; readable **≥11px** (already the stack token). Username visible. |
| **D3** | Aspect: **keep 9/16** (C-64). Title/brand may say 4:5 elsewhere — **do not** revert carousel-engine stack to 4/5. Fix density only. |
| **D4** | **No Apify re-fetch.** Use existing live cache/API. Page size 12 OK (show 12 of 21) — cards must look live (username + metrics). |
| **D5** | **C-119** Client MUST be Playwright-only (Trainer HARD GATE). No API-only / curl / “Backend said live” acceptance. |

## In scope

### C-118 — Frontend

Paths (path lock — do not touch Backend/Apify):

- `components/studio/workspace/VerticalPostCarousel.tsx` — stack+9/16 list class → `flex flex-col gap-3`; remove C-73 `lg:grid-cols-2` branch for this case.
- `components/studio/workspace/FeedPostCard.tsx` — ensure stack layout: metrics row + `@username` not clipped by overflow/aspect; keep `text-[11px]` (or larger) in stack; grid mode may stay denser.
- `components/studio/StudioModuleWorkspace.tsx` — only if needed to confirm `feedAspect=9/16` + `layout=stack` for `carousel-engine`; **do not** change dual-carousel grid.

Optional: same single-column rule for any other module that uses stack+9/16 the same way (e.g. custom-reels) — **prefer parity**, but acceptance primary surface is **carousel-engine**.

### C-119 — Client

- Playwright MCP @1440: `navigate` `/studio/carousel-engine` → snapshot/screenshot.
- Click/scroll scenario from `client-scenarios` (live competitors): prove **Онлайн** badge **and/or** live usernames + readable metrics on visible cards.
- Verdict invalid without Playwright.

## Out of scope

- New Apify scrape / actor run / cache bust / changing scraper limit
- Backend `ig-apify-scraper`, `ig-live-feed`, Redis/Postgres resets
- Motion redesign, Mesh, Schedule, Settings
- Reverting aspect to 4/5
- Prod/VPS deploy

## Acceptance (Client language)

1. **Single column per feed:** In each of Наши and Конкуренты, cards stack vertically one-wide (no 2-up mosaic inside a column); dual Наши|Конкуренты columns remain.
2. **Readable live chrome:** On visible cards, `@username` and metrics (views/likes/comments) are clearly readable under the media (≥11px, not clipped).
3. **Looks live, not mock:** Badge **Онлайн** and/or real usernames+metrics visible on Playwright snapshot @1440; no new Apify scrape required.

## Skills

`content-factory-ui`, `client-scenarios` (live competitors / S*), `client-review`, `tester`, `deployer`.

## Non-goals for Fixer

No architecture change; no Apify calls; surgical CSS/layout only if Tester red.
