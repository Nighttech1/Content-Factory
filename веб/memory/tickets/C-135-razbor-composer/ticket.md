# C-135 — Razbor chrome: long input + 3 actions + red X

| Field | Value |
|-------|-------|
| **ID** | `C-135` |
| **Priority** | P1 |
| **Area** | razbor |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | pending |
| **[MKT]** | Композер разбора как в скетче: длинный ввод, 3 кнопки справа, круглый красный X |

## Repro

1. Открыть Razbor modal.
2. Chat input короткий / кнопки не кластером справа; close = прямоугольная «Закрыть».

**URL:** `http://127.0.0.1:8787/studio/<moduleId>` → Razbor

## Expected

Длинный chat input; **3** action buttons справа от input (send/reply-style cluster); close = **circular red X** (не rectangular «Закрыть»).

## Actual

Composer layout и close не соответствуют скетчу.

## Notes for Orchestrator

После C-134. Client S38. Не трогать mesh.
