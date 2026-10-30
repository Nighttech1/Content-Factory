# C-05 — FloatingCommandBar + Generate Draft

| Field | Value |
|-------|-------|
| **ID** | `C-05` |
| **Priority** | P0 |
| **Area** | studio |
| **Status file** | [status.md](status.md) |

## Repro

1. Нет командной строки и кнопки Generate Draft на `/studio`.

**URL:** `http://127.0.0.1:3000/studio`

## Expected

- Центрированный input: «Введите тему, тезис или ссылку на тренд...»
- Чипсы: Тренд недели, Ереванский сленг, Дебаты/Спор, Для начинающих.
- Кнопка `Generate Draft` с динамическим градиентным бордером.
- Generate открывает GenerationDrawer и запускает mock pipeline (связка с C-06).

## Actual

Нет FloatingCommandBar.

## Notes for Orchestrator

Зона: Frontend. Жёсткая связь с C-06.
