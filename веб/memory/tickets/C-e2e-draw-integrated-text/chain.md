# Chain — C-e2e-draw-integrated-text

> Wave order: **2 of 3**. After C-e2e-prompts-kill-overlay. Next: C-e2e-live-trace.  
> **Запрет:** parallel writers on `carousel-html-renderer.ts`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/studio/carousel-html-renderer.ts` (+ optional `lib/llm/aggregator-images.ts`, `.env.example`) | [ ] | E2E default ON; integrated prompts; skip HTML overlay primary |
| 2 | AI Bridge | _(helper only if prompt string shared)_ | [ ] | Prefer Backend owns builder; Bridge only if overlay constant reuse needed |
| 3 | Tester | `guards.md` + smoke script if added | [ ] | N image calls; no NO-letters; renderMode e2e |
| 4 | Fixer | _(if red)_ | [ ] | Surgical |

Frontend / Motion / live MD burn: **out** (live = ticket 3).
