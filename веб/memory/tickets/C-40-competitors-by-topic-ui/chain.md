# Chain — C-40

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-39 Backend feed behaviour.  
> **Порядок волны:** C-38 → C-39 → **C-40**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/StudioModuleWorkspace.tsx`, topic input / empty-state components under `components/studio/workspace/*` (Feed column header/empty copy as needed), any i18n/copy strings touched | [x] | Initial niche competitors; topic commit + **empty clear** refresh; no competitor URL prompts — done 2026-09-21 |
| 2 | Tester | `memory/tickets/C-40-competitors-by-topic-ui/guards.md` | [x] | GREEN 2026-09-21 — `scripts/smoke-c40-competitors-by-topic-ui.ts`; mount/clear/no-URL-copy/loading; HTTP after Deployer |
| 3 | Fixer | _(если красное)_ | [ ] | UI-only surgical fixes |
| 4 | Deployer | localhost | [x] | 2026-09-21 — Next up; feed niche competitors=22 mock; topic + page 200; C-40 HTTP smoke OK; no VPS |
| 5 | Client | приёмка | [x] | 2026-09-21 — UX contract OK; ПРИНЯТО С ЗАМЕЧАНИЯМИ (mock / live token) |

Skills: `content-factory-ui`, `baseline-ui`, `client-scenarios` (Tester/Client).  
**Не звать:** Backend (done C-39), AI Bridge, Motion (default skip), Coder monolith.
