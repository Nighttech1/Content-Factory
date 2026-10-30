# Chain — C-13

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить FE с C-14/C-15 на `components/analytics/**`, `lib/analytics-*`, `app/analytics/**`.  
> Старт: **Frontend C-13 первым** в волне Sprint 5 UI. Backend / AI Bridge / Prisma / BullMQ / IG+YT API — **нет**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/analytics/page.tsx`, `components/analytics/AnalyticsShell.tsx`, `components/analytics/AnalyticsHeader.tsx`, `components/analytics/KpiCardsRow.tsx`, `components/analytics/KpiCard.tsx`, `components/analytics/AnalyticsMainGrid.tsx`, `components/analytics/RetentionChart.tsx` (stub), `components/analytics/InsightsFeed.tsx` (stub), `components/analytics/PublishedPostsTable.tsx` (stub), `lib/analytics-mock.ts`, `lib/analytics-store.ts` (optional) | [x] | Skills: `content-factory-ui`, `luxury-web-craft`. Reuse GlassCard/NeonBadge/ReactiveButton. Full mock seed for C-14/C-15. **Do not** add recharts here. |
| 2 | Motion | `components/analytics/AnalyticsShell.tsx`, `components/analytics/AnalyticsHeader.tsx`, `components/analytics/KpiCardsRow.tsx`, `components/analytics/KpiCard.tsx` | [x] | skill `web-motion-engine`; entrance + KPI stagger; spring `{ damping: 25, stiffness: 300 }`; `useReducedMotion` |
| 3 | Tester | `memory/tickets/C-13-analytics-kpi/guards.md` | [x] | `/analytics` 200; 4 KPI; stubs present; anti-slop; no H-scroll @1440 |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [ ] | архитектуру не менять |
| 5 | Deployer | localhost `:3000` | [x] | `/analytics` HTTP 200; sync local API if any; не VPS |
| 6 | Client | приёмка C-13 | [x] | KPI row; полный Screen 4 после C-14/C-15 — ПРИНЯТО 2026-09-18 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** после Done Frontend(+Motion) C-13 → Оркестратор стартует **C-14 Frontend**. Не параллелить.

Overview: `memory/tickets/_sprint5-analytics-overview.md`
