# Chain — C-63

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны 1:** **C-64 → C-65 → C-63** на shared `StudioModuleWorkspace`.  
> Trainer уже закрыл грейд волны.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-07-ux-wave-grade.md` | [x] | Grade A; skills Nav/route loading |
| 1 | Architect | `architect-spec.md`, этот `chain.md` | [x] | Spec only; no app code |
| 2 | Frontend | `app/studio/loading.tsx`, `app/schedule/loading.tsx`, `app/analytics/loading.tsx`, `app/brand-kit/loading.tsx`, `app/settings/loading.tsx`, `app/admin/mesh/loading.tsx`, `app/admin/mesh/page.tsx` (dynamic canvas), `components/shell/AppShell.tsx`, `components/analytics/AnalyticsShell.tsx`, `components/analytics/InsightsFeed.tsx` (`Promise.all`), `components/analytics/RetentionChart.tsx` (dynamic), `components/studio/StudioModuleWorkspace.tsx` (**после C-64/C-65**: soften enter + dynamic RazborModal) | [x] | + shared `RouteLoadingSkeleton`; dynamic CreateCarouselModal; AnalyticsMainGrid → RetentionChart dynamic; carousel/mesh labels/schedule calendar не трогали |
| 3 | Motion | `AppShell` + route-shell enter; no full-page opacity:0; reduced-motion | [x] | `initial={false}` на AppShell / Studio / Analytics / Mesh root; nested mesh switch ≤~150ms без opacity:0 |
| 4 | Tester | `memory/tickets/C-63-nav-perceived-speed/guards.md`; S15 | [x] | Static smoke GREEN; HTTP `/studio` 200; Playwright S15 → Client |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical; не менять архитектуру |
| 6 | Deployer | localhost routes listed | [x] | 2026-10-07 — `npm run dev` :3000; `/studio` `/studio/carousel-engine` `/schedule` `/admin/mesh` HTTP 200; no VPS |
| 7 | Client | acceptance | [x] | Вердикт пользователю |

Skills: `content-factory-ui`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
