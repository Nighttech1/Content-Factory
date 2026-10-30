# C-03 — GlassCard / NeonBadge / ReactiveButton

| Field | Value |
|-------|-------|
| **ID** | `C-03` |
| **Priority** | P1 |
| **Area** | shell_nav / design_system |
| **Status file** | [status.md](status.md) |

## Repro

1. Нет UI-примитивов Design System.
2. На Studio нет демо-зоны для приёмки примитивов.

**URL:** `http://127.0.0.1:3000/studio`

## Expected

- `GlassCard`: backdrop-blur-md + микро-бордер.
- `NeonBadge`: статусы с мягким внешним свечением.
- `ReactiveButton`: тактильный press + анимированная подсветка границы.
- Демо на `/studio` внутри shell; spring Motion `{ damping: 25, stiffness: 300 }`.

## Actual

Примитивов нет.

## Notes for Orchestrator

Зона: Frontend → Motion.
