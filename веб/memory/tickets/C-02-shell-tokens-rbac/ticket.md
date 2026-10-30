# C-02 — Dark Luxury tokens + App Shell RBAC

| Field | Value |
|-------|-------|
| **ID** | `C-02` |
| **Priority** | P0 |
| **Area** | shell_nav |
| **Status file** | [status.md](status.md) |

## Repro

1. Нет `globals.css` с токенами Dark Luxury.
2. Нет App Shell / SidebarNavigation.
3. Пункт Canvas (Node Mesh) не скрывается по роли.

**URL:** `http://127.0.0.1:3000/studio`

## Expected

- CSS-переменные: `--bg-canvas`, `--bg-card`, `--accent-blue`, `--accent-gold`, `--accent-terracotta`.
- Шрифты: Inter, JetBrains Mono, Noto Sans Armenian.
- Sidebar: Studio, Canvas (Node Mesh), Schedule, Analytics, Brand Kit.
- Canvas только при `role === OWNER`; ADMIN → редирект с `/admin/mesh` на `/studio`.
- Mock-роль через zustand `useSessionStore` (дефолт OWNER, переключатель для локальной приёмки).

## Actual

Нет shell и токенов.

## Notes for Orchestrator

Зона: Frontend (+ Motion на появление сайдбара).
