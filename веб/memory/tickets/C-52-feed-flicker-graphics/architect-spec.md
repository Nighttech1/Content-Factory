# Architect spec — C-52

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Убрать моргание колонки конкурентов при поиске/рефетче (stale-while-revalidate) и сделать карточки инфографики честными: без круглой Play на статике, с комментариями и репостами.

## Depends

- Trainer A — `memory/trainer/2026-10-06-factory-parity-grade.md`
- Wave `memory/waves/W-2026-10-06-factory-parity.md`
- Skills: `content-factory-ui` § Dual feed loading + FeedPostCard play; `21st-ui-catalog` (skeleton ≠ refetch replace)
- **Порядок волны:** **C-52 → C-53 → C-54**. Overlap `FeedPostCard` / `VerticalPostCarousel` / `StudioModuleWorkspace` — не параллелить.

## In scope

### 1. SWR в `VerticalPostCarousel`

Корень: `loading ? skeletons : posts`. Родитель передаёт `loading={feedLoading || competitorsLoading}` — **проп можно оставить**, семантика внутри карусели меняется.

| Состояние | UI |
|-----------|-----|
| `loading && displayPosts.length === 0` | pulse-скелетоны OK (первая пустая загрузка) |
| `loading && displayPosts.length > 0` | **оставить карточки**; не unmount сетки |
| Рефетч с ошибкой | старые карточки остаются |

Тихий индикатор рефетча: точка/spinner/`…` в шапке колонки (уже есть `loading ? "…"` у счётчика). Motion: не pulse-replace всей сетки. `data-testid="feed-refetching"` когда `loading && posts.length > 0`.

**Запрещено:** `if (loading) return skeletons` без `posts.length === 0`.

Локальный title-filter поиска **не** должен сам по себе включать скелетоны (это не refetch).

### 2. Play overlay — media-aware

Вынести хелпер `shouldShowFeedPlay(post, moduleId?)` (например `lib/studio/feed-play.ts`).

**Скрыть Play** если любое:

- `post.mediaType === "IMAGE"`
- `moduleId === "aesthetic-graphics"`
- нет видео-намерения: нет `mediaUrl` **и** `mediaType` не `VIDEO` (C-49 fake-play на постере **запрещён** для картинок)

**Показать Play** если видео/рилс: `mediaType === "VIDEO"` и/или playable `mediaUrl`. Карусель (`CAROUSEL_ALBUM`) — Play только если есть `mediaUrl` видео, иначе нет (слайды — картинки).

`moduleId` прокинуть: `StudioModuleWorkspace` → `VerticalPostCarousel` → `FeedPostCard`. Не включать drafts/razbor-флаги в этом тикете (C-53).

Нет autoplay. `data-testid="feed-play-btn"` **отсутствует**, если Play скрыт.

### 3. Метрики

`FeedPostMetrics.shares?: number` в `lib/studio/feed-types.ts`.

На карточке (ours + competitors, **включая grid**): лайки + комментарии (если число задано) + репосты/shares (если число задано). Не прятать comments только из‑за `isGrid`.

Фикстуры `aesthetic-graphics` (и по желанию остальные CORE) — заполнить `shares` mock-числами. Live Graph: `shares` не выдумывать (Instagram Graph не даёт shares) — поле omit; comments уже мапятся.

Подписи метрик на карточке — RU (`просмотры` / `лайки` / `комм.` / `репосты`), чтобы не ждать C-54 для приёмки S7.

## Out of scope

- Опубликовано/Черновики и Разбор на всех модулях → **C-53**
- Mesh pipelines → **C-53**
- `/schedule`, сайдбар i18n, Launchpad title → **C-54**
- Backend feed API, Prisma, IG Graph новые поля
- AI Bridge / новые агенты
- C-48 описания плиток

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| SWR + play helper + metrics UI | **Frontend** | карусель, карточка, types, fixtures |
| Тихий refetch (не pulse-сетка) | **Motion** | шапка колонки; `prefers-reduced-motion` |
| Feed API / IG | — | reuse; **Backend не звать** |
| AI Bridge | — | нет |

## Contracts

### Loading

```
showSkeletons = loading && displayPosts.length === 0
showRefetchHint = loading && displayPosts.length > 0
```

Родитель может по-прежнему ставить `loading={feedLoading || competitorsLoading}` на competitors.

### Play

| Input | Play |
|-------|------|
| `aesthetic-graphics` любой пост | нет |
| `mediaType === "IMAGE"` | нет |
| `mediaType === "VIDEO"` или video `mediaUrl` | да, click-only |
| только `thumbUrl`, без video | нет |

### Shares

```ts
metrics: { likes: number; views: number; comments?: number; shares?: number }
```

## Acceptance criteria (язык Клиента)

1. На `/studio/[moduleId]` после появления карточек конкурентов поиск/смена темы **не** заменяет столбец pulse-скелетонами (сценарий S7).
2. На `/studio/aesthetic-graphics` нет круглой Play на статичных картинках.
3. На тех же карточках видны комментарии и репосты (если в данных есть числа; в mock graphics — есть).
4. Guard + Playwright smoke после Deployer.

## Risks

- Smoke C-40 сейчас **требует** `loading={feedLoading \|\| competitorsLoading}` как признак «loading колонки» — не удалять проп; Tester должен сменить assert с «скелеты при loading» на SWR.
- C-49 regression «Play на всех карточках» **superseded** этим тикетом для IMAGE/graphics.
- Overlap с C-53 на тех же файлах workspace — **сначала C-52**.
- `motion.div key={published\|drafts}` не должен сбрасывать сетку конкурентов при refetch.

## Mid-flight escalation

- Нужен отдельный `isRefreshing` проп вместо перегрузки `loading` — обновить spec, не плодить Backend.
- Live shares из Graph — новый Backend-тикет; в C-52 omit.
