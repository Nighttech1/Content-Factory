# Chain — C-135 (Razbor composer)

> Оркестратор зовёт следующую роль только после checkbox.  
> **После C-134.** До C-137. Не parallel Razbor overlap.

**One-liner:** Frontend → (C-137) → Tester → Fixer → Deployer → Client S38

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/workspace/RazborModal.tsx`, `AgentChatComposer.tsx`, `multi-button` dense | [x] | Long input + 3 right + circular red X; skill `content-factory-ui` |
| 2 | Motion | optional micro | [ ] | не блокирует |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-135-razbor-composer/guards.md` | [x] | static PASS 2026-10-10; Playwright pending Client S38 |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | wave end |
| 7 | Client | S38 Razbor | [ ] | Playwright @1440 |

**Порядок:** C-134 → **C-135** → **C-137** → Tester → …
