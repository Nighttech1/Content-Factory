# C-124 — Mesh static pipeline picture

| Field | Value |
|-------|-------|
| **ID** | `C-124` |
| **Priority** | P0 |
| **Area** | mesh_team_release |
| **Wave** | `W-2026-10-10-vernatun-ui` |
| **Status file** | pending |

## Repro

1. OWNER → `/admin/mesh` («Команда выпуска»).
2. UX ощущается как free xyflow playground: MiniMap / Controls / Dots board; overlap / «каша» линий возможны.
3. Клиент Hard REJECT #8 при приёмке «скрином без S33».

**URL:** `http://127.0.0.1:8787/admin/mesh` (OWNER)

## Expected

Статичная **картинка пайплайна**: фиксированный layout, без drag-перекрытий, достаточные gaps, handoff labels не клипаются. `AgentPropertiesPanel` по клику сохранить. Нет MiniMap/Controls/Dots-playground.

## Actual

`AgentMeshCanvas` с Background Dots + Controls + MiniMap (playground feel).

## Notes for Orchestrator

Один mesh path с **C-125** — один Frontend проход. См. dual-lane в C-125.
