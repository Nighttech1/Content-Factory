# Status — C-17

| Status | **done** |
| Owner | Client (closed) |
| Updated | 2026-09-19 |

Spec: `architect-spec.md` · Chain: `chain.md` · Decisions: `decisions.md`

## Backend summary

- Adapters: `lib/analytics/adapters/` — Instagram + YouTube; **mock when keys missing**.
- Handler: `lib/analytics/ingest-post-metrics.ts` → `getAnalyticsRepository().upsertSnapshot` with day-bucket ids.
- Scheduler: `lib/analytics/scheduler.ts` — BullMQ if `REDIS_URL`, else noop (+ optional `ANALYTICS_ENABLE_NODE_CRON=1`).
- Triggers: `POST /api/analytics/ingest`, `npm run analytics:ingest`.
- No schema changes; uses C-16 repository / fallback JSON.

## Deployer (localhost)

- `npm run analytics:ingest` → store=fallback written=3 (IG mock ×2, YT mock ×1)
- `/api/analytics/insights` 200, `/api/analytics/snapshot` 200
- `scripts/sprint5-live-guards.mjs` → GREEN
- No VPS / no API keys required

## Client

- **[x] Client checkbox** — ПРИНЯТО 2026-09-19
- Live: ingest + mock adapters + repository write path present; guards GREEN; no real keys in `.env.example`
- Playwright MCP недоступен — приёмка по HTTP + guards + wiring

## Next

—
