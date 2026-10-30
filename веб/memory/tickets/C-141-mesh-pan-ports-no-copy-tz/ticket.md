# C-141 — Mesh pan + center ports + remove Copy TZ

| Field | Value |
|-------|-------|
| **ID** | `C-141` |
| **Priority** | P0 |
| **Area** | mesh / release-team chrome + geometry |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Status file** | pending |
| **[MKT]** | Схема двигается рукой; стрелки в центр карточек; без кнопки «Скопировать ТЗ» |

## Repro

1. OWNER: `/studio/<moduleId>/mesh`.
2. (a) Нет pan LMB/finger — схема не сдвигается drag’ом.
3. (b) Horizontal ports / SVG lines стыкуются к **top** карточек (`Port` / `drawConnections` top-10), не к vertical center.
4. (c) `CanvasTopBar` всё ещё показывает «Скопировать ТЗ для Cursor» (`data-testid="mesh-copy-tz"`).

**URL:** `http://127.0.0.1:8787/studio/<moduleId>/mesh`

## Expected

- **(a)** Pan canvas: LMB drag + touch finger drag; click vs drag threshold so card clicks still work.
- **(b)** ALL horizontal ports + SVG connection Y from **vertical CENTER** of cards (`Port` + `drawConnections`: top-10 → center).
- **(c)** **REMOVE** Copy TZ button from `CanvasTopBar` entirely — top bar = title + subtitle **only**.
- Same Frontend pass as **C-140**.

## Actual

Static shell without pan; ports/lines near top; Copy TZ button present (C-138 chrome).

## Notes for Orchestrator

Path 1 with C-140. Frontend primary; Motion optional for pan cursor/feel. Supersedes C-138 Copy TZ requirement. Client **S37+S39**.
