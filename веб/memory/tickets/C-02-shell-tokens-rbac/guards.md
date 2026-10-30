# Guards — C-02

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| script / CSS | В `app/globals.css` заданы `--bg-canvas` (#08090a), `--bg-card`, `--accent-blue` (#2563eb), `--accent-gold`, `--accent-terracotta`. Предотвращает светлую тему / peach atelier / пропажу токенов Dark Luxury. | `scripts/sprint1-guards.mjs` + `app/globals.css` |
| script / RBAC nav | `SidebarNavigation` фильтрует `ownerOnly` — Canvas виден только при `role === "OWNER"`. Предотвращает показ Canvas ADMIN. | `components/shell/SidebarNavigation.tsx` + `scripts/sprint1-guards.mjs` |
| script / RBAC route | `/admin/mesh` при `ADMIN` делает `router.replace("/studio")`. Предотвращает доступ ADMIN к mesh. | `app/admin/mesh/page.tsx` + `scripts/sprint1-guards.mjs` |
| script / session | `useSessionStore` default `role: "OWNER"`, роли `OWNER \| ADMIN`. Предотвращает default ADMIN и потерю switcher-контракта. | `lib/session-store.ts` + `scripts/sprint1-guards.mjs` |
| script / fonts | `app/layout.tsx` подключает Noto Sans Armenian (+ Inter, JetBrains Mono). Предотвращает битые hy-глифы. | `app/layout.tsx` + `scripts/sprint1-guards.mjs` |
| anti-slop | Нет purple-gradient / pure #000 slop. | `python plugins/frontend/anti_slop_scan.py .` → OK |
| smoke | `GET /studio` → 200 на localhost. | Tester 2026-09-16 |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`
