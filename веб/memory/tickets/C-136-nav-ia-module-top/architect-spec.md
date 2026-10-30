# Architect spec — C-136 (nav IA + module top nav)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **После C-133 → C-130.** **До C-137** (entry routes must exist).

## Goal

Информационная архитектура: боковое меню — только операционные экраны; Mesh и Analytics — контекст **конкретного модуля** через top bar.

## Decision locks — ROUTES (LOCKED)

| Lock | Decision |
|------|----------|
| **D1 Sidebar NAV_ITEMS** | Ровно три пункта: **Studio** (`/studio`), **Schedule** (`/schedule`), **Settings** (`/settings`). **Remove** Mesh + Analytics из sidebar (и из OWNER-only sidebar filter для mesh). |
| **D2 Nested routes (канон)** | **Prefer nested under module:** `/studio/[moduleId]/mesh` и `/studio/[moduleId]/analytics`. **Не** query-primary (`?view=mesh`). |
| **D3 Top bar** | На `/studio/[moduleId]` (module workspace shell): кнопки **«Команда выпуска»** → mesh nested; **«Аналитика»** → analytics nested. Видимы @1440; touch-friendly. |
| **D4 RBAC mesh** | Mesh route: **OWNER only** (как нынешний `/admin/mesh`). ADMIN/не-OWNER — не видит кнопку или получает deny/redirect на studio module. Analytics — по текущей политике app (не ужесточать без нужды; обычно доступнее mesh). |
| **D5 Legacy shims** | `/admin/mesh` → redirect на `/studio/{defaultOrLast}/mesh` **или** OWNER gate + message; global `/analytics` → redirect/shim на module analytics (или module picker). Primary UX = nested. Не оставлять sidebar links. |
| **D6 Content host** | C-136: поднять **route shells** + top bar. Analytics content: reuse `AnalyticsShell` / page client under nested route (перенос mount). Mesh content: **placeholder shell OK** до C-137, но URL **200** и OWNER gate; C-137 заменяет body clean-slate. |
| **D7 Files** | `SidebarNavigation.tsx` NAV_ITEMS; `app/studio/[moduleId]/mesh/page.tsx`; `app/studio/[moduleId]/analytics/page.tsx`; module workspace top bar (e.g. `StudioModuleWorkspace` / shell header); optional redirects `app/admin/mesh/page.tsx`, `app/analytics/page.tsx`. |

## In scope

- Sidebar trim to 3 items
- Nested App Router pages for mesh + analytics under `[moduleId]`
- Top bar CTAs on module workspace
- RBAC OWNER for mesh nested
- Legacy redirect/shim (minimal)

## Out of scope

- C-137 flowchart rewrite / delete AgentMeshCanvas (placeholder until then)
- Emblem/hydration (already C-133/C-130)
- Feed typography / Razbor
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Routes + shell + top bar | **Frontend** | `content-factory-ui`, `content-factory-analytics` entry |
| Motion | — | optional micro for top bar later; not required |
| Backend | — | не обязателен (RBAC client/session as today) |

## Acceptance (язык Клиента)

1. S36: sidebar = Studio / Schedule / Settings only — нет Mesh/Analytics пунктов.
2. На module workspace клик «Команда выпуска» → URL `/studio/<id>/mesh` (OWNER).
3. Клик «Аналитика» → `/studio/<id>/analytics`; контент analytics читаем (reuse shell).
4. ADMIN не открывает mesh (S3-style RBAC).

## Risks

- Broken absolute links in smoke scripts pointing `/admin/mesh` — Tester notes; FE updates primary paths.
- Overlap with C-137: C-136 **не** патчит xyflow — только route + empty/legacy mount until rewrite.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
