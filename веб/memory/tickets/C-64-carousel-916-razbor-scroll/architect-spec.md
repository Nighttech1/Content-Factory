# Architect spec — C-64

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Фид **`carousel-engine`**: вертикальный **stack** превью **9:16** (не grid / не aspect 3:5); fixtures с picsum 9:16 и `slideUrls ≥ 3`; на карточке — центрированные L/R и крупный видимый **Разбор**; колонка со styled scrollbar без обрезки низа. Razbor cascade + testids сохранены.

## Depends

- Wave `memory/waves/W-2026-10-07-ux-carousel-nav.md`.
- **Первый** Frontend-тикет волны 1 (перед C-65 / C-63 на workspace).
- Skills: `content-factory-ui` § Карусели 9:16 stack, `content-pipeline-agents` (Разбор always visible), `21st-ui-catalog`, `client-scenarios` S15.
- C-62 Razbor handoff / drafts cards — **сохранить** cascade; feed L/R по **этому** approved plan (центрированные кнопки на карточке).

## In scope

### 1. Aspect + layout = stack 9:16

Файлы: `components/studio/StudioModuleWorkspace.tsx` (только `feedAspect` / layout для `carousel-engine`), `VerticalPostCarousel.tsx`, при необходимости `DraftsPanel` aspect pass-through.

| Сейчас (типично) | Нужно |
|------------------|--------|
| `aspectRatio` `3/5` + multi-col grid для carousel | **`9/16`** + **stack** (одна колонка / узкий reel-столбец) |
| grid mosaic | **NOT** grid 3/5 |

Другие moduleId (reels уже 9/16 и т.д.) — не ломать; менять канон **carousel-engine**.

### 2. `feed-fixtures`

Файл: `lib/studio/feed-fixtures.ts`.

- Превью/слайды: **picsum** (или эквивалент стабильных URL) в **9:16**.
- У постов-каруселей: `slideUrls.length ≥ 3` (чтобы L/R имел смысл).
- Не ломать типы `feed-types` / consumers smoke без нужды.

### 3. `FeedPostCard`

- Кнопки слайдов **L / R по центру** вертикали карточки (лево/право края), видимые на multi-slide; testids согласовать с существующими (`feed-slide-prev` / `feed-slide-next` или текущие — **не** ломать Razbor entry).
- CTA **«Разбор»** на competitors: **крупный, всегда видимый** (не `opacity-0`, не hover-only). Сохранить `razbor-btn` / существующие testids входа в Razbor.
- Не ломать Play-правила C-52 для video.

### 4. `VerticalPostCarousel` scroll

- Красивый **видимый** vertical scrollbar (Dark Luxury thin track + Cobalt/Gold thumb) — не browser default, не Claude-hide чата.
- **Нет clip** нижних карточек / CTA (padding-bottom / overflow на правильном контейнере).
- Nested scroll `overscroll-contain` C-61 **сохранить**.

### 5. Razbor intact

- `RazborModal` cascade C-51/C-59/C-62 **не ломать**.
- testids: `razbor-btn`, panes, send-designer / publisher — regression.

## Out of scope

- `CreateCarouselModal` / «Создать карусель» → **C-65**
- Route loading / AppShell opacity / Analytics → **C-63**
- Mesh / Schedule → **C-66 / C-67**
- Backend / IG live API / plan file

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| fixtures + card L/R + Разбор + stack 9:16 + scrollbar | **Frontend** | 21st search optional for scrollbar/L-R |
| micro-motion L/R press / card enter (не full-page) | **Motion** | после DOM |
| Backend / AI Bridge | — | **не звать** |

## Path ownership (this ticket)

```
lib/studio/feed-fixtures.ts
components/studio/workspace/FeedPostCard.tsx
components/studio/workspace/VerticalPostCarousel.tsx
components/studio/StudioModuleWorkspace.tsx   # aspect/layout carousel-engine ONLY; leave Create CTA/desc to C-65
components/studio/workspace/DraftsPanel.tsx  # only if aspect/layout must match stack 9:16
```

**Не трогать:** `RazborModal.tsx` logic (кроме если testid wire в card), `CreateCarouselModal`, `AppShell`, analytics, mesh-seed, schedule.

## Contracts

```
carousel-engine feedAspect === "9/16" + stack (not grid 3/5)
fixtures: 9:16 + slideUrls.length ≥ 3 for carousel posts
FeedPostCard: centered L/R; Разбор always visible on competitors
VerticalPostCarousel: styled scrollbar; no bottom clip
razbor-btn + RazborModal cascade still work
```

## Acceptance criteria (язык Клиента)

1. На `/studio/carousel-engine` посты в столбик 9:16, не мелкая плитка 3:5.
2. У карусели ≥3 слайда; L/R по центру листают превью.
3. «Разбор» на конкуренте крупный и виден без наведения; открывает прежний Razbor.
4. Колёсико по колонке: низ карточек не обрезан; scrollbar стилизован.

## Risks

- C-65 сразу после — не начинать Create modal в этом тикете.
- Skill line «L/R только в Razbor» **superseded для feed** этим approved plan (C-64).
- Picsum vs «no stock» skill — **fixtures picsum** по тикету плана; live IG не трогать.

## Mid-flight escalation

- Нужен общий scrollbar util — OK внутри Frontend без Backend.
- Drafts L/R vs feed L/R conflict — выровнять aspect 9:16; не откатывать C-62 date under card.
