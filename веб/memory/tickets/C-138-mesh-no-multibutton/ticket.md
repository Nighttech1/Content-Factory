# C-138 — Mesh: remove MultiButton / MeshPipelineSwitcher

| Field | Value |
|-------|-------|
| **ID** | `C-138` |
| **Priority** | P0 |
| **Area** | mesh / release-team chrome |
| **Wave** | `W-2026-10-10-static-release-team` |
| **Status file** | pending |
| **[MKT]** | «Команда выпуска» без переключателя пайплайна — только заголовок и «Скопировать ТЗ» |

## Repro

1. OWNER: открыть `/studio/<moduleId>/mesh` («Команда выпуска»).
2. В top bar виден `MeshPipelineSwitcher` / expanded `MultiButton` (content-type icons) — chrome из C-83/C-88/C-137.
3. Эталон и user TZ требуют: только title + subtitle + «Скопировать ТЗ для Cursor».

**URL:** `http://127.0.0.1:8787/studio/<moduleId>/mesh` (OWNER)

## Expected

- **Нет** `MultiButton`, `MeshPipelineSwitcher`, любых content-type / pipeline filter chips на release-team pages.
- Top bar = **title «Команда выпуска»** + **subtitle** + кнопка **«Скопировать ТЗ для Cursor»** only.
- Смена типа контента = другой module workspace (`/studio/[otherModuleId]/…`), не switcher на схеме.
- Если `MeshPipelineSwitcher.tsx` больше нигде не импортируется — **DELETE** файл.
- Может закрываться **в том же Frontend pass**, что C-139 (один path mesh).

## Actual

C-137 оставил `CanvasTopBar` + `MeshPipelineSwitcher` (MultiButton) на `ReleaseTeamFlowchart`.

## Notes for Orchestrator

Same FE path as **C-139**. Не параллелить. Chain: Frontend → Motion → Tester → Fixer → Deployer → Client. Supersedes mesh MultiButton canon (C-83/C-88 on this surface).
