# Chain — C-30

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-29 (grid + Drafts CTA + fixtures).  
> **Порядок волны:** C-29 → **C-30** → C-31.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/studio/razbor-pipeline.ts` (new), `lib/studio/carousel-draft-types.ts` (new), optional `app/api/studio/carousel-engine/razbor/route.ts` + `.../drafts/route.ts`, `scripts/smoke-c30-razbor.ts` | [x] | Mock agent messages + draft factory; **no DB**; Mock LLM OK |
| 2 | Frontend | `components/studio/workspace/FeedPostCard.tsx`, `RazborModal.tsx` (+ agent panes), Drafts panel (replace C-29 stub), `lib/studio/carousel-drafts-store.ts` or `lib/studio-store.ts` slice, `StudioModuleWorkspace.tsx` | [x] | L chats + R carousel; cascade UX; drafts list/edit |
| 3 | Motion | Razbor modal + cascade panes | [x] | Enter/exit, step reveal; reduced motion |
| 4 | Tester | `memory/tickets/C-30-competitor-razbor/guards.md` | [x] | GREEN: pipeline + UI source + live HTTP; Fixer N/A |
| 5 | Fixer | _(если красное)_ | [x] | N/A — all green |
| 6 | Deployer | localhost | [x] | `:3000` up; `/studio/carousel-engine` 200; no VPS |
| 7 | Client | приёмка | [x] | ПРИНЯТО (ticket); wave NOT согласовано |

Skills: `backend`, `content-factory-ui`, `content-pipeline-agents` (patterns), `web-motion-engine`, `prompt-engineering` only if live LLM optional path added. AI Bridge — **не default**.
