# Chain — C-138 (mesh no MultiButton)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Same path as C-139** — Frontend может закрыть C-138 внутри одного pass с C-139.  
> **Запрет** parallel FE на `components/mesh/**`.

**One-liner:** Frontend → Motion → Tester → Fixer → Deployer → Client **S37**

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | Unmount `MeshPipelineSwitcher` from mesh page/flowchart; simplify `CanvasTopBar` (title+subtitle+Copy TZ only); **DELETE** `components/mesh/MeshPipelineSwitcher.tsx` if orphaned; grep-ban MultiButton on `/studio/[moduleId]/mesh` | [x] | skill `content-factory-ui` + `xyflow-agent-mesh` C-138; may land in same commit as C-139 |
| 2 | Motion | Copy-button / top-bar micro-feedback only if needed | [x] | CanvasTopBar toast already; primary Motion = C-139; no xyflow/MultiButton |
| 3 | Tester | `memory/tickets/C-138-mesh-no-multibutton/guards.md` | [ ] | assert no Multibutton/Switcher in mesh tree; S37 chrome clause |
| 4 | Fixer | _(если красное)_ | [ ] | surgical; no architecture rewrite |
| 5 | Deployer | localhost | [ ] | mesh 200 OWNER; sync local API if any |
| 6 | Client | **S37 HARD** (chrome + static after C-139) | [ ] | Playwright @1440 — not screenshot-only |

**Порядок волны:** Frontend **C-138 → C-139** (one path) → Motion → Tester → Fixer → Deployer → Client.
