# Chain — C-124 (mesh static picture)

> **Path lock #3a** — один mesh Frontend проход вместе с **C-125**.  
> **Запрет:** parallel FE на тех же files отдельно от C-125.

**Shared paths with C-125:**

```
components/mesh/AgentMeshCanvas.tsx
lib/mesh-seed.ts
components/mesh/nodes/AgentNode.tsx
components/mesh/nodes/AgentProfessionAvatar.tsx
components/mesh/edges/PulseEdge.tsx
components/mesh/AgentPropertiesPanel.tsx
```

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | shared mesh paths (+ C-125 locks) | [x] | Strip playground chrome; fixed layout; keep panel. **Same pass as C-125** |
| 2 | Motion | PulseEdge dashed + density + barbell | [x] | solid quiet; dashed breathe 2.6s; barbell spring; density stroke/label |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `guards.md` C-124 + C-125 | [x] | static PASS; S33 overlap/clicks → Client |
| 5 | Fixer | _(если красное)_ | [ ] | no architecture change |
| 6 | Deployer | localhost | [ ] | wave end |
| 7 | Client | S33 | [ ] | Playwright clicks — не screenshot-only |

**Wave order:** C-122 → C-123 → **C-124+C-125 (один FE)** → C-126 → …
