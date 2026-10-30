# Wave W-2026-09-19-sprint6-sdk

| Field | Value |
|-------|-------|
| **Sprint** | 6 — Module SDK + adapters + Plugin Slot (6.1–6.3) |
| **Max tickets** | 3 (+ follow-up C-22) |
| **Status** | **согласовано** |
| **Client verdict** | **согласовано** (2026-09-19) — C-19…C-22 accepted; no open P0/P1 |
| **Depends on** | Sprint 5 live `W-2026-09-19-sprint5-live` (согласовано) |
| **Chain (типовой)** | Архитектор → Backend → AI Bridge → Frontend → Тестировщик → Фиксер → Деплоер → Клиент |
| **before_sha** | N/A (no git repo in workspace) |

## Tickets

| ID | P | Folder | Scope | Result |
|----|---|--------|-------|--------|
| C-19 | P0 | `tickets/C-19-module-sdk-registry/` | 6.1 `IContentModule` + `src/modules/registry.ts` | **done** · Client **ПРИНЯТО** |
| C-20 | P0 | `tickets/C-20-module-adapters/` | 6.2 adapters Modules 1–4 | **done** · Client **ПРИНЯТО** |
| C-21 | P1 | `tickets/C-21-plugin-slot/` | 6.3 modal `[+ Register New Module]` | **done_with_remarks** · Client **ПРИНЯТО С ЗАМЕЧАНИЯМИ** → closed by **C-22** |
| C-22 | P1 | `tickets/C-22-custom-generate-hydrate/` | 6.3 follow-up: register→generate hydrate | **done** · Client **ПРИНЯТО** |

## Safety

- No `prisma migrate reset` / DROP / wipe volumes.
- Secrets (`HEYGEN_API_KEY`, LLM, DB) only `.env` — never memory/git.
- Without API keys: deterministic mock adapters so localhost works.

## Stop rule

После Deployer + Client: стоп «готов продолжить» если остались замечания; цикл до «согласовано».

## Deployer C-19

- 2026-09-19: Next.js `npm run dev` already on `:3000` (left running). Separate local API: N/A (Next-only).
- Smoke: `GET http://localhost:3000/studio` → 200.
- `npx tsx scripts/smoke-c19-registry.ts` → SMOKE_OK (4 manifests, aliases, NotImplemented:C-20).
- VPS/prod: not deployed.
- Status → `deployed_localhost`; chain Deployer Done. Ready for Client.

## Deployer C-20

- 2026-09-19: Next.js already on `:3000` (left running). Separate local API: N/A (Next-only).
- Smoke: `GET http://localhost:3000/studio` → 200.
- `npx tsx scripts/smoke-c20-adapters.ts` → SMOKE_OK (M1–M4 mock: carousel, aesthetic, cartoon, heygen without key).
- Optional: `POST http://localhost:3000/api/modules/carousel-engine/generate` `{ "topic": "Deployer C-20 smoke topic" }` → 200 `ok:true` + draftId.
- VPS/prod: not deployed.
- Status → `deployed_localhost`; chain Deployer Done. Ready for Client.

## Deployer C-21

- 2026-09-19: Next.js already on `:3000` (pid listening, left running). Separate local API: N/A (Next-only).
- Smoke: `GET http://localhost:3000/studio` → 200.
- `npx tsx scripts/smoke-c21-register.ts` → SMOKE_C21_OK (register/hydrate/mock generate; reserved reject; custom list).
- Optional recheck: `smoke-c20-adapters.ts` → SMOKE_OK; `smoke-c19-registry.ts` → FAIL (`renderAsset should throw` — stale vs C-20 mock adapters; not a C-21 blocker).
- VPS/prod: not deployed.
- Status → `deployed_localhost`; chain Deployer Done. Ready for Client.

## Deployer C-22

- 2026-09-19: Next.js on `:3000` (left running). Separate local API: N/A (Next-only).
- Smoke: `GET http://localhost:3000/studio` → **200**.
- `npx tsx scripts/smoke-c22-register-generate.ts` → `SMOKE_C22_OK`.
- Live: unique register → immediate generate → **200** mock.
- VPS/prod: **not** deployed.
- Status → `deployed_localhost`; chain Deployer Done. Ready for Client.

## Client acceptance (2026-09-19, initial wave)

| Check | Result |
|-------|--------|
| GET `/studio` 200 | **PASS** — no client `fs` crash |
| C-19: 4 canonical module ids in Studio HTML | **PASS** — `carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels` |
| C-19: Add was disabled (now C-21 enabled) | **PASS** for wave — Add enabled, opens Register modal |
| C-20: Generate API mock (carousel + heygen no key) | **PASS** — 200 `ok:true`, heygen `mock` |
| C-20: S1 drawer wiring | **PASS** (source) — `startGenerate` sets `drawerOpen` + POST `/api/modules/{id}/generate` |
| C-21: Register POST + GET persist | **PASS** — `custom-client-plugin-c21` in API + `data/local/custom-modules.json` |
| C-21: Core 4 remain | **PASS** — `listManifests` / smoke core count 4 |
| C-21: New custom Generate after Register | **FAIL** then → **C-22** |
| Playwright MCP | **gap** — not available (honest, same as Sprint 5); HTTP + smokes + UI source |

**Вердикт (initial):** ПРИНЯТО С ЗАМЕЧАНИЯМИ. DEV_PLAN **6.1–6.2** `[x]`; **6.3** open until C-22.

## Client acceptance C-22 (2026-09-19, close)

| Check | Result |
|-------|--------|
| Smoke C-22 | **PASS** — `SMOKE_C22_OK` |
| Live register unique → generate same id | **PASS** — both **200**; mock draft (`custom-c22-client-recheck-*`) |
| GET `/studio` 200 | **PASS** |
| Open P0/P1 | **none** — C-19/20/21/22 accepted |
| DEV_PLAN 6.3 | **`[x]`** |
| Playwright MCP | **gap** — HTTP/smoke only |

**Вердикт:** **согласовано** (Sprint 6). Localhost ready; VPS not requested.
