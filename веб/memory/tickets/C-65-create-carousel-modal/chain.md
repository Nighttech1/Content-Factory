# Chain — C-65

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **После C-64** (stack 9:16 уже в workspace). **Перед C-63** на тех же workspace-строках Create/desc.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-07-ux-wave-grade.md` | [x] | Grade A |
| 1 | Architect | `architect-spec.md`, этот `chain.md` | [x] | Spec only |
| 2 | Frontend | `components/studio/workspace/CreateCarouselModal.tsx` (new), `components/studio/StudioModuleWorkspace.tsx` (hide long desc + «Создать карусель» + open state) | [x] | Separate from RazborModal; AgentChatComposer; 9:16 preview L/R; **не** FeedPostCard/fixtures/AppShell |
| 3 | Motion | modal enter/exit; preview L/R; reduced-motion | [x] | spring `{ damping: 25, stiffness: 300 }` in CreateCarouselModal |
| 4 | Tester | `memory/tickets/C-65-create-carousel-modal/guards.md`; S15 Create path | [x] | Static smoke GREEN; CreateCarouselModal + CTA + desc hidden |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical |
| 6 | Deployer | localhost `/studio/carousel-engine` | [x] | 2026-10-07 — `/studio/carousel-engine` HTTP 200; no VPS |
| 7 | Client | acceptance | [x] | Create modal dual pane |

Skills: `content-factory-ui`, `content-pipeline-agents`, `21st-ui-catalog`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
