# Guards — C-18

| Guard type | What | Where |
|------------|------|-------|
| test | `lib/analyst/run-insights.ts` + no-key mock path | `scripts/sprint5-live-guards.mjs` |
| test | `workers/analyst/prompt.md` versioned; no silent overwrite / promptHints HITL | `scripts/sprint5-live-guards.mjs` |
| test | `app/api/analytics/insights/route.ts` exports GET | `scripts/sprint5-live-guards.mjs` |
| test | `InsightsFeed` fetches via `analytics-api` / `/api/analytics`; mock hydrate fallback | `scripts/sprint5-live-guards.mjs` |
| test | `.env.example` LLM placeholders only | `scripts/sprint5-live-guards.mjs` |
| test | Optional HTTP: GET `/api/analytics/insights` + `/analytics` → 200 when localhost up | `scripts/sprint5-live-guards.mjs` |
| scan | anti-slop on analytics UI wave | `plugins/frontend/anti_slop_scan.py` |

## Mirror in Client skill

| C-18 | analyst/API/FE wire missing or silent prompt overwrite risk | sprint5-live-guards | `scripts/sprint5-live-guards.mjs` |
