# Guards — C-15

| Guard type | What | Where |
|------------|------|-------|
| test | `InsightsFeed.tsx` exists | `scripts/sprint5-guards.mjs` |
| test | InsightsFeed maps `insights` to cards | `scripts/sprint5-guards.mjs` |
| test | `analytics-mock` seeds ≥3 insights (`ins-*`) | `scripts/sprint5-guards.mjs` |
| test | Tone-differentiated UI (InsightCard / NeonBadge / tone) | `scripts/sprint5-guards.mjs` |
| test | Optional HTTP: GET `/analytics` → 200 when localhost up | `scripts/sprint5-guards.mjs` |
| scan | anti-slop on analytics UI wave | `plugins/frontend/anti_slop_scan.py` |

## Mirror in Client skill

| C-15 | insights feed under 3 / no map of mock insights | sprint5-guards | `scripts/sprint5-guards.mjs` |
