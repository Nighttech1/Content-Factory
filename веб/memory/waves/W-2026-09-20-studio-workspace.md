# Wave W-2026-09-20-studio-workspace

| Field | Value |
|-------|-------|
| **Sprint** | Post-7 UX — Century Gothic + Studio per-module workspace |
| **Max tickets** | 3 |
| **Status** | **согласовано** |
| **Depends on** | Sprint 7 SSE `W-2026-09-20-sprint7-sse` (согласовано) |
| **Chain (типовой)** | Архитектор → (per ticket chains) → Деплоер → Клиент |
| **before_sha** | N/A |

## Tickets

| ID | P | Folder | Scope | Result |
|----|---|--------|-------|--------|
| C-26 | P1 | `tickets/C-26-century-gothic/` | Global Century Gothic UI font | **ПРИНЯТО** (deployed_localhost) |
| C-27 | P0 | `tickets/C-27-studio-module-routes/` | Remove launch idea bar; module pages; Studio sidebar submenu | **ПРИНЯТО** (deployed_localhost) |
| C-28 | P0 | `tickets/C-28-content-workspace/` | Dual carousels + idea → competitors + draft → CapCut-like editor | **ПРИНЯТО** (deployed_localhost) |

## Architect note (2026-09-20)

Specs + chains + decisions written for all three. **Execution order: C-26 → C-27 → C-28.**

- **C-26:** Frontend only — `localFont` / `@font-face` Century Gothic → `--font-ui`; keep Noto hy + JetBrains mono; Inter out. Chain: FE → Tester → Fixer → Deployer → Client.
- **C-27:** Frontend → Motion — `/studio/[moduleId]`; strip `FloatingCommandBar` + drawer from launch; ModuleSelectorGrid `Link`; Sidebar Studio children. Keep `/studio/inspect/[id]`. Thin module shell OK.
- **C-28:** Backend (mock feed) → Frontend (workspace + CapCut route) → Motion — `GET /api/studio/[moduleId]/feed?topic=` → `{ ours, competitors }`; editor `/studio/[moduleId]/edit/[draftId]`; reuse generate/SSE; **no DB wipe / migrate**.

Risks: webfont license/local-only on CI; E2E that expect `command-input` on launch must move to module page; CapCut scope creep (shell only); `inspect` vs `[moduleId]` segment collision.

## Safety

- No DB wipe / migrate reset / Redis wipe / generatedMedia delete.
- Secrets only `.env`.
- Mock competitors OK without live social APIs.
- No force-publish without HITL.

## Deployer notes (C-28)

- Localhost `:3000` already serving; no restart required (Tester made no app code changes).
- `BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c28-feed.ts` → `SMOKE_C28_OK` (fixtures + live).
- HTTP 200: `/studio`, `/studio/carousel-engine`, `/studio/carousel-engine/edit/draft-demo`, feed API (+ topic).
- C-27 regress: launch without `command-input`.
- **No VPS.** Status: `deployed_localhost`.

## Client notes (C-28 + wave close)

- C-26, C-27, C-28 — все **ПРИНЯТО**; открытых P0/P1 нет.
- DEV_PLAN: спринты 1–7 закрыты в чеклисте; **Post-7 UX** (Century Gothic + Studio workspace) зафиксирован этой волной, отдельной секции в DEV_PLAN нет — учтено здесь в overview.
- Playwright MCP полный S1–S5 на module workspace в этом проходе не гонялся (honest gap); AC закрыты smoke/HTTP/source + live routes.
- Волна: **согласовано**.

## Stop rule

После Deployer + Client: стоп «готов продолжить» если остались замечания; цикл до «согласовано».
