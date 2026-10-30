# Architect spec — C-65

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

На workspace **`carousel-engine`**: убрать длинное описание из шапки; CTA **«Создать карусель»** открывает **`CreateCarouselModal`** (чат слева + 9:16 preview с L/R справа). Модалка **отдельная** от `RazborModal`.

## Depends

- **C-64 Done** (или тот же Frontend-pass сразу после stack 9:16 — тогда C-65 владеет Create CTA / desc, C-64 уже зафиксировал aspect).
- Wave `memory/waves/W-2026-10-07-ux-carousel-nav.md`.
- Skills: `content-factory-ui` § CreateCarouselModal, `content-pipeline-agents` (composer/mic C-59), `21st-ui-catalog`, `client-scenarios` S15.
- C-59 `AgentChatComposer` reuse (mic) — обязателен в чате модалки.

## In scope

### 1. Workspace chrome

Файл: `components/studio/StudioModuleWorkspace.tsx` (после C-64 aspect work).

- **Скрыть** long module description на `carousel-engine` (не показывать многострочный marketing blurb в шапке).
- Кнопка **«Создать карусель»** (`data-testid` например `create-carousel-btn`) — справа сверху; 21st glow / ReactiveButton Dark Luxury (не purple).
- Общий «Создать» других модулей **не ломать**; на carousel — канон «Создать карусель».

### 2. `CreateCarouselModal` (new)

Предлагаемый путь: `components/studio/workspace/CreateCarouselModal.tsx`.

| Region | Content |
|--------|---------|
| Left | Chat — `AgentChatComposer` (+ mic C-59); mock/local draft messages OK |
| Right | Preview **9:16** stack/slides с **L/R**; цикл/clamp по слайдам |

- Desktop: два региона рядом; mobile: tab/stack OK.
- Close: overlay / Esc / явная кнопка.
- **Не** реиспользовать оболочку Razbor как «тот же modal с другим title» — отдельный компонент и состояние open.
- Не подменять полный GenerationDrawer HITL без нового тикета.
- Preview scrollbar = styled visible (как C-64 stack); chat scrollbar = Claude-hide как Razbor chat (C-62).

### 3. Wire

- State open в workspace; не открывать Razbor при Create.
- Draft preview может писать в существующий drafts store **опционально** (local mock slides) — без Prisma; HITL publish не вызывать.

## Out of scope

- Feed stack / fixtures / FeedPostCard L/R → **C-64**
- Route loading / dynamic / AppShell → **C-63** (dynamic Razbor только; Create modal может быть static import или dynamic-on-open — на усмотрение Frontend, не блокировать C-63)
- Изменения cascade Razbor → запрещено регрессом
- Mesh / Schedule / plan file

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Hide desc + CTA + CreateCarouselModal | **Frontend** | 21st modal pattern |
| Modal enter/exit spring; L/R preview | **Motion** | reduced-motion |
| Backend / AI Bridge | — | **не звать** (mock chat OK) |

## Path ownership (this ticket)

```
components/studio/workspace/CreateCarouselModal.tsx   # NEW
components/studio/StudioModuleWorkspace.tsx           # hide desc + Create CTA + open state ONLY
```

**Не трогать параллельно:** `FeedPostCard`, `VerticalPostCarousel`, `feed-fixtures` (C-64), `AppShell` / `loading.tsx` (C-63), `RazborModal` (read-only reference).

## Contracts

```
carousel-engine: no long description chrome
CTA «Создать карусель» → CreateCarouselModal open
CreateCarouselModal ≠ RazborModal (separate component/state)
Layout: chat left + 9:16 preview L/R right
AgentChatComposer reused (mic)
```

## Acceptance criteria (язык Клиента)

1. На каруселях нет длинного текста-описания модуля в шапке.
2. Кнопка «Создать карусель» открывает модалку с чатом и превью 9:16.
3. L/R в превью листают слайды; Razbor с конкурента по-прежнему отдельный поток.
4. Esc/overlay закрывают Create-модалку.

## Risks

- Дублирование chrome с Razbor — держать компоненты раздельными; shared только composer/slides subcomponents если уже есть (`RazborSlidesCarousel` reuse OK).
- C-63 dynamic Razbor — не импортировать Create внутрь Razbor chunk.

## Mid-flight escalation

- Нужен реальный LLM create pipeline — новый тикет + AI Bridge; в C-65 mock достаточно.
