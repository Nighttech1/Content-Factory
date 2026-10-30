# Chain — C-49

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** **C-49 → C-50 → C-51**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/StudioModuleWorkspace.tsx`, `components/studio/workspace/VerticalPostCarousel.tsx`, `components/studio/workspace/FeedPostCard.tsx`, optional `lib/studio/feed-types.ts` (`mediaUrl?`), unmount `ModuleIdeaBar` | [x] | Remove subtitles + IdeaBar; competitors search (local title + debounce topic refetch); play overlay chrome no-autoplay; parity |
| 2 | Motion | `components/studio/workspace/FeedPostCard.tsx` (play/hover spring only) | [x] | Round play affordance; `prefers-reduced-motion`; **no autoplay** |
| 3 | Tester | `memory/tickets/C-49-carousel-workspace-chrome/guards.md` | [x] | No IdeaBar/subtitles; search height parity; play toggle; no autoplay; C-40 topic refetch still works via search |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical; не возвращать IdeaBar |
| 5 | Deployer | localhost | [x] | Verified 200 on /studio/carousel-engine + /settings; no restart needed; no VPS |
| 6 | Client | приёмка | [ ] | `client-scenarios` + visual critic на dual feed |

Skills: `content-factory-ui`, `baseline-ui`, `21st-ui-catalog` (search/play pattern adapt), `web-motion-engine` (Motion), `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
