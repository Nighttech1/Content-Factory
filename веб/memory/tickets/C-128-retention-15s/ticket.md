# C-128 — Retention %@15s через дробь

| Field | Value |
|-------|-------|
| **ID** | `C-128` |
| **Priority** | P1 |
| **Area** | analytics |
| **Wave** | `W-2026-10-10-vernatun-ui` |
| **Status file** | pending |

## Repro

1. `/analytics` → блок Удержание (`RetentionChart`).
2. Есть кривая / точки по секундам; **нет** явного %@15s через дробь `(n/m)` рядом с 3с или отдельно.

**URL:** `http://127.0.0.1:8787/analytics` (после выбора модуля — C-127)

## Expected

Показать удержание на **15-й секунде** как **% через дробь** (напр. `62% (31/50)`), рядом/в дополнение к 3с.

## Actual

`RetentionPoint` = second + series values; нет `at15` cohort fraction callout.

## Notes for Orchestrator

После C-127, тот же Analytics path. Frontend primary.
