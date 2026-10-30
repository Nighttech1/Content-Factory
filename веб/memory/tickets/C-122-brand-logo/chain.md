# Chain — C-122 (brand logo)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Path lock #1** волны — до C-123. Не parallel с mesh/schedule/analytics.

**One-liner:** Frontend → (wave continues) → Tester → Fixer → Deployer → Client

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/shell/SidebarNavigation.tsx`, `public/brand/vernatun-logo.png` (copy from `knowledge/logo/logo-transparent.png`) | [x] | Horizontal PNG + VERNATUN / ARMENIAN CLUB; skill `content-factory-ui` |
| 2 | Motion | — | [ ] | не нужен |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-122-brand-logo/guards.md` | [x] | static PASS; Playwright S32 → Client |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | после зелёных guards волны |
| 7 | Client | S32 brand | [ ] | Playwright @1440 |

**Порядок волны:** C-122 → C-123 → C-124+C-125 → C-126 → C-127→C-128 → Motion → Tester → …
