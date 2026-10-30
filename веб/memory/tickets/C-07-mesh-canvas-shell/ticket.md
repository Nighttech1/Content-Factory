# C-07 — ReactFlow mesh canvas shell

| Field | Value |
|-------|-------|
| **ID** | `C-07` |
| **Priority** | P0 |
| **Area** | admin_mesh |
| **Status file** | [status.md](status.md) |

## Repro

1. `/admin/mesh` — placeholder без @xyflow/react.

**URL:** `http://127.0.0.1:3000/admin/mesh`

## Expected

- ReactFlow infinite canvas, dark Dots background.
- Controls (zoom/pan) + MiniMap.
- Full-bleed layout under AppShell; OWNER gate preserved.
- Import xyflow CSS; Dark Luxury tokens.

## Actual

Placeholder text only.

## Notes for Orchestrator

Frontend + skill xyflow-agent-mesh. Seed nodes deferred to C-08.
