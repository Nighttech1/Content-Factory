# Chain — C-07

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` с C-08/C-09 на `AgentMeshCanvas.tsx` / `app/admin/mesh/page.tsx`.  
> Старт Frontend C-07 первым в волне Sprint 3. Backend / AI Bridge / BullMQ / SSE — **нет**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/mesh/AgentMeshCanvas.tsx` (create shell), `app/admin/mesh/page.tsx` (mount + **keep** OWNER gate), xyflow CSS import (`@xyflow/react/dist/style.css`) | [x] | ReactFlow + Dots + Controls + MiniMap; empty/default nodes/edges; **не** nodes/* / seed / PulseEdge / TopBar; skill `xyflow-agent-mesh` |
| 2 | Motion | `components/mesh/AgentMeshCanvas.tsx` | [x] | лёгкий entrance / reduced-motion; **не** pulse edges; spring `{ damping: 25, stiffness: 300 }` |
| 3 | Tester | `memory/tickets/C-07-mesh-canvas-shell/guards.md` | [x] | OWNER canvas mount; ADMIN→`/studio`; anti-slop; regress Sidebar ownerOnly |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [x] | N/A — Tester GREEN |
| 5 | Deployer | localhost `:3000` | [x] | `/admin/mesh` HTTP 200; не VPS |
| 6 | Client | приёмка C-07 | [x] | холст + S3 RBAC; полная картинка mesh после C-08/C-09 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** после Done Frontend+Motion C-07 → Оркестратор стартует C-08 Frontend. Не параллелить C-07 FE с C-08/C-09 FE.
