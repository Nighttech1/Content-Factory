# Chain — C-141 (pan + center ports + no Copy TZ)

> **Same Frontend pass as C-140** (path lock 1).

**One-liner:** Frontend (C-141+C-140) → Motion? → Tester → Fixer → Deployer → Client **S37+S39**

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | Pan LMB/touch + threshold; `Port`/`drawConnections` center-Y; **REMOVE** Copy TZ from `CanvasTopBar`; **same pass C-140** | [x] | `xyflow-agent-mesh`; no ReactFlow |
| 2 | Motion | optional pan cursor / reduceMotion | [ ] | `web-motion-engine` |
| 3 | Tester | `memory/tickets/C-141-mesh-pan-ports-no-copy-tz/guards.md` | [ ] | no `mesh-copy-tz`; center ports; pan |
| 4 | Fixer | _(если красное)_ | [ ] | surgical |
| 5 | Deployer | localhost | [ ] | mesh 200 OWNER |
| 6 | Client | **S37+S39** | [ ] | Playwright @1440 |

**Wave order:** path 1 → C-142 → C-144→C-143 → C-145.
