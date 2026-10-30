# Architect spec — C-77

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Зона выбора агентов / режима («команда запуска») сверху — **`CompactMultiButton`** из `components/ui/multi-button.tsx` (не ряд workflow-кнопок). Переименовать UI-агента разбора чужого в **«Разборщик»**; слово **«Аналитик»** оставить за разделом `/analytics`.

## Depends

- Wave UX-4a · после **C-76**.
- Skills: `content-factory-ui` § Mission Control, `content-pipeline-agents` § Разборщик vs Аналитик, `21st-ui-catalog`, `client-scenarios` **S24**.
- `components/ui/multi-button.tsx` уже в дереве (C-74); при необходимости **полный paste** user-provided API — адаптировать `VARIANT_CLASSES` под Dark Luxury CSS vars (не purple shadcn). `framer-motion` + `lucide` уже в deps.

## In scope

### 1. CompactMultiButton вместо workflow-tabs

Заменить горизонтальный ряд `<button role="tab">` на **`CompactMultiButton`** (+ `selectedId`) в:

| Файл | Сейчас | Нужно |
|------|--------|--------|
| `components/studio/workspace/RazborModal.tsx` | tablist агентов сверху | `CompactMultiButton` items = агенты модуля; `selectedId={activeTab}`; click → `setActiveTab` |
| `components/studio/workspace/CreateCarouselModal.tsx` | tablist «Агенты создания» | то же |

Правила:

- Не плодить второй MultiButton-компонент.
- Сохранить testids поведения: `razbor-tab-{id}`, `create-agent-tab-{id}` через `item.testId` **или** обёртку — Tester фиксирует в guards; предпочтительно `testId` на item.
- ✓ / running markers: label item может включать check (как сейчас) или соседний индикатор — **не** ломать C-75 tab-check contract.
- `highlightColor` / variants — токены `--accent-blue*`, `--bg-elevated`, `--border-glass` (см. существующий `VARIANT_CLASSES` в `multi-button.tsx`).
- Если paste обновляет файл — **сохранить** Dark Luxury mapping; запрет purple / shadcn defaults.

### 2. Rename: Разборщик vs Аналитик

| Контекст | Канон RU |
|----------|----------|
| Razbor / Create agent id `analyst` (разбор чужого) | UI label **«Разборщик»**, shortLabel **«Разбор»** |
| Nav / страница `/analytics` | **«Аналитика»** / продуктовый **Аналитик** — **не** трогать rename на Разборщик |
| Mesh seed node Analyst | можно оставить «Аналитик» (продуктовый аналитик) |
| Welcome / empty copy в Razbor | не «Аналитик закончил» → «Разборщик…» |

Файлы rename (минимум):

```
lib/studio/carousel-draft-types.ts   # RAZBOR_AGENTS label
components/studio/workspace/RazborModal.tsx   # copy «когда Аналитик закончит» и подобные
lib/studio/razbor-pipeline.ts                 # user-facing strings «Я Аналитик…» → Разборщик
```

**id** агента в коде остаётся `analyst` (стабильный ключ panes/store). Меняются только **отображаемые** строки Razbor/Create.

### 3. multi-button.tsx

- Привести к полному paste пользователя при расхождении API; `VARIANT_CLASSES` / `ITEM_HOVER` / `DIVIDER` — только Dark Luxury CSS vars.
- Export: `CompactMultiButton`, `MultiButton`, `MultiButtonGroup` сохранить.

## Out of scope

- **Schedule footer help** («Время слота» / «Нажмите день…») — **path lock → C-78**. Не трогать `ScheduleCalendar.tsx` footer.
- Platforms / Settings (C-79)
- Analytics Self-learning UI (C-80)
- FloatingCommandBar на `/studio` **не** возвращать (C-27 ban). Если правится мёртвый `FloatingCommandBar.tsx` — только polish без re-mount на Launchpad.
- Backend persist

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| MultiButton + agent tabs + rename strings | **Frontend** | |
| Motion | **Motion** optional | springs уже в multi-button; звать только если sticky/hover регресс на tabs |
| Backend / AI Bridge | — | не звать |

## Path ownership (this ticket)

```
components/ui/multi-button.tsx
components/studio/workspace/RazborModal.tsx
components/studio/workspace/CreateCarouselModal.tsx
lib/studio/carousel-draft-types.ts
lib/studio/razbor-pipeline.ts          # user-facing Razbor strings only
```

**Не трогать:**

```
components/schedule/**                 # весь schedule, в т.ч. footer help
components/studio/StudioPageClient.tsx
components/studio/ModuleSelectorGrid.tsx
app/analytics/** / components/analytics/**
SidebarNavigation analytics label
```

## Contracts

```
Agent tabs UI = CompactMultiButton (selectedId)
Razbor UI label for id analyst = «Разборщик»
No Razbor user string calling competitor-agent «Аналитик»
 /analytics chrome still «Аналитика» / Analyst product meaning
ScheduleCalendar footer unchanged in this ticket
```

## Acceptance criteria (язык Клиента)

Сценарий **S24**:

1. В Razbor и Create сверху — CompactMultiButton / MultiButton, не ряд голых workflow-кнопок.
2. Вкладка разбора чужого подписана **«Разборщик»**; раздел Аналитика в навбаре / `/analytics` не переименован в Разборщик.
3. Snapshot.

## Risks

- C-75 ✓ after handoff — сохранить `razbor-tab-check-*` / `create-tab-check-*`.
- CompactMultiButton reorders selected first — убедиться, что UX приемлем для 4 агентов карусели.

## Mid-flight escalation

- Нужен отдельный segmented control вне `multi-button.tsx` — стоп, обновить spec (запрет второго компонента).
