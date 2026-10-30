# Chain — C-60

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** **C-60 → C-61 → C-62**.  
> **Старт первым.** Не трогать `VerticalPostCarousel`, `StudioModuleWorkspace` chrome/search, `RazborModal`, `DraftsPanel`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/shell/SidebarNavigation.tsx` (убрать Studio children), `components/shell/AppShell.tsx` (pad = ширина), `lib/shell/sidebar-width.ts` (новый: key `cf.sidebar.width`, clamp 200–360, default 256), optional `components/ui/*resize*` если 21st handle вынесен | [x] | Нет `nav-studio-children`; `data-testid="sidebar-resize-handle"`; RBAC Холст; 21st search handle, MCP down → fallback Dark Luxury |
| 2 | Motion | handle hover/press; aside width без jank | [ ] | reduced-motion: drag без spring на каждый px; `{ damping: 25, stiffness: 300 }` только enter aside если уже есть |
| 3 | Tester | `memory/tickets/C-60-sidebar-resize-no-modules/guards.md`; S9/S12; **обновить** `scripts/smoke-c27-studio-routes.ts` (G4 children **запрещены**) | [x] | guards PASS; smoke G4 inverted; no Fixer |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical; не начинать C-61 |
| 5 | Deployer | localhost `/studio` | [x] | `npm run dev` :3000; `/studio` 200 |
| 6 | Client | приёмка | [ ] | S9 + S12 + snapshot сайдбара |

Skills: `content-factory-ui`, `21st-ui-catalog`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
