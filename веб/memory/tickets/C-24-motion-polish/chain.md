# Chain — C-24

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` (особенно `GenerationDrawer.tsx` с незакрытым C-23).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/ModuleSelectorGrid.tsx`, `components/studio/GenerationDrawer.tsx`, `components/inspect/MediaDeck.tsx`, `components/inspect/ReelsPlayer.tsx`, `components/inspect/CarouselDeck.tsx`, `components/inspect/MediaSkeleton.tsx` | [x] | skeleton markup + `useDemoMediaLoading` + `data-testid`; 21st shimmer adapted |
| 2 | Motion | те же UI paths | [x] | `staggerChildren: 0.08`, springs 28/280, `useReducedMotion`; no shimmer loop when reduce |
| 3 | Tester | `memory/tickets/C-24-motion-polish/guards.md` | [x] | GREEN — guards.md + regression-guards; Fixer N/A |
| 4 | Fixer | paths выше если красное | [x] | **N/A** — Tester green, no fails |
| 5 | Deployer | localhost | [x] | `/studio` + `/studio/inspect/demo` → 200; status `deployed_localhost` |
| 6 | Client | приёмка C-24 / DEV_PLAN 7.2 | [x] | ПРИНЯТО С ЗАМЕЧАНИЯМИ (Playwright MCP gap) |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.  
Backend / AI Bridge — **не** звать.
