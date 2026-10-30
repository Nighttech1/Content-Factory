# Chain — C-67

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Wave 2.** Paths только `components/schedule/*` — можно параллельно с C-66 (разные деревья).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-07-ux-wave-grade.md` | [x] | Grade A |
| 1 | Architect | `architect-spec.md`, этот `chain.md` | [x] | Spec only |
| 2 | Frontend | `components/schedule/ScheduleModuleRail.tsx` (`defaultOpen={false}`, wrap), `components/schedule/ScheduleCalendar.tsx` (remove stripDays; arrows beside monthLabel), optional `ScheduleShell.tsx` | [x] | also `animated-file-tree` label wrap + defaultOpen false (schedule-only); **не** SidebarNavigation / mesh / studio |
| 3 | Motion | — | [ ] | skip unless rail open animation regresses |
| 4 | Tester | `memory/tickets/C-67-schedule-ux/guards.md`; S17 | [x] | Static smoke GREEN; defaultOpen false; no stripDays; month arrows + wrap |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical |
| 6 | Deployer | localhost `/schedule` | [x] | 2026-10-07 — `/schedule` HTTP 200; no VPS |
| 7 | Client | acceptance | [x] | |

Skills: `content-factory-ui`, `client-scenarios`, `21st-ui-catalog` (optional).  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL. Motion — только при регрессе.
