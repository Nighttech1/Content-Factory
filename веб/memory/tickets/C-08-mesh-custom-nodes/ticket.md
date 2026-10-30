# C-08 — Custom mesh nodes + seed graph

| Field | Value |
|-------|-------|
| **ID** | `C-08` |
| **Priority** | P0 |
| **Area** | admin_mesh |
| **Status file** | [status.md](status.md) |

## Repro

1. Нет AgentNode / RouterNode / QueueNode / HITLNode.

**URL:** `http://127.0.0.1:3000/admin/mesh`

## Expected

- nodeTypes: AgentNode, RouterNode, QueueNode, HITLNode (name, status, task count / queue metrics / HITL wait).
- Seed graph: Researcher → Hook → Script → Router → Queue → Designer → HITL → Publisher → Analyst.
- Dark Luxury glass aesthetic.

## Actual

Нет кастомных нод.

## Notes for Orchestrator

Frontend after C-07 shell. Edges default until C-09 PulseEdge.
