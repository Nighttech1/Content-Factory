# Architect spec — C-62

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Razbor карусели: чат без видимого scrollbar; сценарист → **дизайнер**; дизайнер → публицист; тумблер белый, **Наши** disabled до слайдов. Черновики: карточки как published + L/R + дата слота `cf.schedule.v1`.

## Depends

- **C-60 и C-61 Done.**
- Skills: `content-pipeline-agents` § C-62, `content-factory-ui` § Razbor + drafts, `21st-ui-catalog` (`claude hide scrollbar chat`, `carousel card left right`).
- C-59 cascade Designer+Publisher **остаётся**. Copy CTA сценариста «Отправить публицисту» **superseded**.
- C-51: non-carousel **без** Designer/Publisher/CTA handoff.

## In scope

### 1. Скрыть scrollbar чата Razbor

Файл: панель сообщений `RazborModal` (`data-testid={`razbor-pane-${activeTab}`}`, сейчас `[scrollbar-width:thin]`).

```
scrollbar-width: none
-ms-overflow-style: none
::-webkit-scrollbar { display: none }  /* overlay / webkit hide */
```

Колёсико/палец **работают**. Не `overflow: hidden` на ленте. 21st search `claude hide scrollbar chat transcript react` — optional class util, не стоп.

### 2. Handoff CTA

Только `moduleId === "carousel-engine"` (как сейчас `carousel`).

| Откуда | Кнопка | Куда |
|--------|--------|------|
| Сценарист (после готового скрипта) | **«Отправить дизайнеру»** | таб `designer` (+ `handleRunDesigner` если designer ещё `idle`) |
| Дизайнер (низ панели) | **«Отправить публицисту»** | таб `publisher` (datetime, **без** чата) |

Сценарист **не** вызывает `setActiveTab("publisher")`.

testids:

- Сценарист: **`razbor-send-designer`** (новый канон). Старый `razbor-send-publisher` на сценаристе **убрать** — Tester обновляет C-59 guards.
- Дизайнер: оставить `razbor-send-publisher-designer`.

Non-carousel: этих кнопок нет.

Промпты/pipeline mock **не** менять (нет AI Bridge). Это UI-навигация табов.

### 3. Тумблер Конкуренты / Наши

Файл: `RazborCarouselToggle.tsx` + wire в `RazborModal`.

| Правило | Деталь |
|---------|--------|
| Активный текст | **белый** (`text-white` / `--text-primary` белый), не `bg-canvas` на золотой pill и не muted |
| Неактивный | muted OK |
| **Наши** | `disabled` + серый, пока нет нашей карусели: нет `previewDraft`/draft **или** `slides.length === 0` |
| Конкурент | всегда доступен |

**Баг спеки:** `previewDraft` есть в пропсах `RazborModal` и передаётся из workspace, но **не деструктурируется** — сессия не гидрирует draft с вкладки Черновики. C-62: на open `setDraft(previewDraft)` (и слайды), чтобы «Наши» включались когда превью уже есть.

Клик disabled «Наши» — no-op, `aria-disabled`.

### 4. DraftsPanel = карточки как published

Файлы: `DraftsPanel.tsx`, прокидка из `VerticalPostCarousel` (`aspectRatio`, `layout` / `moduleId`).

Сейчас: узкий list-row (`h-12 w-8` thumb) ≠ `FeedPostCard`.

| Правило | Деталь |
|---------|--------|
| Размер | тот же `aspectRatio`, что у `FeedPostCard` модуля (`3/5` карусель, `9/16` reels, `4/5` иначе) + тот же `layout` (grid 3-col vs stack) |
| Слайды | кнопки **L / R на карточке** (`data-testid="draft-slide-prev"` / `draft-slide-next`); цикл или clamp по `slides`; не только превью снизу Razbor |
| Дата | под карточкой слот из **`cf.schedule.v1`**: `slotForPost(file, draft.id)` → `startsAt`, подпись `formatSlotLabelRu`. User-facing «scheduledAt» = это поле. Нет слота — блок даты не выдумывать |
| Клик карточки | как сейчас `onSelectDraft` |

Reuse chrome `FeedPostCard` **или** общая обёртка aspect; не плоский list. 21st `carousel card left right image buttons dark` → adapt `framer-motion`.

Не писать в соцсети. Не менять схему Prisma.

## Out of scope

- Mesh, сайдбар, glow «Создать», search debounce (C-60/C-61)
- Designer на graphics/reels
- Чат публициста / LLM publish
- Backend calendar API
- Новый SpeechRecognition

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| CTA, scrollbar hide, toggle disabled, hydrate previewDraft, Drafts cards+L/R+slot | **Frontend** | reuse `lib/schedule/storage.ts` |
| Toggle pill + slide L/R micro | **Motion** | после DOM |
| AI Bridge / Backend | — | **не звать** (копи CTA ≠ новый prompt) |

## Contracts

### Cascade `carousel-engine`

```
Scriptwriter CTA → designer tab (not publisher)
Designer bottom CTA → publisher pane
Publisher: datetime → cf.schedule.v1
STOP — no network publish
```

### Toggle

```
oursEnabled = (previewDraft ?? sessionDraft)?.slides.length > 0
active label color = white
```

### Drafts

```
card aspect === FeedPostCard aspect for module
scheduled label = cf.schedule.v1.slots[].startsAt for draft.id
```

## Acceptance criteria (язык Клиента)

1. Razbor карусели: у сценариста «отправить дизайнеру»; у дизайнера снизу — к публицисту (S14). Другой модуль — этих CTA нет.
2. Тумблер: активный текст белый; «Наши» серые и недоступны, пока нет нашей карусели; после генерации/превью черновика — включаются (S14).
3. Лента чата без полоски scrollbar, скролл живой (S14).
4. Вкладка Черновики: карточки того же кадра, что «Опубликовано»; стрелки слайдов; дата слота под карточкой, если публицист сохранил время (S14).

## Risks

- Guards C-59 ищут `razbor-send-publisher` на сценаристе — Tester **переписывает** на designer CTA.
- `previewDraft` hydrate в `resetSession` — не затирать слайды после designer chat.
- C-61 уже трогал `VerticalPostCarousel` — C-62 только прокидка aspect/layout в `DraftsPanel`, **не** возвращать opacity pulse.

## Mid-flight escalation

- Серверный календарь — новый Backend-тикет.
- Live designer LLM — mock остаётся acceptance.
