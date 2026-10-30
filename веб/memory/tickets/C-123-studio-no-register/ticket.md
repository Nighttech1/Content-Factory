# C-123 — Studio без «[+ Добавить модуль]»

| Field | Value |
|-------|-------|
| **ID** | `C-123` |
| **Priority** | P0 |
| **Area** | studio_launchpad |
| **Wave** | `W-2026-10-10-vernatun-ui` |
| **Status file** | pending |

## Repro

1. Открыть `/studio`.
2. В сетке каналов видна плитка **«[+ Добавить модуль]»** / RegisterModule entry.
3. Клик открывает `RegisterModuleModal`.

**URL:** `http://127.0.0.1:8787/studio`

## Expected

Только существующие каналы/модули. Нет CTA регистрации нового модуля с Launchpad. Modal не открывается с этой сетки.

## Actual

`ModuleSelectorGrid` рендерит Add-карточку + `RegisterModuleModal`.

## Notes for Orchestrator

Зона: **Frontend**. API регистрации модулей **не удалять**, если не мешает — только UI entry.
