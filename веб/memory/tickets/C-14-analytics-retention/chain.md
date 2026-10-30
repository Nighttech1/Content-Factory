# Chain — C-14

> Оркестратор зовёт только после **Done** Frontend C-13 (shell + stubs).  
> **Запрет:** править KPI/header/page/mock/store; параллелить с C-15 FE.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/analytics/RetentionChart.tsx`, optional `components/analytics/retention-*.tsx`, `package.json` (+ lock) — add **recharts** | [x] | Skills: `content-factory-ui`, `luxury-web-craft`. Consume mock/store. Tooltip + legend + 3 series. |
| 2 | Motion | `components/analytics/RetentionChart.tsx` | [x] | skill `web-motion-engine`; bay entrance; `useReducedMotion` |
| 3 | Tester | `memory/tickets/C-14-analytics-retention/guards.md` | [x] | 3 lines; hover tooltip; legend; recharts loads; anti-slop |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [ ] | архитектуру не менять; не менять chart lib без Architect |
| 5 | Deployer | localhost `:3000` | [x] | `/analytics` 200; ensure deps installed; не VPS |
| 6 | Client | приёмка C-14 | [x] | retention chart interactive — ПРИНЯТО 2026-09-18 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** после C-14 → Оркестратор стартует **C-15 Frontend**.

Depends on: `memory/tickets/C-13-analytics-kpi/chain.md` Done step 1(+2).  
Overview: `memory/tickets/_sprint5-analytics-overview.md`
