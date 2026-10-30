# C-136 — Nav IA: sidebar 3 + module top Mesh/Analytics

| Field | Value |
|-------|-------|
| **ID** | `C-136` |
| **Priority** | P0 |
| **Area** | shell_nav / studio |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | pending |
| **[MKT]** | Mesh и Аналитика — внутри модуля, не в боковом меню |

## Repro

1. Сайдбар показывает Mesh (`/admin/mesh`) и Analytics (`/analytics`) рядом со Studio/Schedule/Settings.
2. На `/studio/[moduleId]` нет top-bar входов «Команда выпуска» / «Аналитика».

**URL:** `http://127.0.0.1:8787/studio/<moduleId>`

## Expected

Sidebar **только**: Studio, Schedule, Settings. На workspace модуля — кнопки «Команда выпуска» → `/studio/[moduleId]/mesh`, «Аналитика» → `/studio/[moduleId]/analytics`. Routes работают; mesh OWNER RBAC.

## Actual

Mesh + Analytics в sidebar; нет module-scoped nested routes.

## Notes for Orchestrator

После C-133→C-130. **До C-137** (mesh page живёт на новом nested route). Route decision: nested (не query) — см. wave + spec.
