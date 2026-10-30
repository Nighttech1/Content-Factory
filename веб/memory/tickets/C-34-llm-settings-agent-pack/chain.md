# Chain — C-34

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-32, C-33 preferred first (wave order).  
> **Порядок волны:** C-32 → C-33 → **C-34**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `.env.example` (`AGGREGATOR_API_KEY`, `AGGREGATOR_BASE_URL`), `lib/llm/aggregator.ts` | [x] | Placeholders only; **never** real keys; no DB |
| 2 | AI Bridge | `agents/*.md` (+ README) | [x] | Role / Base prompt / Skills / Plugins / MCP / model slot |
| 3 | Frontend | `lib/settings/llm-models.ts`, `app/settings/page.tsx`, `SidebarNavigation` | [x] | Per-agent model UI; localStorage `cf-llm-agent-models` |
| 4 | Motion | `/settings` (optional) | [x] | Skipped — page enter not required |
| 5 | Tester | `memory/tickets/C-34-llm-settings-agent-pack/guards.md` + smoke | [ ] | Route, sidebar, env placeholders, agents files, no secrets |
| 6 | Fixer | _(если красное)_ | [ ] | Surgical |
| 7 | Deployer | localhost | [ ] | After green; no VPS |
| 8 | Client | приёмка | [ ] | After deploy |

Skills: `backend`, `ai-bridge`, `prompt-engineering`, `content-factory-ui`.  
**Do not** parallel Backend env with AI Bridge `agents/` (no overlap). Frontend after Backend+AI Bridge so catalog/agent ids align.
