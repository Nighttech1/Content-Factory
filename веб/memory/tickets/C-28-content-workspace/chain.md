# Chain — C-28

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-27 routes + launch cleanup done (or at least `[moduleId]` page exists). C-26 font preferred before Client.  
> **Порядок волны:** C-26 → C-27 → **C-28**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `app/api/studio/[moduleId]/feed/route.ts` (new), `lib/studio/feed-types.ts`, `lib/studio/feed-fixtures.ts`, `scripts/smoke-c28-feed.ts` | [x] | GET feed mock `{ ours, competitors }`; topic filter; **no DB / no migrate** |
| 2 | Frontend | `app/studio/[moduleId]/page.tsx`, `app/studio/[moduleId]/edit/[draftId]/page.tsx` (new), `components/studio/workspace/*` (idea bar, dual carousels, draft block), editor shell components; reuse `lib/studio-store.ts` generate/SSE; optional trim of `FloatingCommandBar.tsx` into shared idea input | [x] | CapCut chrome; wire Generate; do not gut inspect; 21st=unavailable (quota) |
| 3 | Motion | workspace carousels + editor shell enter/scrubber | [x] | Carousel stagger; editor spring enter; playhead polish; `useReducedMotion` |
| 4 | Tester | `memory/tickets/C-28-content-workspace/guards.md`, client-scenarios update for module page | [x] | GREEN smoke+live+source; Playwright MCP gap noted honest |
| 5 | Fixer | _(если красное)_ | [x] | Skipped — Tester GREEN |
| 6 | Deployer | localhost API refresh + app | [x] | `:3000` up; smoke green; no VPS |
| 7 | Client | приёмка | [x] | Dual carousels + CapCut shell — ПРИНЯТО |

Skills: `backend`, `content-factory-ui`, `sse-job-stream` (reuse), `web-motion-engine`, `luxury-web-craft` / `taste-skill` for editor chrome. AI Bridge — только при смене промпт-контракта (не default).
