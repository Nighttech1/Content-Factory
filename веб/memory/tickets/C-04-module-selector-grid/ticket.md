# C-04 — ModuleSelectorGrid

| Field | Value |
|-------|-------|
| **ID** | `C-04` |
| **Priority** | P0 |
| **Area** | shell_nav / studio |
| **Status file** | [status.md](status.md) |

## Repro

1. `/studio` показывает placeholder Sprint 1 без сетки модулей.

**URL:** `http://127.0.0.1:3000/studio`

## Expected

- 4 карточки модулей: Carousel 4:5, Infographics, Cartoon Reels, HeyGen Avatar.
- 5-я карточка с пунктирной рамкой `[+ Добавить модуль]` (UI-заглушка).
- Выбор модуля в zustand `studio-store`.
- Dark Luxury / GlassCard aesthetic; Stitch Launchpad composition.

## Actual

Нет ModuleSelectorGrid.

## Notes for Orchestrator

Зона: Frontend → Motion (hover). Backend не нужен.
