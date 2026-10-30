# Decisions — C-08

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(wave local)_ | После Done C-07 FE+Motion / старт C-08 |
| **after_sha** | | После закрытия |

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Orchestrator | Волна W-2026-09-18-sprint3 |
| 2026-09-18 | Architect | Spec+chain: FE — `components/mesh/nodes/*` (agent/router/queue/hitl) + `lib/mesh-seed.ts`; wire `nodeTypes` в `AgentMeshCanvas.tsx`. |
| 2026-09-18 | Architect | Seed order lock: Researcher → Hook → Script → Router → Queue → Designer → HITL → Publisher → Analyst. Queue/HITL metrics — **mock**, не live BullMQ. |
| 2026-09-18 | Architect | nodeType keys: `agent` \| `router` \| `queue` \| `hitl`. Edges default until C-09 `pulse`. |
| 2026-09-18 | Architect | Chain: Frontend → Motion → Tester → Fixer → Deployer → Client. Start FE only after C-07 FE+Motion Done. No parallel with C-09 on canvas/seed. |
| 2026-09-18 | Architect | Do not recreate page RBAC; do not add PulseEdge/TopBar in C-08. |
| 2026-09-18 | Motion | Light hover on Agent/Router/Queue/HITL: `y: -2` + shadow via framer spring; Handles stay outside `motion.div` so ReactFlow connect works. Reduced-motion disables hover. |

## Rollback plan

1. `git checkout <before_sha> -- components/mesh/nodes lib/mesh-seed.ts components/mesh/AgentMeshCanvas.tsx`.
2. `status.md` → `rolled_back`; строка в `_index.md`.
3. Папку `memory/tickets/C-08-mesh-custom-nodes/` **не удалять**.
4. Localhost пересобрать / синхронизировать по `docs/AGENT_SYNC_TO_APP.md`.
