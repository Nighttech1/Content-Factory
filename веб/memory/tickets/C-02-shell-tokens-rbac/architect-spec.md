# Architect spec — C-02

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → обновить этот файл + `chain.md`.

## Goal

Ввести дизайн-токены **Deep Matte Dark Luxury** из `ARCHITECTURE.md` §2, шрифты (Inter, JetBrains Mono, Noto Sans Armenian), App Shell + SidebarNavigation и mock-RBAC: пункт Canvas только для `OWNER`; `ADMIN` на `/admin/mesh` уходит на `/studio`. Заглушки маршрутов Studio / Analytics / Mesh / Schedule / Brand Kit внутри shell.

## In scope

- Токены в `app/globals.css`: как минимум `--bg-canvas`, `--bg-card`, `--accent-blue`, `--accent-gold`, `--accent-terracotta` (+ согласованные surface/text из ARCHITECTURE: hover, borders, text primary/muted — без peach-primary из atelier_synth).
- Шрифты в `app/layout.tsx` (next/font или link): UI + mono + **Noto Sans Armenian**.
- `lib/cn.ts` (`clsx` + `tailwind-merge`).
- `lib/session-store.ts`: zustand `useSessionStore`, роль `OWNER | ADMIN`, **default OWNER**, UI-переключатель роли для локальной приёмки (в shell, не отдельный auth backend).
- `components/shell/AppShell.tsx`, `components/shell/SidebarNavigation.tsx`: пункты Studio, Canvas (Node Mesh), Schedule, Analytics, Brand Kit; Canvas **скрыт** при `role !== OWNER`.
- Маршруты-заглушки под shell:
  - `app/studio/page.tsx` (placeholder; демо-примитивы — **C-03**)
  - `app/analytics/page.tsx`
  - `app/admin/mesh/page.tsx` — OWNER-only; ADMIN → `redirect('/studio')`
  - `app/schedule/page.tsx`, `app/brand-kit/page.tsx`
- Опционально: корневой `app/page.tsx` → redirect `/studio` (если не ломает C-01 smoke; предпочтительно да).
- Motion: появление shell/sidebar (spring `{ damping: 25, stiffness: 300 }`).

## Out of scope

- Повторный scaffold / смена версий Next / массовая правка `package.json` deps → уже **C-01**.
- `components/ui/GlassCard|NeonBadge|ReactiveButton` и демо-секция примитивов → **C-03** (C-02 оставляет `app/studio/page.tsx` как пустой/текстовый placeholder без примитивов).
- Реальный xyflow canvas, Module grid, Drawer, Inspector, Analytics charts → Спринты 2–5.
- Auth server, Prisma User, cookies session — только client mock store.
- Backend / AI Bridge / prod deploy.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Tokens, shell, routes, RBAC mock | Frontend | paths ниже в chain |
| Shell appearance | Motion | только `components/shell/**` |
| API / data | — | нет |
| AI bridge | — | нет |
| QA | Tester → Fixer | RBAC + tokens + guards |
| Localhost | Deployer | `/studio` для Клиента |
| Приёмка | Client | сценарий роли OWNER/ADMIN |

## Contracts

- **Tokens source of truth:** `ARCHITECTURE.md` §2 + skill `content-factory-ui` — **не** peach primary atelier_synth.
- **Session:** `useSessionStore` → `{ role: 'OWNER' | 'ADMIN', setRole }` (имена полей могут быть эквивалентны, но default = OWNER).
- **Nav visibility:** Canvas link rendered iff `role === 'OWNER'`.
- **Route gate:** `/admin/mesh` page (server redirect или client effect + replace) — ADMIN → `/studio`; OWNER видит placeholder mesh.
- **Path lock vs C-03:** Frontend C-02 **не** создаёт `components/ui/**`. После placeholder studio page — C-03 единственный, кто добавляет demo section в `app/studio/page.tsx`.
- **Path lock vs C-01:** не пересоздавать scaffold; только refine `globals.css` / `layout.tsx` / новые routes & shell.

## Acceptance criteria (язык Клиента)

1. На `/studio` тёмный canvas (`#08090A`-семейство), видны сайдбар и пункты навигации.
2. При роли OWNER в меню есть «Canvas (Node Mesh)»; `/admin/mesh` открывается (заглушка ок).
3. Переключение на ADMIN: пункта Canvas нет; прямой заход на `/admin/mesh` уводит на `/studio`.
4. Шрифты подключены; армянский sample в UI (хотя бы в shell/footer/placeholder) без битых глифов.
5. Токены `--bg-canvas`, `--bg-card`, `--accent-blue`, `--accent-gold`, `--accent-terracotta` заданы в CSS.

## Risks

- Overlap `app/studio/page.tsx` с C-03 — строго последовательно: C-02 = shell wrapper + placeholder; C-03 = demo primitives only.
- Client-only RBAC легко обойти — приемлемо для Sprint 1 mock; guard теста на UI, не security audit.
- Redirect ADMIN на mesh: предпочесть server `redirect` в page при чтении cookie/header — но cookie нет; допустим client gate + middleware-заглушка позже. Зафиксировать в реализации один способ и покрыть guard’ом.

## Mid-flight escalation

Если в ходе фикса выяснилось, что контракт неверный: **стоп** → Оркестратор возвращает Архитектора → правка spec + chain → продолжение.
