# C-133 — Hydration: nav-brand testid always

| Field | Value |
|-------|-------|
| **ID** | `C-133` |
| **Priority** | P0 |
| **Area** | shell_nav |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | pending |
| **[MKT]** | Сайдбар бренд стабилен SSR/CSR — без hydration mismatch |

## Repro

1. Открыть любой экран с App Shell (`/studio`).
2. React hydration warning / mismatch на brand slot, или `data-testid="nav-brand"` отсутствует на первом paint / только после `mounted`.

**URL:** `http://127.0.0.1:8787/studio` (или `:3000` — как деплоит Deployer)

## Expected

`SidebarNavigation` brand wrapper: `data-testid="nav-brand"` **всегда** одинаков на server и client. Нет conditional testid. Нет window-only / `mounted`-only ветки бренда.

## Actual

Условный testid / client-only brand branch → hydration risk (Клиент S36).

## Notes for Orchestrator

**Path lock #1 first.** Только shell hydration — emblem PNG = C-130 после этого тикета. Не parallel с C-130/C-136 на том же файле.
