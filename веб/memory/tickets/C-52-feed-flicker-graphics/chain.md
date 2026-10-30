# Chain — C-52

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** **C-52 → C-53 → C-54**.  
> **Обоснование:** сначала SWR + play/metrics, иначе C-53/C-54 правят те же карточки на мигающей сетке.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/workspace/VerticalPostCarousel.tsx`, `components/studio/workspace/FeedPostCard.tsx`, `lib/studio/feed-play.ts` (новый хелпер), `lib/studio/feed-types.ts`, `lib/studio/feed-fixtures.ts`, `components/studio/StudioModuleWorkspace.tsx` (**только** прокинуть `moduleId` в карусели; **не** трогать `showDraftsButton` / `showRazborButton` / mount Razbor) | [x] | Skeletons iff empty+loading; media-aware Play; comments+shares; RU metric labels |
| 2 | Motion | `VerticalPostCarousel.tsx` (индикатор рефетча в шапке); при необходимости Play hide — без новой анимации скелетов | [x] | Header title-row opacity pulse only; grid static on refetch; reduce-motion instant/static `…`; spring idle `{ damping: 25, stiffness: 300 }` |
| 3 | Tester | `memory/tickets/C-52-feed-flicker-graphics/guards.md`; обновить `scripts/smoke-c40-competitors-by-topic-ui.ts` если assert требует skeleton-on-loading | [x] | S7: refetch keeps cards; graphics no Play; comments+shares; C-49 «Play everywhere» superseded for IMAGE |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical; не включать C-53 флаги |
| 5 | Deployer | localhost `/studio/aesthetic-graphics` + любой модуль с search | [x] | 2026-10-06 — `npm run dev` restarted; `/studio` `/studio/carousel-engine` `/studio/aesthetic-graphics` HTTP 200; no VPS |
| 6 | Client | приёмка | [ ] | `client-scenarios` S7 + visual critic |

Skills: `content-factory-ui`, `21st-ui-catalog`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
