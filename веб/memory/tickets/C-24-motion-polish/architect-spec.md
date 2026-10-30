# Architect spec — C-24

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Довести микро-анимации Studio / Inspector до DEV_PLAN **7.2**: появление карточек и шагов drawer со **`staggerChildren: 0.08`**, скелетоны для **видео 9:16** и **карусели** в loading/render, полное уважение **`prefers-reduced-motion`**. Без нового purple-glow китча; spring-токены бренда (`damping` ~25–28, `stiffness` ~260–320). Skills: `web-motion-engine`, `content-factory-ui`.

## In scope

- Stagger **0.08** на:
  - сетке модулей Studio (`ModuleSelectorGrid` / glass cards);
  - шагах списка в `GenerationDrawer` (agent steps);
  - при необходимости — analytics KPI cards на `/analytics`, если там список карточек без stagger (только если уже motion-обёртка рядом; не раздувать scope на новый layout).
- Skeleton loaders:
  - Reels / video preview **9:16** во время loading/render (`ReelsPlayer` / `MediaDeck`);
  - carousel slides во время loading (`CarouselDeck` / MediaDeck).
- `useReducedMotion()` / `prefers-reduced-motion`: при reduce — **stagger delay = 0**, без бесконечных pulse на скелетонах (статичный placeholder OK).
- `data-testid` на скелетонах (например `skeleton-video`, `skeleton-carousel`) для guard C-24.

## Out of scope

- SSE / `useJobStream` (C-23) — не дублировать; если drawer steps ещё на simulate, stagger всё равно на список `agentSteps`.
- Новые экраны, смена layout Inspector, DnD логика карусели.
- Remotion render pipeline, HeyGen.
- Смена цветовых токенов DESIGN.md / purple themes.
- E2E RBAC / Armenian font guards (C-25).
- WebGL.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Structure / testids / skeleton markup | **Frontend** | placeholders, loading flags wiring |
| Timing / stagger / springs | **Motion** | после Frontend; `web-motion-engine` |
| Backend | — | нет |
| QA | Tester → Fixer | reduce-motion + skeleton visible |
| Localhost | Deployer | `/studio`, `/studio/inspect/:id` |
| Приёмка | Client | 7.2 polish |

## Contracts

### Motion tokens

```ts
const STAGGER = 0.08;
const SPRING = { type: "spring", damping: 28, stiffness: 280 }; // band 25–28 / 260–320
// reduceMotion → staggerChildren: 0, transition: { duration: 0 } or instant
```

### Skeleton

- Video: aspect **9:16**, glass-muted shimmer **или** static block if reduced-motion; не карточка-в-карточке с лишней обводкой.
- Carousel: N placeholder slides (или 1–3) в том же треке, что и реальные слайды.
- Показ только когда loading/render flag true; скрытие при ready без layout jump (min-height / aspect lock).

### Loading signal

Использовать уже существующие inspect/studio loading flags если есть; иначе Frontend добавляет локальный `isMediaLoading` только для demo/mock delay — **не** новый API.

## Files to touch (expected)

| Path | Owner | Action |
|------|-------|--------|
| `components/studio/ModuleSelectorGrid.tsx` | Frontend → Motion | stagger parent/children 0.08 |
| `components/studio/GenerationDrawer.tsx` | Frontend → Motion | stagger agent steps 0.08 |
| `components/inspect/ReelsPlayer.tsx` / `MediaDeck.tsx` | Frontend → Motion | 9:16 skeleton |
| `components/inspect/CarouselDeck.tsx` | Frontend → Motion | carousel skeleton |
| `components/analytics/*` (optional) | Motion | only if cards list lacks stagger and trivial |
| `memory/tickets/C-24-motion-polish/guards.md` | Tester | **new** |

## Acceptance criteria (язык Клиента)

1. На `/studio` карточки модулей появляются **по очереди** (лёгкий stagger), не все разом «хлоп».
2. В drawer шаги агентов тоже с мягким stagger **0.08**.
3. На Inspector, пока медиа грузится / рендерится, вижу **скелетон** под вертикальное видео 9:16 и под слайды карусели — не пустая дыра и не резкий прыжок контента.
4. Если в ОС включено «уменьшить движение» — задержки stagger **исчезают**, скелетон без навязчивой анимации.
5. Внешний вид остаётся Dark Luxury / glass; без новых фиолетовых glow-наборов.

## Risks

- Двойной stagger (grid + page) → ощущение медленности; Motion: один уровень stagger на список.
- Конфликт с C-23 переписью drawer: **не** параллелить overlapping `GenerationDrawer.tsx` / `studio-store` пока C-23 Frontend не сдан (см. execution plan).
- Skeleton без `data-testid` — guard слепой.

## Safety

- Нет DB / Redis / media wipe.
- Не трогать `.env` secrets.
- Не force-publish.

## Mid-flight escalation

Если loading flag отсутствует и нужен API — стоп → Architect (не выдумывать fake SSE в C-24).
