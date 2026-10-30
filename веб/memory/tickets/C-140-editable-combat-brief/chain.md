# Chain — C-140 (editable combat brief)

> **Same Frontend pass as C-141** (path lock 1).  
> **Запрет** parallel FE на `components/mesh/**`.

**One-liner:** Frontend (C-141+C-140) → Motion? → Tester → Fixer → Deployer → Client **S37+S39**

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | Brief store per pipeline; combat templates; User textarea; wire `RazborModal` / `AgentChatComposer` → topic+brief; **same pass C-141** | [x] | skills `xyflow-agent-mesh`, `content-pipeline-agents` |
| 2 | Motion | _(optional)_ accordion open | [ ] | only if FE asks |
| 3 | Tester | `memory/tickets/C-140-editable-combat-brief/guards.md` | [ ] | persist + send payload |
| 4 | Fixer | _(если красное)_ | [ ] | surgical |
| 5 | Deployer | localhost | [ ] | mesh + studio |
| 6 | Client | **S37+S39** | [ ] | Playwright @1440 |

**Wave order:** path 1 (C-141+C-140) → path 2 (C-142) → path 3 (C-144→C-143) → path 4 (C-145).
