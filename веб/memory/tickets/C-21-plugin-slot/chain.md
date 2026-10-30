# Chain — C-21

> Оркестратор зовёт **после** Architect Done. Инженерия может стартовать после **C-19**; Client-приёмка — после **C-20** mock adapters.  
> **Запрет:** менять тела M1–M4 adapters (C-20), HeyGen secrets, `migrate reset`, remote code eval, prod publish.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `app/api/modules/register/route.ts` (если не pure-localStorage), `src/modules/custom-remote/factory.ts` (или equiv), `src/modules/registry.ts` (export register helpers only), `data/local/.gitignore` (если file persist) | [x] | 2026-09-19: hybrid JSON persist + factory + POST/GET register + boot hydrate. `data/local/.gitignore` already covers `*`. Core ids reject; worker fail → mock. |
| 2 | Frontend | `components/studio/RegisterModuleModal.tsx`, `components/studio/ModuleSelectorGrid.tsx`, `components/studio/modules.ts` / custom list hook, `lib/studio-store.ts` (custom modules + selected id), опц. `lib/custom-modules-storage.ts` | [x] | 2026-09-19: RegisterModuleModal + Add enabled; GET hydrate + localStorage `cf.customModules.v1`; store append/select custom ids. No registry/fs on client. |
| 3 | Tester | `memory/tickets/C-21-plugin-slot/guards.md` | [x] | 2026-09-19: GREEN — studio 200; POST/GET register; generate mock; Add + modal testids; core 4; anti_slop OK; no secrets. |
| 4 | Fixer | Backend + Frontend paths | [x] | skipped — Tester GREEN 2026-09-19 |
| 5 | Deployer | localhost | [x] | 2026-09-19: `:3000` left running; GET `/studio` 200; `smoke-c21-register` SMOKE_C21_OK; VPS not deployed |
| 6 | Client | приёмка C-21 (+ wave Sprint 6) | [x] | **ПРИНЯТО С ЗАМЕЧАНИЯМИ** 2026-09-19 — Add→modal wiring; Register+GET persist; core 4 OK. **P1 C-22:** generate for newly registered custom → 404. |

Порядок: **Backend → Frontend → Tester → Fixer → Deployer → Client**.  
Если Backend skipped (localStorage-only): **Frontend → Tester → Fixer → Deployer → Client**.  
Не параллелить Frontend и Backend на `registry.ts`.

Depends on: **C-19** hard; **C-20** soft start / hard Client.  
Overview: `memory/tickets/_sprint6-sdk-overview.md`
