# C-126 — Schedule popupPos persist

| Field | Value |
|-------|-------|
| **ID** | `C-126` |
| **Priority** | P0 |
| **Area** | schedule |
| **Wave** | `W-2026-10-10-vernatun-ui` |
| **Status file** | pending |

## Repro

1. `/schedule` — открыть sticky slot popup, перетащить (C-109).
2. Переключить другой слот / день — позиция прыгает к якорю.
3. F5 — позиция сбрасывается.

**URL:** `http://127.0.0.1:8787/schedule`

## Expected

`popupPos` в `localStorage` ключ **`cf.schedule.popup.pos`**; restore при смене слота и refresh; default только если ключа нет.

## Actual

`popupPos` только в React state (`ScheduleCalendar`).

## Notes for Orchestrator

Зона: **Frontend**. Не overlap mesh/analytics.
