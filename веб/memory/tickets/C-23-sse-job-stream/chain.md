# Chain — C-23

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `app/api/jobs/[id]/stream/route.ts`, `lib/jobs/**`, `app/api/modules/[moduleId]/generate/route.ts` | [x] | SSE + mock emitter + `jobId` in generate; `globalThis` registry; skill `sse-job-stream` + `bullmq-job-queue` только как справка (Redis optional) |
| 2 | Frontend | `hooks/useJobStream.ts` (или `lib/use-job-stream.ts`), `lib/studio-store.ts`, `components/studio/GenerationDrawer.tsx` | [x] | EventSource + Last-Event-ID; store drives steps via `openJobStream`; drawer unchanged (reads store); no `runSimulatedPipeline` |
| 3 | Tester | `memory/tickets/C-23-sse-job-stream/guards.md` | [x] | GREEN unit/mock + S1 grep; live HTTP pending Deployer (`:3000` offline); anti-slop OK |
| 4 | Fixer | paths выше если красное | [ ] | только по fail Tester; архитектуру не менять |
| 5 | Deployer | localhost `:3000` | [x] | `npm run dev` pid 9140; `/studio` 200; smoke GREEN; leave running for Client |
| 6 | Client | приёмка C-23 / DEV_PLAN 7.1 | [x] | **ПРИНЯТО** 2026-09-20 — live generate→jobId→SSE; Playwright MCP gap |

Порядок: **Backend → Frontend → Tester → Fixer → Deployer → Client**.  
Motion / AI Bridge / Кодер-монолит — **не** звать.
