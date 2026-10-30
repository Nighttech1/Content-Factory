# Guards — C-14

| Guard type | What | Where |
|------------|------|-------|
| test | `RetentionChart.tsx` exists | `scripts/sprint5-guards.mjs` |
| test | RetentionChart imports `recharts` and uses `LineChart` | `scripts/sprint5-guards.mjs` |
| test | `package.json` declares `recharts` | `scripts/sprint5-guards.mjs` |
| test | Tooltip or ResponsiveContainer wired | `scripts/sprint5-guards.mjs` |
| test | Optional HTTP: GET `/analytics` → 200 when localhost up | `scripts/sprint5-guards.mjs` |
| scan | anti-slop on analytics UI wave | `plugins/frontend/anti_slop_scan.py` |

## Mirror in Client skill

| C-14 | retention chart missing recharts/LineChart | sprint5-guards | `scripts/sprint5-guards.mjs` |
