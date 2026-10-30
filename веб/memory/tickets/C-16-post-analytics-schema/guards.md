# Guards — C-16

| Guard type | What | Where |
|------------|------|-------|
| test | `prisma/schema.prisma` has models `PostAnalytics`, `User`, `ContentJob` | `scripts/sprint5-live-guards.mjs` |
| test | PostAnalytics fields: views/saves/shares/retentionCurve/postId/platform; provider=postgresql | `scripts/sprint5-live-guards.mjs` |
| test | `lib/db/analytics-repository.ts` + `analytics-fallback.ts` exist and wire fallback | `scripts/sprint5-live-guards.mjs` |
| test | `package.json` has **no** `migrate reset` / `migrate:reset` script | `scripts/sprint5-live-guards.mjs` |
| test | `.env.example` has `DATABASE_URL` placeholder; no live-looking secrets | `scripts/sprint5-live-guards.mjs` |
| scan | anti-slop on wave touch surface | `plugins/frontend/anti_slop_scan.py` |

## Mirror in Client skill

| C-16 | schema/fallback missing or reset script present | sprint5-live-guards | `scripts/sprint5-live-guards.mjs` |
