# Chain — C-133 (hydration nav-brand)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Path lock shell #1 FIRST.** Не parallel с C-130 / C-136 на `SidebarNavigation.tsx`.

**One-liner:** Frontend → (wave shell continues C-130) → … → Tester → Fixer → Deployer → Client S36

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/shell/SidebarNavigation.tsx` | [x] | Always `data-testid="nav-brand"`; no conditional testid; no window-only brand; skill `content-factory-ui` |
| 2 | Motion | — | [ ] | не нужен |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-133-hydration-nav-brand/guards.md` | [x] | static PASS 2026-10-10; Playwright pending Client S36 |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | после зелёных guards волны |
| 7 | Client | S36 hydration slice | [ ] | Playwright @1440 |

**Порядок волны:** **C-133 → C-130 → C-136** → feed → razbor → C-137 → Tester → …
