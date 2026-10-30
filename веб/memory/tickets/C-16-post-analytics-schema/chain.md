# Chain — C-16

> Оркестратор зовёт **после** Architect Done.  
> **Запрет:** cron/adapters (C-17), analyst LLM/FE (C-18), UI mocks, `migrate reset`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `prisma/schema.prisma`, `prisma/migrations/**` (additive), `prisma/seed.ts` or `scripts/seed-analytics-fixtures.ts`, `lib/db/prisma.ts`, `lib/db/analytics-repository.ts`, `lib/db/analytics-fallback.ts` (or colocated), `.env.example`, `package.json` (+ lock), `data/local/.gitignore` | [x] | Skills: `prisma-content-schema`, `safe-db-migrations`, `backend`. Provider=postgresql. Fallback JSON/in-memory if no DATABASE_URL. Seed fixtures. Done 2026-09-19: schema+migration SQL shipped; localhost uses `analytics-store=fallback` (no Postgres). |
| 2 | Tester | `memory/tickets/C-16-post-analytics-schema/guards.md` | [x] | Schema fields match ARCHITECTURE §6; fallback smoke; no secrets in git; no reset scripts. GREEN 2026-09-19: `scripts/sprint5-live-guards.mjs` + anti_slop OK. |
| 3 | Fixer | Backend paths выше (если красное) | [ ] | архитектуру не менять |
| 4 | Deployer | localhost | [x] | 2026-09-19: Next `:3000` up; `db:seed` fallback OK; `/analytics` 200; guards GREEN; не VPS |
| 5 | Client | приёмка C-16 | [x] | ПРИНЯТО 2026-09-19 — schema+fallback+guards GREEN; Playwright MCP gap → HTTP/wiring |

Порядок: **Backend → Tester → Fixer → Deployer → Client**.

Depends on: UI wave C-13…C-15 done (не блокирует schema).  
Blocks: C-17, C-18.  
Overview: `memory/tickets/_sprint5-live-overview.md`
