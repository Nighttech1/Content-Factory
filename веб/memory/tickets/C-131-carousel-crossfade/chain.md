# Chain — C-131 (carousel crossfade)

> Оркестратор зовёт следующую роль только после checkbox.  
> **После C-132.** Frontend hook → **Motion**. Не parallel mesh/shell.

**One-liner:** Frontend → Motion → … → Tester → Fixer → Deployer → Client S38

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/VerticalPostCarousel.tsx`, media slide wrappers in `FeedPostCard.tsx` / preview carousels if shared | [x] | Structure: overlap slides; ban wait-empty; skill `content-factory-ui` |
| 2 | Motion | same carousel paths | [x] | Polish 160/120ms ease-out; mode=sync; no black flash; reduced-motion OK |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `memory/tickets/C-131-carousel-crossfade/guards.md` | [x] | static PASS 2026-10-10; Playwright pending Client S38 |
| 5 | Fixer | _(если красное)_ | [ ] | surgical |
| 6 | Deployer | localhost | [ ] | wave end |
| 7 | Client | S38 crossfade | [ ] | Playwright @1440 |

**Порядок:** C-132 → **C-131** → C-134→C-135 → C-137 → …
