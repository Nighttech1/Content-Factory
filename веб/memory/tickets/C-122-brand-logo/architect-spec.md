# Architect spec — C-122 (brand logo horizontal)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**

## Goal

Сайдбар Vernatun: официальный PNG-логотип + название **справа** от эмблемы (horizontal), не под логотипом.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Asset** | Источник: `knowledge/logo/logo-transparent.png`. Скопировать в `public/brand/vernatun-logo.png` (канон волны). Существующий `public/brand/vernatun-logo.svg` — fallback OK, **PNG канон**. |
| **D2 Layout** | В brand slot сайдбара: `flex-row items-center gap-*` — **[PNG]** слева, блок текста **справа**. Запрет: `flex-col` где название оказывается **под** эмблемой. |
| **D3 Copy** | Справа от эмблемы две строки (текстовый блок, не отдельная колонка под лого): **VERNATUN** (primary) + **ARMENIAN CLUB** (secondary / muted). Не «VERN·ATUN» / не «Content Factory» как primary brand. |
| **D4 File** | Правка в `components/shell/SidebarNavigation.tsx` (brand header ~L155–167). Не трогать MenuVertical items / RBAC / resize. |
| **D5 Size** | Эмблема читаема (~28–36px), не обрезает текст при clamp сайдбара 220–420 (`cf.sidebar.width`). |

## In scope

- Copy asset → `public/brand/vernatun-logo.png`
- `SidebarNavigation.tsx` brand header: `<img>` (или `next/image`) + text block справа
- `data-testid` brand slot optional (`nav-brand` / `sidebar-brand`) для Client S32

## Out of scope

- Mesh / Studio / Schedule / Analytics
- Замена всех логотипов в marketing pages
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | `content-factory-ui` § Brand mark C-122 |
| Motion / Backend / AI Bridge | — | не звать |

## Acceptance (язык Клиента)

1. На Playwright @1440 сайдбар показывает **PNG-эмблему** и справа читаемые **VERNATUN** / **ARMENIAN CLUB**.
2. Название **не** под логотипом (не вертикальный стек logo→name).
3. Nav пункты / RBAC OWNER mesh / resize сайдбара без регресса.

## Risks

- Узкий сайдбар 220px — truncate secondary line OK; primary VERNATUN должен оставаться читаемым.
- Не коммитить секреты; PNG — публичный brand asset.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
