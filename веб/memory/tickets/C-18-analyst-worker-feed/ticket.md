# C-18 — Analyst worker + live insights feed

| Field | Value |
|-------|-------|
| **ID** | `C-18` |
| **Priority** | P1 |
| **Area** | analytics_ai |
| **Wave** | `W-2026-09-19-sprint5-live` |

## Expected (DEV_PLAN 5.6)

- `workers/analyst` prompt/script: read aggregates from `PostAnalytics` → LLM insights.
- No silent overwrite of prod prompts; HITL-safe.
- API route for insights (and optionally KPI/retention aggregates).
- Frontend: InsightsFeed (and preferably KPI/retention) can load from API with mock fallback.
- Without LLM key → deterministic mock insights from aggregates.

## Notes

AI Bridge → Frontend. After C-16/C-17.
