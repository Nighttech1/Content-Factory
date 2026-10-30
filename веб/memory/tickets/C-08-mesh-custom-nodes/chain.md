# Chain — C-08

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` с C-07/C-09 на `AgentMeshCanvas.tsx` / `lib/mesh-seed.ts`.  
> Старт Frontend C-08 **только после** Done Frontend+Motion C-07. Backend / BullMQ live / SSE — **нет**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/mesh/nodes/*` (AgentNode, RouterNode, QueueNode, HITLNode), `lib/mesh-seed.ts`, `components/mesh/AgentMeshCanvas.tsx` (wire `nodeTypes` + seed) | [x] | Seed: Researcher→Hook→Script→Router→Queue→Designer→HITL→Publisher→Analyst; default edges; skill `xyflow-agent-mesh`; **не** PulseEdge/TopBar |
| 2 | Motion | `components/mesh/nodes/*` | [x] | hover / status micro-motion; spring `{ damping: 25, stiffness: 300 }`; reduced-motion |
| 3 | Tester | `memory/tickets/C-08-mesh-custom-nodes/guards.md` | [x] | 4 nodeTypes; seed order; visual nodes on canvas; RBAC regress; anti-slop |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [x] | N/A — Tester GREEN |
| 5 | Deployer | localhost `:3000` | [x] | `/admin/mesh`; не VPS |
| 6 | Client | приёмка C-08 | [x] | кастомные ноды + seed; Pulse/TopBar — C-09 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** после Done Frontend+Motion C-08 → Оркестратор стартует C-09 Frontend. Не параллелить C-08 FE с C-09 FE.
