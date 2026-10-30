# Guards — C-124

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | No MiniMap / Controls / Background Dots; `nodesDraggable={false}`; no `onConnect` | `components/mesh/AgentMeshCanvas.tsx` |
| static | Fixed seed coords; solid canvas `#08090A` | `lib/mesh-seed.ts`, `AgentMeshCanvas.tsx` |
| localhost | OWNER `/admin/mesh`: `[data-testid="agent-mesh-canvas"]`; no xyflow minimap/controls UI; click agent → panel; Esc closes | Playwright S33 (with C-125) |
| regression | No `mesh-add-module`; panel width persist `cf.mesh.agent-panel.width` | C-58 guards |

## Localhost asserts (Playwright / Client)

1. Login OWNER → `http://127.0.0.1:8787/admin/mesh`
2. `expect(page.getByTestId('agent-mesh-canvas')).toBeVisible()`
3. `expect(page.locator('.react-flow__minimap')).toHaveCount(0)`
4. `expect(page.locator('.react-flow__controls')).toHaveCount(0)`
5. Canvas не Dot-grid playground (solid dark bg)
6. Click release agent node → `[data-testid="agent-properties-panel"]` or scout/trainer sections visible; Esc → closed
7. **0 overlap** bounding boxes @1440 (visual / geometry — Client S33)

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | No MiniMap/Controls/Background imports | PASS |
| G2 | nodesDraggable false; no onConnect | PASS |
| G3 | mesh-static-picture class / solid bg | PASS |
| G4 | Lane Y separation A=48 B=320 (no literal overlap in seed) | PASS (code) |
| G5 | Playwright overlap + S33 clicks | pending Client |

## Mirror in Client skill

`| C-124 | mesh xyflow playground | static picture no minimap | memory/tickets/C-124-mesh-static-picture/guards.md |`
