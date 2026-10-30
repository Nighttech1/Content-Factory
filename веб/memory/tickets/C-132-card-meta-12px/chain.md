# Chain — C-132 (card meta 12px)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Feed path first.** Затем C-131 (+ Motion). Не parallel Razbor.

**One-liner:** Frontend → C-131 (+Motion) → … → Tester → Fixer → Deployer → Client S36

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/FeedPostCard.tsx`, related meta in `VerticalPostCarousel.tsx` if needed | [x] | CG white 12px all modules; skill `content-factory-ui` |
| 2 | Motion | — | [ ] | не в этом тикете → C-131 |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-132-card-meta-12px/guards.md` | [x] | static PASS 2026-10-10; Playwright pending Client S36 |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | wave end |
| 7 | Client | S36 typography | [ ] | Playwright @1440 |

**Порядок:** **C-132 → C-131** → C-134→C-135 → C-137 → …
