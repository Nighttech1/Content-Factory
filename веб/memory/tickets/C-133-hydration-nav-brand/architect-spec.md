# Architect spec — C-133 (hydration nav-brand)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **P0 first** в shell path: до C-130 / C-136.

## Goal

Убрать hydration mismatch в сайдбар-бренде: `data-testid="nav-brand"` и разметка brand slot идентичны SSR и CSR.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Testid** | `data-testid="nav-brand"` на brand wrapper **всегда** — server + client, первый paint. |
| **D2 Ban conditional testid** | Запрет: `mounted ? "nav-brand" : undefined`, `typeof window !== "undefined" && …testid`, разные testid по веткам. |
| **D3 Ban window-only brand** | Запрет: brand branch только после `useEffect` / `useState(mounted)`. Brand markup (structure) одинаков на SSR и CSR. Asset/`next/image` OK если не меняет DOM-структуру и testid. |
| **D4 File** | `components/shell/SidebarNavigation.tsx` — только hydration-safe brand slot. Nav items / resize / RBAC не трогать (→ C-136). |
| **D5 Emblem** | Смена PNG/layout wordmark → **C-130** (после C-133). Здесь можно оставить текущий asset, если testid+структура стабильны. |

## In scope

- Audit + fix brand slot в `SidebarNavigation.tsx`
- Ensure no `suppressHydrationWarning` как «лечение» вместо одинакового markup (prefer real fix)

## Out of scope

- Emblem-only redesign (C-130)
- NAV_ITEMS / Mesh+Analytics IA (C-136)
- Feed / Razbor / Mesh rewrite
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | `content-factory-ui` hydration ban |
| Motion / Backend | — | не звать |

## Acceptance (язык Клиента)

1. Playwright @1440: `getByTestId("nav-brand")` виден сразу после navigate (без wait mounted).
2. Нет hydration warning в console на `/studio` от brand slot.
3. Nav/RBAC/resize без регресса.

## Risks

- Локальный `Date` / locale в brand — не добавлять.
- C-130 сразу после — не ломать D1–D3 при смене img src.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
