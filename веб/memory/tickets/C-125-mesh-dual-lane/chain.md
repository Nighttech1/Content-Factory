# Chain — C-125 (mesh dual-lane)

> **Path lock #3b** — **тот же mesh path что C-124**. Один Frontend проход.  
> Не запускать отдельный FE parallel на `AgentMeshCanvas` / `mesh-seed`.

См. shared paths: `memory/tickets/C-124-mesh-static-picture/chain.md`

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | same as C-124 + dual-lane locks | [x] | User lane; Scout→Analyst→Trainer; dashed; barbell; Scout≠Trainer panel |
| 2 | Motion | `PulseEdge` dashed + density + barbell badge | [x] | dashed calm opacity; solid no dash noise; barbell appear spring; reduceMotion static |
| 3 | Backend | — | [ ] | mock OK |
| 4 | Tester | guards C-125 / S33 | [x] | static PASS; S33 HARD → Client |
| 5 | Fixer | _(если красное)_ | [ ] | |
| 6 | Deployer | localhost | [ ] | |
| 7 | Client | **S33 HARD** | [ ] | Playwright: Scout + Trainer + assert; screenshot-only = REJECT |

**Wave order:** … → **C-124+C-125** → C-126 → …
