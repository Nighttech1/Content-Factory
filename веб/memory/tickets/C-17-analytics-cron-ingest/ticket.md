# C-17 — Analytics cron ingest

| Field | Value |
|-------|-------|
| **ID** | `C-17` |
| **Priority** | P0 |
| **Area** | analytics_backend |
| **Wave** | `W-2026-09-19-sprint5-live` |

## Expected (DEV_PLAN 5.4)

- Daily/repeatable job (BullMQ preferred; node-cron OK if Redis absent — Architect decides).
- Adapters: Instagram Graph API + YouTube Analytics API.
- Persist snapshots into `PostAnalytics`.
- If env keys missing → mock provider writes realistic fixtures (localhost must work).
- Secrets only `.env`.

## Notes

After C-16. Chain: Backend + `bullmq-job-queue`.
