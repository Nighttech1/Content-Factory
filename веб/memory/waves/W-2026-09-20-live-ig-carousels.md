# Wave W-2026-09-20-live-ig-carousels

| Field | Value |
|-------|-------|
| **Focus** | Live Instagram carousels: ours (`mosarmclub`) + competitors with real metrics |
| **Max tickets** | 3 |
| **Status** | client-done |
| **Client verdict** | **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (2026-09-20) |
| **Depends on** | W-2026-09-20-carousel-razbor (согласовано), C-17 IG adapter stubs |
| **Ticket order** | C-35 → C-36 → C-37 |
| **before_sha** | N/A (workspace) |

## Tickets

| ID | P | Folder | Scope | Result |
|----|---|--------|-------|--------|
| C-35 | P0 | `tickets/C-35-ig-agents-upgrade/` | Upgrade Researcher + Analyst (+ skill) for live IG discovery / real metrics in Razbor | **client: ПРИНЯТО С ЗАМЕЧАНИЯМИ** |
| C-36 | P0 | `tickets/C-36-ig-live-feed-backend/` | Graph API + Business Discovery → feed API; ours + competitors; cache + mock fallback | **client: ПРИНЯТО С ЗАМЕЧАНИЯМИ** |
| C-37 | P0 | `tickets/C-37-ig-live-feed-ui/` | Studio dual carousels + Razbor slides/metrics from live feed | **client: ПРИНЯТО С ЗАМЕЧАНИЯМИ** |

## Safety

- No DB wipe / migrate reset / Redis wipe / generatedMedia delete.
- Secrets only in `.env` (never skills/memory/git).
- No scraping Instagram HTML; official Graph API + Business Discovery only.
- No force publish to social networks.

## Blockers for live path (product owner)

- Supply IG token (`INSTAGRAM_ACCESS_TOKEN` / `INSTAGRAM_GRAPH_TOKEN` / `IG_ACCESS_TOKEN`) + `IG_USER_ID` for `mosarmclub`.
- Fill `IG_COMPETITOR_USERNAMES` with real competitor handles (empty OK → live ours only).
- Without these, Studio stays on mock (`sourceMode: "mock"`) — still acceptable for soft-fail.

## Architect

All three tickets **specced** (2026-09-20). Order: C-35 → C-36 → C-37. No Prisma this wave.

## Deployer (2026-09-20)

- URL: `http://127.0.0.1:3000`
- Smoke: `/` 200 · `/studio/carousel-engine` 200 · `/api/studio/carousel-engine/feed` 200
- Feed `sourceMode`: **mock** (empty IG tokens — expected / OK)
- Restart: **none** — reused existing healthy `npm run dev`
- Safety: no DB/Redis/media wipe; no VPS/prod
- Chains: Deployer `[x]` on C-35, C-36, C-37 → ready for Client

## Client (2026-09-20)

**Вердикт:** ПРИНЯТО С ЗАМЕЧАНИЯМИ

**Проверено:**
- Guards C-35 / C-36 / C-37 — GREEN; regression-guards mirrored.
- Smoke: `smoke-c35`, `smoke-c36` (LIVE_SKIP), `smoke-c37`, `smoke-c30` (+ HTTP OK with BASE_URL).
- HTTP: `/studio/carousel-engine` 200; feed 200 `sourceMode:mock` (ours/competitors + metrics); Razbor analyze/script 200.
- Code-contract UI: dual columns, badge «Демо-данные», кнопка «Разбор» (C-30 не сломан).

**Ограничение сессии:** Playwright MCP недоступен — нет кликового snapshot UI; приёмка mock-пути по HTTP + smoke + исходникам.

**Новые C-*:** не выписаны (P0/P1 mock UX не найдены).

**Замечание (действие пользователя):** для полной приёмки live — заполнить в `.env` токен + `IG_USER_ID` (+ опционально `IG_COMPETITOR_USERNAMES`), перезапустить dev, повторная приёмка с бейджем «Онлайн · Instagram».

**Prod:** не согласовывать при непроверенном live-пути.
