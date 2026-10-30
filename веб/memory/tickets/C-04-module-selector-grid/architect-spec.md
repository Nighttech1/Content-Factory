# Architect spec — C-04

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → обновить этот файл + `chain.md`.

## Goal

Реализовать сетку выбора модулей на Studio Launchpad (`ModuleSelectorGrid`): 4 интерактивные карточки + 5-й слот-заглушка; выбор модуля в zustand `lib/studio-store.ts`. Это DEV_PLAN **2.1** / ARCHITECTURE Screen 2 — фундамент Sprint 2.

## In scope

- Создать `lib/studio-store.ts` (zustand) с полями волны для **этого** тикета:
  - `selectedModuleId: string | null`
  - `setSelectedModuleId(id: string | null)`
  - Константы/типы id модулей (рекомендуется рядом: `components/studio/modules.ts` **или** внутри grid — один источник правды).
- `components/studio/ModuleSelectorGrid.tsx`:
  - 4 карточки: Carousel 4:5 · Infographics · Cartoon Reels · HeyGen Avatar (подписи по DEV_PLAN 2.1 / ARCHITECTURE Screen 2).
  - 5-я карточка: пунктирная рамка `[+ Добавить модуль]` — UI-заглушка (не открывает SDK, не пишет в store как выбранный модуль; `disabled` / no-op click).
  - Dark Luxury / GlassCard aesthetic; переиспользовать `GlassCard` / токены C-02–C-03.
  - Выбранная карточка визуально отличима (бордер/glow cobalt или amber).
- Motion: hover lift + мягкое синее или янтарное свечение на карточках (`components/studio/ModuleSelectorGrid.tsx` only).
- Spring preset как в C-03: `{ damping: 25, stiffness: 300 }` где применимо.

## Out of scope

- `FloatingCommandBar`, `Generate Draft`, topic/presets → **C-05**.
- `GenerationDrawer`, mock pipeline, `drawerOpen` / agent steps → **C-06**.
- Композиция всей страницы `/studio` (grid + bar + drawer) → **C-06** (`app/studio/page.tsx`). C-04 **не** правит `app/studio/page.tsx`.
- Backend / AI Bridge / BullMQ / SSE / Prisma / Module SDK runtime.
- Inspector, mesh, analytics.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Store (create) + grid UI | Frontend | `lib/studio-store.ts` (selectedModule*), `components/studio/ModuleSelectorGrid.tsx`, optional `modules.ts` |
| Hover motion | Motion | только `ModuleSelectorGrid.tsx` |
| API / data | — | нет |
| AI bridge | — | нет |
| QA | Tester → Fixer | store selection + grid contract; visual mount после C-06 |
| Localhost | Deployer | после FE+Motion; полный UI grid на `/studio` — после C-06 compose |
| Приёмка | Client | 4+1 карточки и выбор модуля (полная визуальная — после C-06 на `/studio`) |

## Contracts

### Store (C-04 создаёт; C-05/C-06 только **расширяют** — не пересоздавать файл)

```ts
// минимальный контракт C-04
selectedModuleId: string | null
setSelectedModuleId: (id: string | null) => void
```

Рекомендуемые id (зафиксировать в `modules.ts` или grid):

| id | Label (UI) |
|----|------------|
| `carousel-4-5` | Карусели Instagram (4:5) |
| `infographics` | Полезные картинки & Инфографика |
| `cartoon-reels` | Мульт-Reels (2D сторителлинг) |
| `heygen-avatar` | HeyGen AI-Аватар Reels |

### UI

- Glass / dark luxury; без purple-slop; армянские глифы не ломать (если есть hy sample на странице — не трогать до C-06).
- Path lock Frontend: только `lib/studio-store.ts` (create), `components/studio/ModuleSelectorGrid.tsx`, optional `components/studio/modules.ts`.
- **Не** параллелить с C-05/C-06 на `lib/studio-store.ts` — порядок волны: C-04 → C-05 → C-06.

### Wave order (обязательный)

1. Frontend C-04 → Motion C-04  
2. Frontend C-05 → Motion C-05  
3. Frontend C-06 → Motion C-06  
4. Tester / Fixer / Deployer / Client по каждому тикету (C-04 QA может быть контрактным до mount; финальный S1 — C-06).

## Acceptance criteria (язык Клиента)

1. Компонент сетки существует: 4 модуля + пунктирный `[+ Добавить модуль]`.
2. Клик по модулю записывает `selectedModuleId` в `studio-store`; повторный клик / смена выбора обновляет store.
3. Hover: карточка слегка приподнимается с мягким свечением (Motion).
4. На живом `/studio` сетка видна после compose C-06 (Hard visual gate волны).

## Risks

- Двойное создание `studio-store` агентами C-05/C-06 → запрет; только extend.
- Mount отложен до C-06 → C-04 Tester пишет guards на store + unit/render компонента; не блокировать волну отсутствием сетки на URL до C-06.
- Merge conflict на store — строго последовательные FE.

## Mid-flight escalation

Если нужен Backend/SSE или изменение контракта store: **стоп** → Оркестратор → Архитектор обновляет spec + chain.
