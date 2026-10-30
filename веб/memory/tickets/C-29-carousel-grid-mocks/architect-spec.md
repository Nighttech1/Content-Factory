# Architect spec — C-29

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

На `/studio/carousel-engine` ленты **Ours** и **Competitors** показать как **сетку 3×7** (21 карточка), с aspect **3:5** и стабильными mock-фото (picsum / unsplash), плюс кнопка **«Черновики»** в шапке Ours (stub под C-30).

## In scope

### Backend — expand fixtures

1. В `lib/studio/feed-fixtures.ts` для `carousel-engine`:
   - **≥21** posts в `ours`, **≥21** в `competitors`.
   - У **каждой** карточки обязательный `thumbUrl` на стабильный CDN:
     - `https://picsum.photos/seed/{stableId}/600/1000` **или**
     - `https://images.unsplash.com/...` с фиксированным query (одинаковый URL при каждом reload).
   - Локальные `/placeholders/feed/*.svg` можно оставить как fallback, но не как единственный визуал приёмки.
2. Контракт `FeedPost` / `GET /api/studio/[moduleId]/feed` **не ломать** (C-28). Topic-filter competitors без изменений.
3. Smoke: расширить / добавить `scripts/smoke-c29-feed-grid.ts` — assert counts ≥21 и наличие `thumbUrl` у carousel-engine.

### Frontend — grid + aspect + Drafts CTA

1. `VerticalPostCarousel` (или module-aware variant): для `carousel-engine` scroll-area = **CSS grid `grid-cols-3`**, визуально **7 рядов** (21 ячейки в viewport при достаточном height; overflow-y если больше 21).
2. `FeedPostCard` media: aspect **`3/5`** на carousel-engine (сейчас `4/5` — менять через prop `aspect="3/5"` / `layout="grid"`, не глобально ломая reels до C-31).
3. Шапка **Ours**: справа кнопка **«Черновики»** (`data-testid="carousel-drafts-btn"`).
   - Click: открыть stub panel/list (пустое «Пока нет черновиков» OK) — проводка к store C-30 позже; **не** открывать CapCut.
4. Проводка props из `StudioModuleWorkspace` при `moduleId === "carousel-engine"`.

### Motion (light)

- Лёгкий stagger появления карточек сетки; `useReducedMotion` уважать.
- Без тяжёлого layout thrash при scroll.

## Out of scope

- Modal «Разбор» и agent pipeline → **C-30**.
- Gate CapCut / competitor → editor → **C-31**.
- Expand fixtures до 21 для reels (можно частично в C-31; C-29 фокус = carousel-engine).
- Prisma / migrate / Redis / publish / live IG.
- Prod deploy.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Fixtures + smoke | Backend | 21+21 thumbs; no DB |
| Grid UI + Drafts CTA | Frontend | `VerticalPostCarousel`, `FeedPostCard`, workspace wire |
| Motion | Motion | light stagger only |
| AI Bridge | — | не нужен |

## Contracts

### Feed (unchanged shape)

```ts
// GET /api/studio/carousel-engine/feed
{ ours: FeedPost[]; competitors: FeedPost[] }
// carousel-engine: ours.length >= 21, competitors.length >= 21
// every post.thumbUrl is absolute https URL (picsum or unsplash)
```

### UI props (new)

| Prop / surface | Value |
|----------------|-------|
| Carousel layout | `layout="grid"` → `grid-cols-3`, ~7 rows |
| Card aspect | `aspectRatio="3/5"` for carousel-engine |
| Drafts button | Ours header only; stub panel |

### Invariants

- Сетка и Drafts CTA только на **carousel-engine** в этом тикете (другие moduleId — прежнее поведение C-28, пока C-31 не уточнит reels).
- Нет перехода в CapCut из «Черновики».

## Acceptance criteria (язык Клиента)

1. На `/studio/carousel-engine` в Ours и Competitors карточки стоят **в 3 колонки**, видно порядка **7 рядов** (скролл при необходимости).
2. Карточки **вытянутые 3:5**, не квадрат и не пустой градиент без фото.
3. На фото — **реальные mock-картинки** с интернета (стабильные URL).
4. В шапке Ours справа есть **«Черновики»**; клик открывает заглушку списка, не редактор CapCut.
5. Guard/smoke: ≥21+21 с `thumbUrl`. Safety: без wipe БД.

## Risks

- **CDN/CORS/hotlink:** picsum/unsplash обычно ок для `<img>`; при блокировке — seed picsum как primary.
- **Perf 42 images:** lazy `loading="lazy"` + фиксированный aspect, чтобы не прыгала сетка.
- **Overlap с C-30:** Drafts stub не должен конфликтовать с будущим store — один `data-testid`, пустой list API/zustand later.
- **Aspect drift:** не менять aspect глобально до C-31 (reels → 9:16).

## Mid-flight escalation

Если 3×7 не влезает на 1440 без горизонтального скролла: стоп → Architect (допуск: вертикальный scroll внутри колонки, **запрет** horizontal page scroll). Если Client требует сетку на всех модулях — отдельный тикет / C-31 для reels.
