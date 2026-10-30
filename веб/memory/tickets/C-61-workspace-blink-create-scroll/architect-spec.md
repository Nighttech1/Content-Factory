# Architect spec — C-61

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Рабочая страница модуля без debug-подписи и без **моргания** шапки «Конкуренты». Glow **«Создать»** справа сверху на всех `/studio/[moduleId]`. Скролл только колонки под курсором.

## Depends

- **C-60 Done** (сайдбар/AppShell закрыты).
- Skills: `content-factory-ui` § workspace polish + dual feed, `21st-ui-catalog` (`glow button dark react framer-motion`), `taste-skill` (не purple), `web-motion-engine`, `mobile-touch-scroll`.
- C-52 SWR скелетоны **не** откатывать. C-58 last-known count **не** откатывать на `"…"`.

## In scope

### 1. Убрать chrome `// Рабочая страница модуля`

Файл: `components/studio/StudioModuleWorkspace.tsx` — удалить `<p>…{"// Рабочая страница модуля"}</p>`. Заголовок модуля (`mod.label`) + description оставить.

### 2. Корень blink — три независимых фикса

#### A. Opacity pulse на шапке колонки

Файл: `components/studio/workspace/VerticalPostCarousel.tsx`.

Сейчас при `showRefetchHint`:

```tsx
animate={{ opacity: [0.55, 1, 0.55] }}
transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
```

на `motion.div` title + count. Reduce-motion ставит `0.72`.

**Запрет:** любой `opacity` pulse/fade на title («Конкуренты» / «Наши») и на count. Title-row = статичный `opacity: 1` (можно обычный `div`).

`data-testid="feed-refetching"` + `aria-busy` **оставить** при hint. Тихий индикатор **рядом** (точка/spinner), **не** на тексте заголовка.

#### B. `handleCompetitorsTopicSearch` = `useCallback`

Файл: `StudioModuleWorkspace.tsx`. Сейчас обычная `function` → новая ссылка каждый render → debounce `useEffect` в карусели (`deps: [onCompetitorsTopicSearch]`) → **вечный refetch** → вечный hint/pulse.

```
handleCompetitorsTopicSearch = useCallback((topic) => { … fetchFeed(..., "competitors") }, [fetchFeed])
```

Не добавлять `committedTopic` в deps без нужды.

#### C. `loading` конкурентов не OR с ours-fetch

Сейчас: `loading={feedLoading || competitorsLoading}` на колонке конкурентов. `showRefetchHint = loading && displayPosts.length > 0` → hint **горит**, пока грузятся **наши** (`feedLoading`), даже если competitors idle.

Контракт:

| Колонка | `loading` проп | Скелеты (пусто) | `showRefetchHint` |
|---------|----------------|-----------------|-------------------|
| Наши | `feedLoading` | `feedLoading && ours empty` | только если **этот** fetch и карточки уже есть |
| Конкуренты | **не** `feedLoading \|\| …` для hint | первая пустая: `feedLoading \|\| competitorsLoading` и `posts.length === 0` | **только** `competitorsLoading && displayPosts.length > 0` |

Реализация (на выбор Frontend, lock семантики):

- развести пропы (`loading` vs `refreshing`) **или**
- competitors: `loading={competitors.length === 0 ? (feedLoading \|\| competitorsLoading) : competitorsLoading}`

Полный `fetchFeed(..., "full")` не должен пульсировать chrome конкурентов, если посты уже на экране.

### 3. Glow «Создать»

Все `/studio/[moduleId]` (когда модуль найден): справа сверху в header workspace.

| Правило | Деталь |
|---------|--------|
| Label | **Создать** |
| Паттерн | 21st **`@waleedkibhen/components/glow-button`**: MCP `search` / `get_component`. Import **`framer-motion`**, не `motion/react`. Glow = Cobalt/Gold Dark Luxury, **не** purple |
| MCP down | adapt паттерна вручную **или** `ReactiveButton` + тонкий cobalt glow (`taste-skill`) |
| Клик | тот же путь, что `DraftEmptyBlock` / `openDraftEditor`: CapCut-модуль → `/studio/.../edit/...`; иначе `openDraftsNonce` (вкладка Черновики) |
| testid | `workspace-create-btn` |

`decisions.md`: `21st id=waleedkibhen/glow-button · element=create-cta · motion=yes` или `21st=unavailable`.

Не дублировать вторую SpeechRecognition / GenerationDrawer CTA instead of this button.

### 4. Nested scroll

Колоночный скроллер уже: `overflow-y-auto overscroll-contain` (`VerticalPostCarousel` `*-scroll`). Этого **мало**, если wheel всплывает на `body` / страницу workspace (`pb-16`).

| Правило | Деталь |
|---------|--------|
| CSS | `overscroll-contain` на column scroller **обязателен** |
| Wheel | при hover колонки **не** бабблить на страницу; у края колонки — contain (не скроллить `document`) |
| Touch | `overscroll-behavior: contain`; `mobile-touch-scroll` |
| Layout | dual-carousels занимают оставшуюся высоту viewport, чтобы основной скролл страницы не конкурировал |

Реализация wheel: `ref` + `addEventListener('wheel', …, { passive: false })` если нужен `preventDefault` (React `onWheel` часто passive). Не ломать вложенный скролл чата Razbor (это C-62).

## Out of scope

- Сайдбар children/width → C-60 (уже закрыт)
- Razbor CTA / drafts cards / hide chat scrollbar → **C-62** (не править `RazborModal` здесь)
- Backend / AI Bridge / Prisma
- Менять C-52 скелеты первой загрузки

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Chrome, useCallback, loading split, glow, scroll isolation | **Frontend** | 21st glow-button first |
| Снять pulse шапки; микро glow; reduced-motion | **Motion** | после DOM; **запрет** вернуть `[0.55,1,0.55]` |
| Backend / AI Bridge | — | нет |

## Contracts

```
NO "// Рабочая страница модуля"
header title+count opacity === 1 always
handleCompetitorsTopicSearch is useCallback
competitors showRefetchHint ⇔ competitorsLoading && posts already visible
Create = glow CTA top-right all module workspaces
column wheel does not scroll the page
```

## Acceptance criteria (язык Клиента)

1. На `/studio/[moduleId]` нет подписи «Рабочая страница модуля» (S13).
2. Поиск/тема конкурентов: заголовок «Конкуренты» и число **не** мигают (S13). Пока грузятся только наши — конкуренты не пульсируют.
3. Справа сверху glow **Создать** минимум на двух moduleId (карусель + не карусель).
4. Колёсико над колонкой крутит только её (`overscroll-contain` + no bubble) (S13).

## Risks

- Motion C-52 **намеренно** повесил pulse на hint — C-61 **supersedes**.
- Стабильный `useCallback` без `fetchFeed` в deps сломает topic; с лишними deps — снова loop.
- Overlap `VerticalPostCarousel` с C-62 — **сначала этот тикет**, C-62 не стартовать.

## Mid-flight escalation

- Отдельный проп `isRefreshing` вместо перегрузки `loading` — ок внутри тикета, не Backend.
- Live LLM «Создать» (полный generate) — не этот тикет; кнопка = текущий draft/CapCut вход.
