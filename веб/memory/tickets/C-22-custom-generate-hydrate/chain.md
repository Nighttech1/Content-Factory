# Chain — C-22

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `src/modules/registry.ts`, `lib/modules/run-module.ts`, `app/api/modules/register/route.ts` (touch if needed) | [x] | globalThis singleton + force re-hydrate on custom miss; smoke-c22 OK |
| 2 | Tester | `memory/tickets/C-22-custom-generate-hydrate/guards.md` | [x] | register→generate same id 200; SMOKE_C22_OK; live HTTP GREEN |
| 3 | Fixer | above if red | [x] | skipped — Tester GREEN |
| 4 | Deployer | localhost | [x] | `/studio` 200; `deployed_localhost`; Next left on `:3000` |
| 5 | Client | приёмка C-22 + close 6.3 | [x] | C-22 closed; DEV_PLAN 6.3 `[x]`; Sprint 6 согласовано |

Порядок: **Backend → Tester → Fixer → Deployer → Client**.
