# Chain — C-17

> Оркестратор зовёт **только после Backend Done C-16**.  
> **Запрет:** трогать UI InsightsFeed; Analyst LLM; `migrate reset`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/analytics/ingest-post-metrics.ts`, `lib/analytics/adapters/**`, `lib/analytics/scheduler.ts` (or bullmq worker bootstrap), `app/api/analytics/ingest/route.ts` and/or `scripts/run-analytics-ingest.ts`, `.env.example`, `package.json` | [x] | Skills: `bullmq-job-queue`, `backend`. BullMQ if REDIS_URL else node-cron/CLI. Mock adapters mandatory. Write via C-16 repository. Done 2026-09-19: mock path + day-bucket upsert + CLI/API. |
| 2 | Tester | `memory/tickets/C-17-analytics-cron-ingest/guards.md` | [x] | Mock ingest → snapshots; no keys path; idempotency; secret hygiene. GREEN 2026-09-19: `scripts/sprint5-live-guards.mjs` + anti_slop OK. |
| 3 | Fixer | Backend paths выше | [x] | 2026-09-19: `scheduler.ts` BullMQ v6 — `queue.add(..., { repeat })` → `upsertJobScheduler` (JobsOptions no longer has `repeat`). `npx tsc --noEmit` green. Architecture unchanged. |
| 4 | Deployer | localhost | [x] | 2026-09-19: `analytics:ingest` fallback written=3; insights/snapshot 200; guards GREEN; не VPS |
| 5 | Client | приёмка C-17 | [x] | ПРИНЯТО 2026-09-19 — mock ingest path + guards GREEN; Playwright MCP gap → HTTP/wiring |

Порядок: **Backend → Tester → Fixer → Deployer → Client**.

Depends on: **C-16** Backend Done.  
Blocks: C-18 (needs snapshots for aggregates).  
Overview: `memory/tickets/_sprint5-live-overview.md`
