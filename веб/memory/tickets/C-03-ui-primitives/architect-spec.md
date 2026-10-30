# Architect spec — C-03

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → обновить этот файл + `chain.md`.

## Goal

Добавить базовые UI-примитивы Design System — `GlassCard`, `NeonBadge`, `ReactiveButton` — и показать их демо-секцией на `/studio` внутри уже существующего App Shell (C-02), с Motion spring `{ damping: 25, stiffness: 300 }`.

## In scope

- `components/ui/GlassCard.tsx` — glass surface, `backdrop-blur-md`, микро-бордер `rgba(255,255,255,0.08)` / токены C-02.
- `components/ui/NeonBadge.tsx` — статусные бейджи с мягким внешним glow (cobalt / gold / terracotta варианты по props).
- `components/ui/ReactiveButton.tsx` — тактильный press + анимированная подсветка границы (Motion).
- Демо-блок **только** в `app/studio/page.tsx` (секция «Design primitives» / эквивалент) — не менять shell, RBAC, другие routes.
- Motion на интеракциях примитивов в `components/ui/**`.

## Out of scope

- Scaffold, deps, package configs → **C-01**.
- Tokens root, AppShell, Sidebar, session store, mesh gate, другие страницы → **C-02** (только чтение/использование).
- ModuleSelectorGrid, FloatingCommandBar, GenerationDrawer → Спринт 2.
- Backend / AI Bridge / prod.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Primitives + studio demo | Frontend | `components/ui/**` + demo section in studio page |
| Spring interactions | Motion | `components/ui/**` only |
| API / data | — | нет |
| AI bridge | — | нет |
| QA | Tester → Fixer | visual + interaction guards |
| Localhost | Deployer | `/studio` demo visible |
| Приёмка | Client | видит три примитива на Studio |

## Contracts

- **Visual:** skill `content-factory-ui` + ARCHITECTURE §2; без purple-slop, без светлой темы.
- **API components (минимум):**
  - `GlassCard`: `children`, optional `className`
  - `NeonBadge`: `children` / `label`, `tone?: 'cobalt' | 'gold' | 'terracotta' | 'muted'`
  - `ReactiveButton`: native button props + `children`; press scale/border glow via Motion
- **Motion preset:** `{ damping: 25, stiffness: 300 }` (framer-motion).
- **cn:** использовать `lib/cn.ts` из C-02.
- **Path lock:** не править `components/shell/**`, `lib/session-store.ts`, `app/globals.css` токены, mesh/analytics/schedule/brand-kit pages. Единственный app-файл — `app/studio/page.tsx` (добавление demo section).

## Acceptance criteria (язык Клиента)

1. На `http://127.0.0.1:3000/studio` внутри shell видна демо-зона с GlassCard, NeonBadge и ReactiveButton.
2. Карточка выглядит «стеклянной» (blur + тонкая рамка), не плоский серый блок.
3. Бейдж имеет мягкое свечение; кнопка реагирует на нажатие (tactile + border highlight).
4. Анимации используют согласованный spring; нет ломания сайдбара/RBAC из C-02.

## Risks

- Конфликт merge на `app/studio/page.tsx` — C-03 идёт строго после C-02; править только demo section, сохранить AppShell wrap.
- Избыточный glow → anti-slop Tester; держать glow мягким.

## Mid-flight escalation

Если в ходе фикса выяснилось, что контракт неверный: **стоп** → Оркестратор возвращает Архитектора → правка spec + chain → продолжение.
