# Chain — C-62

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-60 → C-61 → **C-62**.  
> **Старт после C-61.** Не трогать `SidebarNavigation` / `AppShell` / glow-button / search `useCallback` / header opacity (уже C-61).  
> `VerticalPostCarousel.tsx` — **только** прокидка `aspectRatio`/`layout`/`moduleId` в `DraftsPanel`, без отката SWR/pulse.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/workspace/RazborModal.tsx` (CTA сценарист→designer; hydrate `previewDraft`; hide scrollbar pane), `components/studio/workspace/RazborCarouselToggle.tsx` (белый active; Наши disabled), `components/studio/workspace/DraftsPanel.tsx` (карточки = aspect FeedPostCard; L/R; дата из `cf.schedule.v1`), optional `VerticalPostCarousel.tsx` (пропсы в DraftsPanel), `lib/schedule/storage.ts` (**reuse** `slotForPost` / `formatSlotLabelRu`) | [x] | testid `razbor-send-designer`; designer `razbor-send-publisher-designer`; 21st=unavailable → luxury hide-scrollbar + L/R cards |
| 2 | Motion | toggle pill; draft L/R; reduced-motion | [ ] | spring `{ damping: 25, stiffness: 300 }` |
| 3 | Tester | `memory/tickets/C-62-razbor-drafts-carousel/guards.md`; S14; обновить C-59 guards (сценарист больше не `razbor-send-publisher`) | [x] | guards PASS; C-59 G6 supersede; no Fixer |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical; не publish; не Designer на graphics |
| 5 | Deployer | localhost `/studio/carousel-engine` Razbor + вкладка Черновики | [x] | :3000; carousel-engine 200; awaiting Client S14 |
| 6 | Client | приёмка | [ ] | S14 |

Skills: `content-pipeline-agents`, `content-factory-ui`, `21st-ui-catalog`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
