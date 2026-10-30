# Chain — C-134 (titles 16px)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Razbor path first.** Затем C-135. Не parallel feed/mesh.

**One-liner:** Frontend → C-135 → … → Tester → Fixer → Deployer → Client S36

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/RazborModal.tsx`, related system title chrome in studio | [x] | CG white 16px; skill `content-factory-ui`; `.cf-system-title` + `--font-century-gothic` |
| 2 | Motion | — | [ ] | не нужен |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-134-titles-16px/guards.md` | [x] | static PASS 2026-10-10; Playwright pending Client S36 |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | wave end |
| 7 | Client | S36 titles | [ ] | Playwright @1440 |

**Порядок:** **C-134 → C-135** → C-137 → …
