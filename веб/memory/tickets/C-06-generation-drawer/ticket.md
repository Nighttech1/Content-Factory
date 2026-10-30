# C-06 — GenerationDrawer mock pipeline

| Field | Value |
|-------|-------|
| **ID** | `C-06` |
| **Priority** | P1 |
| **Area** | studio |
| **Status file** | [status.md](status.md) |

## Repro

1. Generate Draft не открывает drawer / шаги агентов не меняются (Hard REJECT S1).

**URL:** `http://127.0.0.1:3000/studio`

## Expected

- Slide-over справа (framer-motion).
- Шаги: Researcher → Hook Writer → Script Writer → Designer с живым текстом статуса.
- Progress-bar с импульсом.
- Mock таймеры (~1–2 с/шаг); UI меняется без перезагрузки. Без реального SSE.

## Actual

Нет GenerationDrawer.

## Notes for Orchestrator

Зона: Frontend → Motion. Критерий Клиента S1.
