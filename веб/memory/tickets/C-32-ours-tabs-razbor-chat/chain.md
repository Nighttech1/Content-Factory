# Chain — C-32

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-30 done.  
> **Порядок волны:** **C-32** → C-33 → C-34.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/studio/razbor-pipeline.ts` (analyst messages; remove proposeScenario from analyst surface; keep cascade) | [x] | Analysis-only copy; **no DB**; Mock LLM OK |
| 2 | Frontend | `components/studio/workspace/VerticalPostCarousel.tsx`, `DraftsPanel.tsx` (inline refactor or replace), `RazborModal.tsx`, `AgentChatComposer.tsx` (new), related workspace types/tests ids | [x] | Tabs inline; composer text+Web Speech; no popup dialog |
| 3 | Motion | Ours tabs + composer affordance (optional light) | [x] | Tab pill layoutId + composer tap/pulse; reduced-motion |
| 4 | Tester | `memory/tickets/C-32-ours-tabs-razbor-chat/guards.md` | [ ] | Tabs inline; analyst no scenario pitch; composer+mic degrade |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical only |
| 6 | Deployer | localhost | [ ] | After green; no VPS |
| 7 | Client | приёмка | [ ] | After deploy |

Skills: `backend`, `content-factory-ui`, `content-pipeline-agents`, `web-motion-engine`. AI Bridge — **не** в chain.
