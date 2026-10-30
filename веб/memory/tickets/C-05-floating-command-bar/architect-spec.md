# Architect spec — C-05

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → обновить этот файл + `chain.md`.

## Goal

Плавающая командная строка Studio (`FloatingCommandBar`): topic input, пресет-чипсы, кнопка **Generate Draft** с динамическим градиентным бордером. Generate **обязан** открывать GenerationDrawer и запускать mock pipeline — жёсткая связка с **C-06** (Hard REJECT S1). DEV_PLAN **2.2**.

## In scope

- Расширить `lib/studio-store.ts` (файл уже создан C-04; **не** пересоздавать):
  - `topic: string` + `setTopic`
  - пресеты: применение текста в `topic` (чипы)
  - `startGenerate(): void` — контракт вызова генерации (открытие drawer + старт mock runner; реализацию runner/drawerOpen доводит **C-06**, C-05 задаёт публичный action и wiring кнопки)
- `components/studio/FloatingCommandBar.tsx`:
  - центрированный input, placeholder: *«Введите тему, тезис или ссылку на тренд...»*
  - чипсы: `🔥 Тренд недели`, `🗣 Ереванский сленг`, `🎭 Дебаты/Спор`, `📚 Для начинающих` (DEV_PLAN 2.2)
  - кнопка `Generate Draft` → вызывает `startGenerate` из store
- Motion: динамический / импульсный градиентный бордер кнопки Generate (`FloatingCommandBar.tsx` only).
- Зависит от C-04: store существует; `selectedModuleId` уже в store (Generate может требовать выбранный модуль — UX: disable Generate если `selectedModuleId == null` **или** auto-select первого; зафиксировать в decisions при FE — предпочтение: **disable + hint**, если модуль не выбран).

## Out of scope

- Реализация UI `GenerationDrawer` и таймеров шагов → **C-06** (C-05 только вызывает store API).
- `app/studio/page.tsx` compose → **C-06**.
- Реальный SSE / BullMQ / LLM / HeyGen API.
- Backend / AI Bridge.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Command bar + store extend | Frontend | `FloatingCommandBar.tsx`, extend `studio-store` (topic, presets, `startGenerate`) |
| Generate border pulse | Motion | только `FloatingCommandBar.tsx` |
| Drawer UI + mock runner body | C-06 Frontend | hard link |
| QA | Tester → Fixer | bar visible after compose; Generate→drawer gate с C-06 |
| Localhost | Deployer | после FE+Motion |
| Приёмка | Client | Generate открывает drawer (совместно C-06) |

## Contracts

### Store extend (C-05)

```ts
topic: string
setTopic: (topic: string) => void
applyPreset: (presetId: string) => void  // или setTopic(presetText) из чипа
startGenerate: () => void
```

Минимальное поведение `startGenerate` (C-05 может поставить stub, C-06 заменяет/дополняет той же сигнатурой):

1. Если нет `selectedModuleId` — no-op или no-op + UI disabled (см. In scope).
2. Выставляет флаги, которые C-06 читает: как минимум инициирует открытие drawer (`drawerOpen = true`) **если поле уже добавлено C-06**; если C-05 идёт до C-06 FE — C-05 добавляет в store:

```ts
drawerOpen: boolean
setDrawerOpen: (open: boolean) => void
// startGenerate: setDrawerOpen(true) + вызов startMockPipeline если уже есть, иначе только open
```

**Уточнение порядка:** C-05 FE **после** C-04; C-06 FE **после** C-05.  
Рекомендация Архитектора: C-05 `startGenerate` делает `set({ drawerOpen: true })` и вызывает `runMockPipeline()` **если** функция уже в store; иначе C-05 добавляет `drawerOpen` + пустой/`noop` runner placeholder, а C-06 заполняет `agentSteps` + реальный mock runner. Чтобы не плодить два action — **один** `startGenerate` в store, C-06 дописывает тело runner в тот же store.

Практичный контракт волны:

| Когда | `startGenerate` |
|-------|-----------------|
| После C-05 FE (до C-06) | `drawerOpen = true`; steps могут быть пустыми |
| После C-06 FE | `drawerOpen = true` + sequential mock steps researching→…→done |

### Hard link C-05 ↔ C-06

- Кнопка Generate **не** «заглушка без эффекта».
- После C-06: клик → drawer slide-over открыт + шаги меняются на UI без reload.
- Client S1 / Hard REJECT: Generate Draft must open drawer.

### Path lock Frontend

- `components/studio/FloatingCommandBar.tsx`
- `lib/studio-store.ts` (extend only: topic, presets, startGenerate, optionally `drawerOpen` seed)
- **Не** `ModuleSelectorGrid.tsx`, **не** `GenerationDrawer.tsx`, **не** `app/studio/page.tsx`

### Motion

- Градиентный / pulse border на Generate; spring согласован с C-03/C-04.

## Acceptance criteria (язык Клиента)

1. На `/studio` (после C-06 compose) видна командная строка с placeholder и 4 чипсами.
2. Клик по чипу подставляет тему в поле.
3. **Generate Draft** открывает боковой GenerationDrawer (C-06) и запускает смену шагов агентов.
4. Бордер кнопки анимирован (Motion), Dark Luxury, без purple-slop.

## Risks

- C-05 «закрыт» без работающего drawer → **нельзя** считать Hard link выполненным до C-06; Client C-05 может быть «принято с замечанием: ждать C-06» или принимать bar UI, а S1 — на C-06.
- Конфликт store с C-06 — только sequential extend.
- Параллельный FE с C-04/C-06 на store — запрещён.

## Mid-flight escalation

Нужен реальный SSE / API generate → стоп → Архитектор (другая волна, Backend + SSE skill).
