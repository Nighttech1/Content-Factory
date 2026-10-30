# Chain — C-29

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** **C-29** → C-30 → C-31.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/studio/feed-fixtures.ts`, optional `lib/studio/feed-types.ts` (docs only), `scripts/smoke-c29-feed-grid.ts`, reuse `app/api/studio/[moduleId]/feed/route.ts` | [x] | Expand carousel-engine to ≥21+21 with stable https `thumbUrl`; **no DB / no migrate** |
| 2 | Frontend | `components/studio/workspace/VerticalPostCarousel.tsx`, `FeedPostCard.tsx`, `StudioModuleWorkspace.tsx` (+ stub Drafts panel component under `workspace/`) | [x] | Grid 3×7 + aspect 3/5 + «Черновики» stub; only `carousel-engine` |
| 3 | Motion | same carousel/card files (light) | [x] | Stagger + reduced motion; no heavy redesign |
| 4 | Tester | `memory/tickets/C-29-carousel-grid-mocks/guards.md`, smoke script | [x] | GREEN fixtures+UI+live; guards.md |
| 5 | Fixer | _(если красное)_ | [x] | N/A — Tester green |
| 6 | Deployer | localhost refresh | [x] | `/studio/carousel-engine` 200; no VPS |
| 7 | Client | приёмка | [x] | C-29 only; wave NOT согласовано |

Skills: `backend`, `content-factory-ui`, `web-motion-engine` (light), `taste-skill`. AI Bridge — нет.

