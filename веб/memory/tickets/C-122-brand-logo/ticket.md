# C-122 — Brand logo + VERNATUN справа

| Field | Value |
|-------|-------|
| **ID** | `C-122` |
| **Priority** | P0 |
| **Area** | shell_nav |
| **Wave** | `W-2026-10-10-vernatun-ui` |
| **Status file** | pending |
| **[MKT]** | Бренд Vernatun / Armenian Club — горизонтальный mark в сайдбаре |

## Repro

1. Открыть любой экран с App Shell (напр. `/studio`).
2. Смотреть шапку сайдбара: сейчас иконка Network + «VERN·ATUN» / «Content Factory» (без PNG бренда).
3. Название не рядом с официальной эмблемой PNG.

**URL:** `http://127.0.0.1:8787/studio`

## Expected

В сайдбаре: PNG-эмблема слева, справа текст **VERNATUN** / **ARMENIAN CLUB** (horizontal row). Не под логотипом.

## Actual

Text-only / иконка Lucide; нет `logo-transparent.png`.

## Notes for Orchestrator

Зона: **Frontend** only. Файл: `SidebarNavigation.tsx`. Asset: `knowledge/logo/logo-transparent.png` → `public/brand/…`.
