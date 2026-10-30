# Architect spec — C-49

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Chrome dual-feed workspace (`StudioModuleWorkspace`): убрать лишние подписи и `ModuleIdeaBar`; поиск конкурентов в шапке правой колонки (высота = Ours Published/Drafts); круглая Play на всех карточках **без autoplay**; визуальный паритет Ours / Competitors.

## Depends

- Trainer A — `memory/trainer/2026-10-05-carousel-razbor-wave-grade.md`
- Wave `W-2026-10-05-carousel-razbor`
- Skills: `content-factory-ui` § Module Workspace C-49+ (supersedes C-28 IdeaBar)
- **Порядок волны:** **C-49 → C-50 → C-51**

## In scope

### 1. Убрать chrome-шум

| Убрать | Где |
|--------|-----|
| Subtitle «Опубликованные посты модуля» | `StudioModuleWorkspace` → `VerticalPostCarousel` `subtitle` Ours |
| Subtitle «Актуальные карусели ниши» / «Топ карусели по теме…» | Competitors `subtitle` — **не передавать** (или пусто / prop optional) |
| `ModuleIdeaBar` | Unmount из workspace; topic commit **не** через верхнюю полосу |

`ModuleIdeaBar.tsx` можно оставить файл (мёртвый) или удалить импорт-only — **не** восстанавливать в workspace без нового тикета.

### 2. Competitors search (замена IdeaBar)

В шапке колонки **Competitors** (внутри `VerticalPostCarousel` при `tone="competitors"` или sibling slot):

- Строка поиска **той же высоты**, что Ours toggle Published/Drafts (`py-1.5` + border chrome).
- Placeholder: поиск по названию / теме (коротко, RU).
- `data-testid="competitors-search"` (или согласованный в guards).

**Поведение (решение Архитектора):**

1. **Локальный filter** по `post.title` (case-insensitive contains) на уже загруженном `competitors[]` — мгновенно при вводе.
2. **Debounce topic → refetch** (~350–500ms): если query выглядит как «тема» (trim length ≥ 2) **или** пользователь явно «коммитит» (Enter), вызвать существующий `fetchFeed(query, "competitors")` / тот же feed API `GET /api/studio/[moduleId]/feed?topic=` — **без нового Backend**.
3. Пустой query / clear → `fetchFeed(undefined, "competitors")` (ниша, C-40) + сброс local filter.
4. Пока идёт refetch — `competitorsLoading`; не blankить Ours.

Не возвращать `ModuleIdeaBar`. Не просить URL/ники конкурентов.

### 3. Play overlay на FeedPostCard

- Круглая кнопка Play по центру media на **всех** карточках (ours + competitors).
- **UI state per card** (`playing` local / keyed by `post.id` в карточке) — клик Play ↔ Pause.
- **No autoplay:** ни на mount, ни IntersectionObserver, ни muted auto.
- Медиа:
  - если у поста есть playable URL (`mediaUrl` optional — см. Contracts) → `<video>` (controls нет; play/pause через overlay);
  - иначе **poster** (`thumbUrl`) + **fake play** OK (иконка Pause / лёгкий pulse, без реального video) — не блокер приёмки.
- Play **не** открывает CapCut / Razbor (Razbor остаётся отдельной кнопкой).

### 4. Visual parity

- Одинаковый grid/aspect/gaps/glass chrome у обеих колонок.
- После удаления subtitle — выровнять header так, чтобы search ↔ tabs сидели на одной визуальной линии (desktop `lg:grid-cols-2`).

## Out of scope

- Settings pageSize → **C-50**
- Razbor welcome / pipeline / timeline → **C-51**
- Launchpad tiles, `/admin/mesh`, live IG scrape changes, DDL
- Реализация реального video CDN / Graph media download
- Возврат C-28 IdeaBar regression

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Workspace unmount IdeaBar + subtitles + search wire | **Frontend** | `StudioModuleWorkspace`, `VerticalPostCarousel` |
| Play overlay chrome | **Frontend** | `FeedPostCard` |
| Hover / play icon spring | **Motion** | `web-motion-engine`; без autoplay |
| Feed API | — | Reuse existing; **Backend не звать** |

## Contracts

### FeedPost (optional extend, minimal)

```ts
// optional — только если уже есть в live map; иначе omit
mediaUrl?: string;
durationSec?: number; // hint for C-51 scrubber; C-49 may ignore
```

Не ломать fixtures без `mediaUrl`.

### Search → API

| Input | Action |
|-------|--------|
| Type (title match) | Client filter on current list |
| Debounced / Enter topic | `fetchFeed(topic, "competitors")` existing route |
| Clear | Niche refetch + clear filter |

### Play

| Rule | Value |
|------|-------|
| Autoplay | **Forbidden** |
| Scope | Per-card UI state |
| CapCut | Not from play |

## Acceptance criteria (язык Клиента)

1. На `/studio/carousel-engine` нет строк «Опубликованные посты модуля» / «Актуальные карусели ниши» и нет верхней полосы темы (ModuleIdeaBar).
2. Справа — поиск той же высоты, что слева Published/Drafts; ввод фильтрует по названию; тема с debounce обновляет конкурентов через существующий feed.
3. На карточках Ours и Competitors круглая Play; клик играет/пауза; **видео само не стартует**.
4. Колонки выглядят паритетно (сетка/карточки/шапка).
5. Guard + Playwright smoke после Deployer.

## Risks

- Потеря topic UX без IdeaBar — search в Competitors **обязан** уметь refetch по теме (иначе регресс C-40).
- Двойной filter+refetch может «мигать» список — debounce + keep previous until response.
- Fake play без video — Клиент OK по контракту; не подменять autoplay.
- Overlap paths с C-50 (`StudioModuleWorkspace` slice) — **сначала C-49**, потом C-50.

## Mid-flight escalation

- Live typeahead Graph spam → не делать; только debounce через feed API.
- Нужен Backend `?q=` title search — новый тикет; в этой волне client filter + topic refetch.
