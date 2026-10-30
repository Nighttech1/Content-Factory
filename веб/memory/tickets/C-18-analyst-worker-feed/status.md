# Status — C-18

| Status | **done** |
| Owner | Client (closed) |
| Updated | 2026-09-19 |

Spec: `architect-spec.md` · Chain: `chain.md` · Decisions: `decisions.md`

## Progress

- [x] Architect spec + chain
- [x] **AI Bridge** — `analyst@v1` prompt pack, `lib/analyst/*` runner/parse/mock, `workers/analyst/run.ts`
- [x] **Backend** — `GET /api/analytics/insights` (+ `?refresh=1`, POST refresh, snapshot, `data/local/analyst-insights.json` cache)
- [x] **Frontend** — `lib/analytics-api.ts`, InsightsFeed API wire + mock fallback, optional snapshot KPI/retention hydrate, source label; `ANALYTICS_SNAPSHOT` seed kept
- [x] Tester → Fixer → Deployer (localhost ready)
- [x] **Client** — ПРИНЯТО 2026-09-19

## Deployer (localhost)

- `http://localhost:3000/analytics` → 200
- `http://localhost:3000/api/analytics/insights` → 200
- `http://localhost:3000/api/analytics/snapshot` → 200
- `scripts/sprint5-live-guards.mjs` → GREEN (C-16, C-17, C-18)
- Separate API process: N/A (Next-only)
- No VPS

## Client

- **[x] Client checkbox** — ПРИНЯТО 2026-09-19 (wave **согласовано**)
- Live: insights API returns ≥3 mock insights (tones green/blue/terracotta/gold); `/analytics` 200 with Analyst bay; InsightsFeed → `fetchAnalyticsInsights` + seed fallback
- Playwright MCP недоступен — приёмка по HTTP + guards + FE wiring

## Next

—
