# Chain — C-53

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-52 → **C-53** → C-54.  
> **Старт только после Done Frontend+Motion C-52** на `FeedPostCard` / `VerticalPostCarousel` / `StudioModuleWorkspace`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/StudioModuleWorkspace.tsx` (`showDraftsButton` / `showRazborButton` / `RazborModal` ungate), `components/studio/workspace/VerticalPostCarousel.tsx` / `FeedPostCard.tsx` только если проп-wiring, `components/studio/workspace/RazborModal.tsx` + `RazborReelPlayer.tsx` (play via C-52 helper), `app/admin/mesh/page.tsx`, `components/mesh/AgentMeshCanvas.tsx`, `lib/mesh-seed.ts` (`createMeshSeed(pipelineId)`), optional switcher рядом с `CanvasTopBar.tsx` (**не** обязательный RU KPI — это C-54) | [x] | All-modules drafts+razbor; 7 xyflow pipelines; reuse RazborModal; **no new agents** |
| 2 | Motion | `AgentMeshCanvas.tsx`, `components/mesh/edges/PulseEdge.tsx` (reuse), pipeline tab enter | [x] | PulseEdge на каждом пайплайне; reduced-motion; **WebGL не звать** |
| 3 | Tester | `memory/tickets/C-53-workspace-mesh-parity/guards.md`; `scripts/smoke-c31-capcut-gate.ts` (убрать «Razbor only carousel»); S3/S8 | [x] | ≥2 non-carousel modules; mesh per-type; ADMIN deny mesh |
| 4 | Fixer | _(если красное)_ | [x] | mesh-seed node labels RU; не universal Router |
| 5 | Deployer | localhost `/studio/aesthetic-graphics`, `/studio/cartoon-reels`, `/admin/mesh` (OWNER) | [x] | 2026-10-06 — all listed routes HTTP 200 (mesh 200 after follow); no VPS |
| 6 | Client | приёмка | [ ] | S8 + S3 per-type mesh |

Skills: `content-factory-ui`, `xyflow-agent-mesh`, `content-pipeline-agents` (reuse only), `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge (стартовый chain), Coder monolith, WebGL.  
Если welcome=null без carousel fixture — **стоп → Архитектор** (возможен AI Bridge mid-flight), не патчить прод «новыми агентами».
