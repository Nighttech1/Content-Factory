# Chain — C-130 (emblem-only brand)

> Оркестратор зовёт следующую роль только после checkbox.  
> **После C-133.** До C-136. Не parallel shell overlap.

**One-liner:** Frontend → (C-136) → … → Tester → Fixer → Deployer → Client S36

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/shell/SidebarNavigation.tsx`, `public/brand/vernatun-emblem.png` (copy from Cursor assets path in spec D1) | [x] | Circle emblem ONLY + VERNATUN/ARMENIAN CLUB right; keep `nav-brand`; skill `content-factory-ui` |
| 2 | Motion | — | [ ] | не нужен |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-130-emblem-brand/guards.md` | [x] | static PASS 2026-10-10; Playwright pending Client S36 |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | после зелёных guards волны |
| 7 | Client | S36 brand | [ ] | Playwright @1440 |

**Порядок волны:** C-133 → **C-130** → C-136 → …
