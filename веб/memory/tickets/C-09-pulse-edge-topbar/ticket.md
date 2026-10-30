# C-09 — PulseEdge + Canvas TopBar

| Field | Value |
|-------|-------|
| **ID** | `C-09` |
| **Priority** | P1 |
| **Area** | admin_mesh |
| **Status file** | [status.md](status.md) |

## Repro

1. Нет анимированных edges и TopBar KPI / Add Module.

**URL:** `http://127.0.0.1:3000/admin/mesh`

## Expected

- PulseEdge: bezier + cobalt gradient pulse.
- TopBar: Active Jobs, Avg Latency, GPU Cluster (mock).
- `[+ Add Pipeline Module]` adds a mock AgentNode to the graph (no SDK modal).

## Actual

Нет PulseEdge / TopBar.

## Notes for Orchestrator

Frontend → Motion. Regress RBAC ADMIN→studio.
