# Architect spec — C-50

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

В `/settings` блок **«Рилсы»** с настройкой «Отображение рилсов (количество на странице)»; значение сохраняется в браузере и режет количество постов в dual-feed workspace (ours + competitors).

## Depends

- **C-49** chrome done or at least path-stable on `StudioModuleWorkspace` (slice wire после search).
- Pattern: `lib/settings/llm-models.ts` (localStorage prefs, no secrets).
- Wave order: C-49 → **C-50** → C-51.

## In scope

### 1. Settings UI

На `app/settings/page.tsx` — секция рядом с LLM:

- Заголовок: **Рилсы**
- Первая настройка: **Отображение рилсов (количество на странице)** — number input или select.
- `data-testid="settings-reels-panel"` / `settings-reels-page-size`.

### 2. Persist (решение Архитектора)

| Key | `cf.reels.pageSize` |
|-----|---------------------|
| Module | `lib/settings/reels-display.ts` (новый, рядом с `llm-models.ts`) |
| Default | **12** |
| Clamp | min **4**, max **48** (целые) |
| API | `readReelsPageSizeFromStorage()` / `writeReelsPageSizeToStorage(n)` + `DEFAULT_REELS_PAGE_SIZE` |

Только client preference. Секретов нет.

### 3. Wire в feed (минимальный путь)

**Решение: client-side slice only. Backend / `?limit=` не трогать.**

В `StudioModuleWorkspace` (или общий helper):

```ts
const pageSize = readReelsPageSizeFromStorage(); // after hydrate
const oursView = ours.slice(0, pageSize);
const competitorsView = competitors.slice(0, pageSize);
```

Передавать в `VerticalPostCarousel` уже срезанные массивы. Счётчик в шапке колонки = длина **видимого** списка (после slice; search filter применяется **до или после** slice — выбрать: **filter → slice**, чтобы поиск не «терял» совпадения за пределами page).

Порядок: `competitors` raw → (C-49 title filter) → `slice(0, pageSize)` → UI.

Hydrate: как у LLM — `useEffect` read storage, чтобы SSR/hydration не мигал неверным default без необходимости (default 12 OK до hydrate).

### 4. Применение без перезагрузки

Смена на Settings → при следующем заходе на Studio читается storage. Опционально: `storage` event — **не обязательно** для приёмки.

## Out of scope

- Backend feed `?limit=` / Prisma / Redis
- Infinite scroll / pagination UI (только «сколько на странице»)
- C-49 search chrome, C-51 Razbor
- Менять LLM-панель контракт

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Settings UI + storage util | **Frontend** | `app/settings/page.tsx`, `lib/settings/reels-display.ts` |
| Workspace slice | **Frontend** | `StudioModuleWorkspace.tsx` |
| Backend | **Не звать** | Client slice достаточно |

## Contracts

### Storage

```ts
const STORAGE_KEY = "cf.reels.pageSize";
// value: number as string, e.g. "12"
```

### Invariants

1. Invalid / missing → default **12**.
2. Slice applies to **both** columns.
3. Не публиковать в соцсети; не трогать generatedMedia.

## Acceptance criteria (язык Клиента)

1. В Настройках есть блок «Рилсы» и поле количества на странице.
2. Сохранил 12 / другое значение — после открытия Studio в колонках не больше N карточек (при достаточном фиде).
3. Смена переживает reload страницы (localStorage).
4. Guard + smoke Settings → Studio.

## Risks

- Overlap с C-49 на `StudioModuleWorkspace` — выполнять **после** C-49.
- Слишком маленький N + search — пустая колонка: emptyLabel уже есть.
- Путаница «Рилсы» на carousel-engine: настройка общая для module workspace feeds (carousel + reels modules) — зафиксировано как page size dual feed, не только CapCut.

## Mid-flight escalation

Если live IG отдаёт тысячи постов и slice на клиенте тормозит — тогда Backend `?limit=` отдельным тикетом. В этой волне **не** открывать Backend.
