# Architect spec — C-130 (emblem-only brand)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **После C-133.** Supersedes **C-122** layout/asset канон.

## Goal

Сайдбар: круглая эмблема клуба (без текста на PNG) + текстовый блок **VERNATUN** / **ARMENIAN CLUB** справа.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Source asset** | Скопировать user PNG → `public/brand/vernatun-emblem.png`. Источник: `C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_apple-touch-icon-c1e25621-1cdd-456d-8aeb-cf02fbf93fe0.png` |
| **D2 Emblem-only** | В UI — **circle emblem ONLY**. Запрет baked wordmark на картинке как единственный brand signal. Не использовать wordmark-heavy `logo-transparent` как primary sidebar mark этой волны. |
| **D3 Layout** | `flex-row items-center gap-*`: **[circle img]** слева, текст **справа**. Запрет: название **под** эмблемой (`flex-col` logo→name). |
| **D4 Copy** | Справа: **VERNATUN** (primary) + **ARMENIAN CLUB** (secondary/muted). Century Gothic / `--font-ui`. |
| **D5 Testid** | Сохранить C-133: `data-testid="nav-brand"` always on wrapper. |
| **D6 Size** | Круг ~28–36px, `rounded-full` / object-cover; не обрезать текст при sidebar 220–420. |
| **D7 File** | `components/shell/SidebarNavigation.tsx` brand header + asset copy. Не трогать NAV_ITEMS (→ C-136). |

## In scope

- Copy PNG → `public/brand/vernatun-emblem.png`
- Sidebar brand: circle img + text right
- Optional: deprecate visual use of `public/brand/vernatun-logo.png` in sidebar (файл можно оставить на диске)

## Out of scope

- NAV_ITEMS Mesh/Analytics removal (C-136)
- Marketing pages logos
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI + asset | **Frontend** | `content-factory-ui` § Brand C-130 |
| Motion / Backend | — | не звать |

## Acceptance (язык Клиента)

1. S36 @1440: circle emblem + VERNATUN / ARMENIAN CLUB справа; не вертикальный стек.
2. PNG = user emblem path → `vernatun-emblem.png` (не baked wordmark primary).
3. `nav-brand` testid стабилен (C-133 не сломан).

## Risks

- Неверный source path / битый copy — Frontend обязан verify file exists после copy.
- Не коммитить секреты; PNG публичный brand asset.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
