# Chain — C-136 (nav IA module top)

> Оркестратор зовёт следующую роль только после checkbox.  
> **После C-133 → C-130.** Shell path last. **C-137 ждёт** эти routes.

**One-liner:** Frontend → (feed/razbor paths) → C-137 → Tester → Fixer → Deployer → Client S36

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/shell/SidebarNavigation.tsx` (NAV_ITEMS), `app/studio/[moduleId]/mesh/page.tsx` (**new**), `app/studio/[moduleId]/analytics/page.tsx` (**new**), module top bar in `components/studio/**` / `StudioModuleWorkspace*`, optional shim `app/admin/mesh/page.tsx` + `app/analytics/page.tsx` | [x] | Nested routes LOCKED; sidebar 3 only; OWNER mesh; skills `content-factory-ui`, `content-factory-analytics` |
| 2 | Motion | — | [ ] | не обязателен |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-136-nav-ia-module-top/guards.md` | [x] | static PASS 2026-10-10; Playwright pending Client S36 |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | после зелёных guards волны |
| 7 | Client | S36 nav IA | [ ] | Playwright @1440 clicks |

**Порядок волны:** shell done → C-132→C-131 → C-134→C-135 → **C-137** → Tester → …
