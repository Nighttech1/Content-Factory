# Guards — C-13

| Guard type | What | Where |
|------------|------|-------|
| test | `AnalyticsShell.tsx`, `KpiCard.tsx`, `lib/analytics-mock.ts` exist | `scripts/sprint5-guards.mjs` |
| test | `/analytics` page mounts AnalyticsShell; not Sprint 5 placeholder | `scripts/sprint5-guards.mjs` |
| test | Mock seeds 4 KPI ids (`views`, `save_rate`, `followers`, `ai_efficiency`) | `scripts/sprint5-guards.mjs` |
| test | KpiCard has glass/delta/sparkline signal | `scripts/sprint5-guards.mjs` |
| test | Optional HTTP: GET `/analytics` → 200 when localhost up | `scripts/sprint5-guards.mjs` |
| scan | anti-slop on analytics UI wave | `plugins/frontend/anti_slop_scan.py` |

## Mirror in Client skill

| C-13 | analytics KPI shell missing / placeholder / no 4 KPIs | sprint5-guards | `scripts/sprint5-guards.mjs` |
