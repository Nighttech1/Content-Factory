# Chain — C-139 (static flowchart)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Includes C-138** chrome work in same Frontend pass (one mesh path).  
> **Запрет** parallel FE на mesh; **запрет** оставлять ReactFlow рядом со static.

**One-liner:** Frontend → Motion → Tester → Fixer → Deployer → Client **S37 HARD**

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | Replace ReactFlow `ReleaseTeamFlowchart` with **STATIC** HTML/CSS/SVG shell; **DELETE/stop** `FlowEdge` / `FlowAgentNode`; dual-lane + labels + dashed no-text; User accordion; Designer `design.md` chip; rewrite `AgentInspectorDrawer` 3 tabs; extend `types/mesh-agent.ts` + `agent-store` (`plugins`/`mcp`, maxTokens, no timeout/rules UI); Copy TZ clipboard+toast; **C-138** remove/delete `MeshPipelineSwitcher` + Multibutton chrome; route `/studio/[moduleId]/mesh` | [x] | skills `xyflow-agent-mesh` STATIC + `content-factory-ui`; эталон `code_artifact.html` |
| 2 | Motion | SVG dashflow on Trainer→release; User accordion transition; drawer open/close; reduceMotion | [x] | drawer translateX 160ms; accordion max-h 280ms; `.flow-dashed` 1.8s; reduceMotion instant; **not** PulseEdge / xyflow |
| 3 | Tester | `memory/tickets/C-139-static-flowchart/guards.md` (+ C-138 chrome asserts) | [ ] | static graph + tabs + accordion; S37 HARD prep |
| 4 | Fixer | _(если красное)_ | [ ] | surgical; no architecture rewrite |
| 5 | Deployer | localhost | [ ] | mesh 200 OWNER; sync local API if any |
| 6 | Client | **S37 HARD** | [ ] | Playwright @1440 full clicks — not screenshot-only |

**Порядок волны:** Frontend **C-138+C-139** → Motion → Tester → Fixer → Deployer → Client.
