# C-142 — Studio module workspace first-paint perf

| Field | Value |
|-------|-------|
| **ID** | `C-142` |
| **Priority** | P0 |
| **Area** | studio / workspace perf |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Status file** | pending |
| **[MKT]** | Модуль открывается сразу; живые данные догоняют в фоне |

## Repro

1. Launchpad → открыть `/studio/[moduleId]` (carousel / competitors feed).
2. First paint ждёт Apify / heavy workspace chunk — blank или долгий spinner.
3. Нет зафиксированных ms before/after в status/guards.

**URL:** `http://127.0.0.1:8787/studio/<moduleId>`

## Expected

- Do **not** block first paint on Apify: show fixtures/skeleton **immediately**.
- Fetch live competitors/feed **in background**; swap when ready (badge «Онлайн» when live).
- Split **dynamic imports**; avoid loading full workspace chunk unnecessarily (mesh/editor/heavy modals deferred).
- Measure cold click Launchpad → module title visible: **before/after ms** in `status.md` / `guards.md`.

## Actual

Suspected sync wait on Apify + eager workspace imports (root-cause to confirm via chrome-devtools).

## Notes for Orchestrator

Path 2 — after mesh pass. Frontend (+ Backend only if API shape blocks). Skill `web-perf-motion` / `content-factory-ui` C-144-in-skill → **this ticket is C-142**.
