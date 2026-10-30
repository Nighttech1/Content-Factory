# Chain — C-09

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` с C-07/C-08 на `AgentMeshCanvas.tsx` / `lib/mesh-seed.ts`.  
> Старт Frontend C-09 **только после** Done Frontend+Motion C-08. Backend / BullMQ live / SSE — **нет**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/mesh/edges/PulseEdge.tsx`, `components/mesh/CanvasTopBar.tsx`, `components/mesh/AgentMeshCanvas.tsx` (`edgeTypes` + TopBar + nodes state for Add), `lib/mesh-seed.ts` (edges `type: 'pulse'`) | [x] | mock KPI; Add Module → mock AgentNode; skill `xyflow-agent-mesh`; **не** SDK modal / live BullMQ |
| 2 | Motion | `components/mesh/edges/PulseEdge.tsx`, `components/mesh/CanvasTopBar.tsx` | [x] | cobalt pulse + TopBar/button feedback; spring `{ damping: 25, stiffness: 300 }`; reduced-motion → static edge |
| 3 | Tester | `memory/tickets/C-09-pulse-edge-topbar/guards.md` | [x] | PulseEdge present; TopBar metrics; Add Module mutates graph; ADMIN→`/studio`; anti-slop; regress C-07/C-08 |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [x] | N/A — Tester GREEN |
| 5 | Deployer | localhost `:3000` | [x] | `/admin/mesh` готов к Клиенту; не VPS |
| 6 | Client | приёмка C-09 + волна Sprint 3 | [x] | полный mesh checklist; S3 RBAC |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** C-09 — последний FE-тикет Sprint 3 в этой волне. После Client — стоп-отчёт Оркестратора.
