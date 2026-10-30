# Chain — C-15

> Оркестратор зовёт только после **Done** Frontend C-14 (retention + recharts).  
> **Запрет:** править RetentionChart / KPI / mock/store / page; параллелить FE назад на C-13/C-14 paths.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/analytics/InsightsFeed.tsx`, optional `components/analytics/InsightCard.tsx`, `components/analytics/PublishedPostsTable.tsx` (light fill) | [x] | Skills: `content-factory-ui`, `luxury-web-craft`. Consume mock. Tone-differentiated cards. Table polish non-blocking. |
| 2 | Motion | `components/analytics/InsightsFeed.tsx`, optional `PublishedPostsTable.tsx` | [x] | skill `web-motion-engine`; feed stagger; `useReducedMotion` |
| 3 | Tester | `memory/tickets/C-15-analytics-insights/guards.md` | [x] | ≥3 insights + tone contrast; optional table; full `/analytics` Screen 4 mock; anti-slop |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [ ] | архитектуру не менять |
| 5 | Deployer | localhost `:3000` | [x] | `/analytics` 200; не VPS |
| 6 | Client | приёмка C-15 + wave | [x] | insights feed; wave verdict Screen 4 mocks — ПРИНЯТО · согласовано 2026-09-18 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** после Client C-15 — итоговая приёмка Sprint 5 UI wave (mocks). Backend 5.4–5.6 — следующая волна.

Depends on: C-13 + C-14 Frontend Done.  
Overview: `memory/tickets/_sprint5-analytics-overview.md`
