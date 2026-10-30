# 🚀 ДЕПЛОЕР — W-2026-10-15-sprint8-postgres

**Дата:** 2026-10-15  
**Цель:** localhost only — **НЕ VPS/prod**  
**Данные:** Postgres `cf-postgres` volume сохранён; volumes не трогали

## Situation

- Port **3000** занят Grafana (`infra-grafana-1`) — не Content Factory
- Next.js поднят на свободном порту **3001**

## Status

| Check | Result |
|-------|--------|
| `npm run dev -- -p 3001` (Turbopack) | running · Ready |
| `GET http://localhost:3001/studio` | HTTP 200 |
| Postgres SoT smoke | **SMOKE_OK** (17/17 PASS) |
| Volumes wipe / migrate reset | **не выполнялось** |

## Smoke

```text
$env:CF_SMOKE_BASE_URL='http://localhost:3001'
npx tsx scripts/smoke-sprint8-postgres-sot.ts
→ SMOKE_OK
```

Guards: shell_freeze, approve_no_social, actor, persist drafts/boards, isolation, approve→scheduled, design ≤10, migrate idempotent, http_persist_isolation — all PASS. Store: `sprint8-store=prisma`.

## Приёмка Клиентом (Playwright @1440)

**URL:** `http://localhost:3001`

Рекомендуемые маршруты:
- Studio: `http://localhost:3001/studio`
- Settings: `http://localhost:3001/settings`

Клиенту: persistence smoke Sprint 8 — данные в Postgres SoT, не UI redesign accept.
