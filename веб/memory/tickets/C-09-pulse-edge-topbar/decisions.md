# Decisions — C-09

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(wave local)_ | После Done C-08 FE+Motion / старт C-09 |
| **after_sha** | | После закрытия |

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Orchestrator | Волна W-2026-09-18-sprint3 |
| 2026-09-18 | Architect | Spec+chain: FE — `PulseEdge.tsx` + `CanvasTopBar.tsx`; wire `edgeTypes.pulse` + TopBar в canvas; seed edges → `type: 'pulse'`. |
| 2026-09-18 | Architect | TopBar mock lock: Active Jobs `4`, Avg Latency `180ms`, GPU Cluster `Active`. |
| 2026-09-18 | Architect | `[+ Add Pipeline Module]` → append mock AgentNode in local React state; **no** Module SDK modal / live metrics / SSE. |
| 2026-09-18 | Architect | Add Module placement: prefer free-floating new node (FE may optionally link to Analyst — log in decisions if chosen). |
| 2026-09-18 | Architect | Chain: Frontend → Motion → Tester → Fixer → Deployer → Client. Motion owns cobalt pulse + TopBar feedback; `useReducedMotion` → static edge. |
| 2026-09-18 | Architect | Start FE only after C-08 FE+Motion Done. Last FE ticket in Sprint 3 wave. |
| 2026-09-18 | Motion | Pulse: CSS `.mesh-pulse-edge` dash+opacity; `prefers-reduced-motion` → static. TopBar soft enter + Add button `whileHover`/`whileTap` spring. Seed/RBAC untouched. |

## Rollback plan

1. `git checkout <before_sha> -- components/mesh/edges components/mesh/CanvasTopBar.tsx components/mesh/AgentMeshCanvas.tsx lib/mesh-seed.ts`.
2. `status.md` → `rolled_back`; строка в `_index.md`.
3. Папку `memory/tickets/C-09-pulse-edge-topbar/` **не удалять**.
4. Localhost пересобрать / синхронизировать по `docs/AGENT_SYNC_TO_APP.md`.
