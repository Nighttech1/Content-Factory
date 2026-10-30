# C-16 — PostAnalytics Prisma schema

| Field | Value |
|-------|-------|
| **ID** | `C-16` |
| **Priority** | P0 |
| **Area** | analytics_backend |
| **Wave** | `W-2026-09-19-sprint5-live` |

## Expected (DEV_PLAN 5.5)

- Prisma project bootstrap if missing (`prisma/schema.prisma`).
- Models per ARCHITECTURE §6: at least `PostAnalytics`; additive `User` / `ContentJob` / enums if greenfield.
- Migration via `safe-db-migrations` (additive only).
- Seed optional local fixtures (empty-safe).

## Notes

Backend first. No cron yet → C-17. No secrets in repo.
