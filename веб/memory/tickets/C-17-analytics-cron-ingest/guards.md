# Guards — C-17

| Guard type | What | Where |
|------------|------|-------|
| test | `lib/analytics/ingest-post-metrics.ts` (or ingest) exists | `scripts/sprint5-live-guards.mjs` |
| test | `lib/analytics/adapters/**` + `mock-platform.ts` mock path | `scripts/sprint5-live-guards.mjs` |
| test | Ingest writes via repository (getAnalyticsRepository / upsert) | `scripts/sprint5-live-guards.mjs` |
| test | Trigger: `app/api/analytics/ingest/route.ts` and/or `scripts/run-analytics-ingest.ts` | `scripts/sprint5-live-guards.mjs` |
| test | `.env.example` documents IG/YT/REDIS placeholders; no real keys | `scripts/sprint5-live-guards.mjs` |
| scan | anti-slop on wave touch surface | `plugins/frontend/anti_slop_scan.py` |

## Mirror in Client skill

| C-17 | ingest/adapters/mock missing or secrets in example | sprint5-live-guards | `scripts/sprint5-live-guards.mjs` |
