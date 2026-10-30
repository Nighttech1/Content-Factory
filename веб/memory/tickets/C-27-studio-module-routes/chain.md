# Chain — C-27

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-26 specced/done предпочтительно до визуальной приёмки; routing можно после C-26 Frontend.  
> **Порядок волны:** C-26 → **C-27** → C-28.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/studio/page.tsx`, `app/studio/[moduleId]/page.tsx` (new), `components/studio/ModuleSelectorGrid.tsx`, `components/studio/FloatingCommandBar.tsx` (unmount from launch only), `components/shell/SidebarNavigation.tsx`, `components/studio/modules.ts` (shared nav helper if needed) | [x] | Link navigation; remove topic from launch; Studio nested sidebar; keep inspect |
| 2 | Motion | `components/shell/SidebarNavigation.tsx` | [x] | Expand/collapse children; reduced-motion safe |
| 3 | Tester | `memory/tickets/C-27-studio-module-routes/guards.md`, update client-scenario notes / smoke if launch selectors moved | [x] | No command-input on `/studio`; module hrefs; sidebar children; inspect intact — `SMOKE_C27_OK` live |
| 4 | Fixer | _(если красное)_ | [x] | N/A — green |
| 5 | Deployer | localhost | [x] | deployed_localhost; no VPS |
| 6 | Client | приёмка | [x] | **ПРИНЯТО** (C-27 only; wave ≠ согласовано) |

Skills: `content-factory-ui`, `web-motion-engine` (Motion). Backend / AI Bridge — не звать.
