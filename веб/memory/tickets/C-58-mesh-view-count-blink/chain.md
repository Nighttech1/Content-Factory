# Chain — C-58

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-57 → **C-58** → C-59.  
> **Старт после C-57.** Не трогать `SidebarNavigation` / `menu-vertical` / `RazborModal` / `ScheduleModuleRail`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/mesh/CanvasTopBar.tsx` (удалить `onAddModule` / кнопку), `components/mesh/AgentMeshCanvas.tsx` (view-only flags; switcher **сверху** extra), `lib/mesh-seed.ts` (LR: один Y, шаг X), `components/studio/workspace/VerticalPostCarousel.tsx` (**только** header count, не сетка SWR) | [x] | `nodesDraggable={false}`; нет connect; pan/zoom OK; last-known count; C-08 add superseded |
| 2 | Motion | `AgentMeshCanvas.tsx` / PulseEdge (read); TopBar без add hover | [ ] | не возвращать drag; fitView duration 0 если reduced-motion; spring switcher как есть |
| 3 | Tester | `memory/tickets/C-58-mesh-view-count-blink/guards.md`; S10; обновить smoke C-08 add-module | [x] | нет `mesh-add-module`; nodes not draggable; header не «…» на refetch |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical; не стартовать C-59 |
| 5 | Deployer | localhost `/admin/mesh` + `/studio/carousel-engine` | [x] | no VPS |
| 6 | Client | приёмка | [ ] | S10 + S3 RBAC |

Skills: `xyflow-agent-mesh`, `content-factory-ui`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
