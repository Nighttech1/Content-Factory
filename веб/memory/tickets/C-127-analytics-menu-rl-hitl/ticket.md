# C-127 — Analytics menu + RL Trainer HITL

| Field | Value |
|-------|-------|
| **ID** | `C-127` |
| **Priority** | P0 |
| **Area** | analytics |
| **Wave** | `W-2026-10-10-vernatun-ui` |
| **Status file** | pending |

## Repro

1. `/analytics` — один глобальный дашборд без меню модулей как у Студии.
2. RL feed = «предложения агентов» / heuristics; нет обязательного «Согласовано» до apply skills/rules.
3. Author может путаться со Scout.

**URL:** `http://127.0.0.1:8787/analytics`

## Expected

Сначала экран-меню (плитки модулей как Studio), затем dashboard per module. RL = предложения **Тренера**; кнопка **«Согласовано»** обязательна до apply (local mock OK).

## Actual

Единый shell без per-module menu; RL без HITL «Согласовано» / Trainer author.

## Notes for Orchestrator

Зона: Frontend primary; Backend optional mock. Затем **C-128** на том же AnalyticsShell path (последовательно).
