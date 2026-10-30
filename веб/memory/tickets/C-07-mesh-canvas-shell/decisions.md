# Decisions — C-07

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(wave local)_ | Старт волны W-2026-09-18-sprint3 |
| **after_sha** | | После закрытия |

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Orchestrator | Волна W-2026-09-18-sprint3 |
| 2026-09-18 | Architect | Spec+chain: FE создаёт `components/mesh/AgentMeshCanvas.tsx` (ReactFlow + Dots + Controls + MiniMap) + mount в `app/admin/mesh/page.tsx`; **сохранить** ADMIN→`/studio`. CSS `@xyflow/react/dist/style.css`. |
| 2026-09-18 | Architect | Path lock: C-07 → C-08 → C-09 sequential FE; shared canvas/page/seed — **запрет** parallel. Backend/BullMQ/SSE out of wave. |
| 2026-09-18 | Architect | Chain: Frontend → Motion → Tester → Fixer → Deployer → Client. Motion: лёгкий entrance only; PulseEdge отложен на C-09. |
| 2026-09-18 | Architect | Out of scope C-07: nodes/*, mesh-seed, PulseEdge, CanvasTopBar. Empty/default graph OK. |
| 2026-09-18 | Motion | Soft enter on canvas shell (`motion.div`): opacity 0→1, y 8→0, spring `{ damping: 25, stiffness: 300 }`; `useReducedMotion` → instant. No pulse/edges. |

## Rollback plan

1. `git checkout <before_sha> -- components/mesh/AgentMeshCanvas.tsx app/admin/mesh/page.tsx` (и связанные CSS-импорты).
2. `status.md` → `rolled_back`; строка в `_index.md`.
3. Папку `memory/tickets/C-07-mesh-canvas-shell/` **не удалять**.
4. Localhost пересобрать / синхронизировать по `docs/AGENT_SYNC_TO_APP.md`.
