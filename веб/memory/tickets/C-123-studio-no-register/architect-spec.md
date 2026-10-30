# Architect spec — C-123 (Studio no RegisterModule entry)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**

## Goal

Убрать с Launchpad `/studio` вход «создание нового модуля» / RegisterModule. Сетка = только существующие каналы.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 UI** | В `ModuleSelectorGrid.tsx` удалить dashed / Add карточку «[+ Добавить модуль]» и любой CTA Register. |
| **D2 Modal** | Не монтировать / не открывать `RegisterModuleModal` с Launchpad. Entry points unmount. Файл `RegisterModuleModal.tsx` **можно оставить** на диске (не delete), если нет других callers — или оставить dead export; **не** удалять Backend/API register, если существует. |
| **D3 Keep** | Плитки CORE + product (включая site/TG articles и пр.) без регресса C-76/C-82 hover. |
| **D4 Scope** | Только Studio Launchpad UI. Новый модуль = SDK/admin вне этой CTA. |

## In scope

- `components/studio/ModuleSelectorGrid.tsx` — remove Add tile + modal wire
- Optionally stop importing `RegisterModuleModal` from grid
- Smoke / testId: нет `register-module` / add-module control на `/studio`

## Out of scope

- Удаление API routes / Prisma module registry
- Mesh add-module (уже запрещён ранее)
- Sidebar brand (C-122), mesh (C-124/125)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | `content-factory-ui` § C-123 |
| Backend | — | API не трогать |

## Acceptance (язык Клиента)

1. На `/studio` нет кнопки/плитки «[+ Добавить модуль]» / «создание нового модуля».
2. Сетка модулей кликабельна как раньше; Register modal с Launchpad не открывается.
3. Playwright snapshot @1440 — только каналы.

## Risks

- Другие импорты `RegisterModuleModal` — проверить grep; если только grid — оставить файл или soft-deprecate в комментарии, не ломать build.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain.
