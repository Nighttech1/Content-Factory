# Chain — C-18

> Оркестратор зовёт **только после Backend Done C-17**.  
> **Порядок ролей:** AI Bridge → Backend → Frontend → Tester → Fixer → Deployer → Client.  
> **Запрет:** silent prompt overwrite; schema DROP; parallel edit overlapping paths.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | AI Bridge | `workers/analyst/prompt.md` (or system+user), `workers/analyst/run.ts` and/or `lib/analyst/run-insights.ts`, `lib/analyst/parse-insights.ts`, version bump note `analyst@v1` | [x] | Skills: `prompt-engineering`, `content-pipeline-agents`, `ai-bridge`, `workers/analyst/SKILL.md`. Mock LLM path mandatory. HITL: promptHints only. Done 2026-09-19: prompt@v1 + run/parse/mock; Backend next. |
| 2 | Backend | `app/api/analytics/insights/route.ts`, optional `app/api/analytics/snapshot/route.ts`, `lib/analytics/aggregate-for-analyst.ts`, insights cache under `data/local/`, `.env.example` (LLM key placeholder) | [x] | Done 2026-09-19: GET insights (+?refresh=1), POST refresh, GET snapshot, JSON cache, env placeholders. Frontend next. |
| 3 | Frontend | `components/analytics/InsightsFeed.tsx`, optional `lib/analytics-api.ts`, minimal hydrate in `lib/analytics-store.ts`; optional KPI/`RetentionChart` hydrate | [x] | Done 2026-09-19: `analytics-api.ts` + InsightsFeed fetch + mock fallback; optional snapshot KPI/retention; source label. Tester next. |
| 4 | Tester | `memory/tickets/C-18-analyst-worker-feed/guards.md` | [x] | ≥3 insights; no-key mock; API down → UI mock; no prompt overwrite; anti-slop. GREEN 2026-09-19: `scripts/sprint5-live-guards.mjs` (insights HTTP 200) + anti_slop OK. |
| 5 | Fixer | paths AI Bridge+Backend+Frontend выше | [ ] | архитектуру не менять |
| 6 | Deployer | localhost `:3000` | [x] | 2026-09-19: `/analytics` + `/api/analytics/insights` + snapshot 200; sprint5-live-guards GREEN; не VPS |
| 7 | Client | приёмка C-18 + wave | [x] | ПРИНЯТО · согласовано 2026-09-19 — insights API + feed wire; DEV_PLAN 5.4–5.6 `[x]`; Sprint 5 complete |

Порядок: **AI Bridge → Backend → Frontend → Tester → Fixer → Deployer → Client**.

Depends on: **C-16** + **C-17** Backend Done.  
Overview: `memory/tickets/_sprint5-live-overview.md`
