# C-137 — status

| Role | Done | Notes |
|------|------|-------|
| Frontend | [x] | Clean-slate `components/mesh/v2/*` + zustand Agent store; legacy AgentMeshCanvas / PulseEdge / AgentPropertiesPanel / Router·Queue·HITL nodes deleted; page mounts `ReleaseTeamFlowchart`; arrow markers + agent() TS fix |
| Motion | [x] | Drawer open/close `x` 160ms ease-out; reduceMotion → duration 0; node select glow calm (no pulse); MiniMap not restored |
| Backend | [ ] | mock store OK (localStorage + pack overrides) |
| Tester | [x] | static PASS 2026-10-10; guards.md; Playwright S37 HARD pending Client |
| Fixer | [ ] | |
| Deployer | [ ] | |
| Client | [ ] | S37 HARD |

## Frontend deliverable

- Entry: `/studio/[moduleId]/mesh` → `ReleaseTeamFlowchart` (OWNER; ADMIN redirected)
- Inspector: click agent node → drawer (`data-testid=agent-inspector-drawer`); Esc / outside / X close
- Save mutates zustand + `localStorage` `cf.mesh.agents.v1:<pipeline>` + pack overrides
- Shared Settings enums: `lib/mesh-roles.ts` (catalog imports updated)
- `lib/mesh-seed.ts` = thin shim (`createMeshSeed` → new flowchart) for old smoke scripts

## File structure (new)

```
types/mesh-agent.ts
lib/mesh-roles.ts
lib/mesh/agent-defaults.ts
lib/mesh/agent-store.ts
lib/mesh/flowchart-graph.ts
components/mesh/v2/ReleaseTeamFlowchart.tsx
components/mesh/v2/FlowAgentNode.tsx
components/mesh/v2/FlowEdge.tsx
components/mesh/v2/AgentInspectorDrawer.tsx
components/mesh/CanvasTopBar.tsx          (kept — title + MultiButton chrome)
components/mesh/MeshPipelineSwitcher.tsx  (navigates /studio/:id/mesh)
components/mesh/nodes/AgentProfessionAvatar.tsx
```

## Deleted (legacy primary path)

- `components/mesh/AgentMeshCanvas.tsx`
- `components/mesh/AgentPropertiesPanel.tsx`
- `components/mesh/edges/PulseEdge.tsx` (+ empty edges/)
- `components/mesh/nodes/{AgentNode,HITLNode,QueueNode,RouterNode}.tsx`

## How to open inspector

1. Open `/studio/carousel-engine/mesh` (OWNER session).
2. Click any agent node on the flowchart (`data-testid=mesh-agent-node`).
3. Right drawer slides in (`data-testid=agent-inspector-drawer`) with typed fields.
4. Close: Esc, click outside drawer (not on another node), or X.

## 21st

`21st=reuse` — NeonBadge + AgentProfessionAvatar + CanvasTopBar / MultiButton (already adapted Dark Luxury). Drawer = framer-motion translateX on elevated glass panel.
