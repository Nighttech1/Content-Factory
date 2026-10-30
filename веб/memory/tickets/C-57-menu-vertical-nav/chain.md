# Chain — C-57

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** **C-57 → C-58 → C-59**.  
> **Старт первым.** Не трогать mesh / Razbor / `VerticalPostCarousel` / `ScheduleModuleRail`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/ModuleSelectorGrid.tsx` (убрать счётчик), `components/ui/menu-vertical.tsx` (**новый**), `components/shell/SidebarNavigation.tsx` | [x] | 21st-first; `framer-motion` not `motion/react`; `text-sm`; Studio children `text-[13px]` or `text-xs`; hover `var(--accent-gold)`; RBAC Холст OWNER; RU labels |
| 2 | Motion | `menu-vertical.tsx`, `SidebarNavigation.tsx` | [x] | hover-стрелка; accordion spring `{ damping: 25, stiffness: 300 }`; reduced-motion |
| 3 | Tester | `memory/tickets/C-57-menu-vertical-nav/guards.md`; S9 | [x] | нет «Ничего не выбрано»; sm + children smaller; ADMIN без Холста |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical; не начинать C-58 |
| 5 | Deployer | localhost `/studio` | [x] | no VPS |
| 6 | Client | приёмка | [ ] | S9 + snapshot сайдбара |

Skills: `content-factory-ui`, `21st-ui-catalog`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
