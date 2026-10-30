# Chain — C-59

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-57 → C-58 → **C-59**.  
> **Старт после C-58.** AI Bridge **перед** Frontend: FE импортирует `RazborAgentId` + designer messages.  
> Не трогать `SidebarNavigation` / `menu-vertical` / mesh add-module (уже C-57/58). Header count карусели не откатывать на `"…"`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | AI Bridge | `lib/studio/carousel-draft-types.ts` (`RazborAgentId` + `RAZBOR_AGENTS`: designer, publisher tab), `lib/studio/razbor-pipeline.ts` (`buildDesignerMessages`, `applyDesignerChatRevision`, cascade payload + draft; **нет** publisher chat/prompt), optional packs `agents/` если копируют cascade | [x] | carousel-engine only; upsertDraft allowed from razbor; prompt-engineering; mock slide mutate |
| 2 | Frontend | `components/studio/workspace/RazborModal.tsx`, optional `components/studio/workspace/RazborCarouselToggle.tsx`, `components/studio/GenerationDrawer.tsx` (`AgentChatComposer` reuse), `components/ui/*datetime*` (21st), `components/ui/animated-file-tree.tsx` (**новый**, `cn` from `@/lib/cn`), `components/schedule/ScheduleModuleRail.tsx`, wire `useCarouselDraftsStore.upsertDraft`, `lib/schedule/storage.ts` (reuse `cf.schedule.v1`) | [x] | CTA сценариста «Отправить публицисту»; publisher **без** composer; toggle наша/чужая; TreeView модули+посты; mic только AgentChatComposer |
| 3 | Motion | Razbor toggle + publisher datetime enter; `animated-file-tree.tsx` / rail | [x] | spring `{ damping: 25, stiffness: 300 }`; reduced-motion |
| 4 | Tester | `memory/tickets/C-59-voice-designer-publisher-tree/guards.md`; S11; сузить C-51 «no Designer» до non-carousel | [x] | carousel has Designer+publisher datetime; other modules C-51; no second SpeechRecognition; schedule tree |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical; не publish; не Designer на graphics |
| 6 | Deployer | localhost `/studio/carousel-engine`, `/studio/aesthetic-graphics`, `/schedule` | [x] | no VPS |
| 7 | Client | приёмка | [ ] | S11 + visual critic Razbor/schedule |

Skills: `content-pipeline-agents`, `prompt-engineering`, `ai-bridge`, `content-factory-ui`, `21st-ui-catalog`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, Coder monolith, WebGL, Deployer VPS.
