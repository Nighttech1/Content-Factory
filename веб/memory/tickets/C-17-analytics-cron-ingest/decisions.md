# Decisions — C-17

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Queue vs cron | **BullMQ when `REDIS_URL`; else node-cron / CLI same handler** | Redis may be absent; one code path for metrics write. |
| Adapter strategy | **Real if configured, else mock per platform** | Localhost always green; no fake “success” without writes. |
| Idempotency | **One snapshot per (postId, platform, UTC calendar day)** upsert | Avoid unbounded history spam on re-runs; history still grows day-by-day. |
| Trigger for QA | **`POST /api/analytics/ingest` + CLI script** | Serverless-safe; Deployer/Client can force a run. |
| Auth on trigger | **`INGEST_SECRET` header or dev-only** | Prevent open write on shared hosts. |
| Schema edits | **None preferred** | Use C-16 PostAnalytics as-is. |

## Env matrix

| Keys present | Behavior |
|--------------|----------|
| none | mock IG + mock YT → fallback or Prisma |
| IG only | real IG + mock YT |
| YT only | mock IG + real YT |
| REDIS_URL | BullMQ repeatable + optional cron disabled to avoid double-fire (pick BullMQ as primary) |

## Safety reminder

No wipe; secrets only `.env`.

## Backend notes (2026-09-19)

| Topic | Choice |
|-------|--------|
| Day-bucket id | `pa_{platform}_{postId}_{YYYY-MM-DD}` via `dayBucketSnapshotId` |
| No Redis default | `scheduler` mode=`noop`; use `npm run analytics:ingest` or POST |
| In-process cron | Opt-in `ANALYTICS_ENABLE_NODE_CRON=1` (serverless-safe default off) |
| Target resolution | `ANALYTICS_POST_ALLOWLIST` → published jobs → C-16 seed defaults |
