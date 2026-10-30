# Architect spec — C-feed-card-chrome-s47

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-14-carousel-ui-marketing`.  
> Canon: `.cursor/skills/content-factory-ui` § FeedPostCard S47; `frontend.mdc` §18–19.  
> Shared chain: `memory/waves/W-2026-10-14-carousel-ui-marketing/chain.md`.

## Goal

Перестроить chrome dual-feed карточки: чистый media + username plaque + on-photo engagement; убрать «Онлайн»/tags/caption.

## Covers

| Item | Lock |
|------|------|
| **1.1** | Удалить badge **«Онлайн · Instagram»** / «Демо-данные» (`feed-source-badge` в workspace) и любой live-badge chrome **на карточке** |
| **1.2** | Удалить tags **«Конкуренты»** / **«Наши»** с **всех** `FeedPostCard` |
| **1.3** | **Не** показывать bottom caption / post title text под фото |
| **1.4** | Top-left: **чёрная plaque** + **белый** username, Century Gothic (`--font-ui` / `--font-century-gothic`) |
| **1.5** | Bottom-center **на фото**: icons + numbers — views · likes · comments · shares · saves; Century Gothic; Vernatun dark luxury |

## Decision locks

| Lock | Decision |
|------|----------|
| **D-feed-1** | Column chrome `VerticalPostCarousel` titles «Наши»/«Конкуренты» **остаются**; tags **на карточке** — нет |
| **D-feed-2** | `sourceMode` остаётся в API/props; UI **не** рисует Онлайн/Демо badge |
| **D-feed-3** | Metrics: читать `post.metrics.*`; optional `comments`/`shares`/`saves` — показывать когда `typeof number`; не хардкодить демо |
| **D-feed-4** | Username: `post.username` (fallback: omit plaque or «—» only if empty — prefer hide empty plaque) |
| **D-feed-5** | Razbor / «Открыть в редакторе» CTAs **сохранить** под media (slim footer) — не caption |
| **D-feed-6** | Topic hashtags под карточкой — **убрать** вместе с caption row |

## In scope

| Path | Owner |
|------|--------|
| `components/studio/workspace/FeedPostCard.tsx` | Frontend |
| `components/studio/StudioModuleWorkspace.tsx` | Frontend (remove `feed-source-badge` only) |
| `lib/studio/feed-types.ts` | Frontend optional: add `saves?: number` on metrics |
| `VerticalPostCarousel.tsx` | Frontend **only if** props/pass-through needed — prefer no change |

## Out of scope

- `RazborModal.tsx` / `CreateCarouselModal.tsx` (→ **C-razbor-create-modal-s47**)
- Marketing Director (→ **C-marketing-director-chat**)
- Backend Apify metrics remap (unless Tester finds zeros — then Backend later)
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | Luxury dark; Lucide icons OK for engagement |
| API | — | none required for chrome-only |
| Motion | — | keep C-131 crossfade; no new Motion ticket |

## Acceptance criteria (язык Клиента / S47.A)

1. @1440 Studio dual-feed: на карточке **нет** «Онлайн · Instagram», **нет** «Конкуренты»/«Наши», **нет** текста caption под фото.
2. Top-left чёрная plaque с белым username (Century Gothic).
3. На фото снизу по центру читаемые icons+цифры engagement.
4. Кнопка «Разбор» на конкурентах по-прежнему работает.

## Risks

- Grid layout (`layout=grid`) — plaque/engagement must stay readable at 2-up density.
- Empty username on some fixtures — hide plaque rather than empty black box.

## Mid-flight escalation

Контракт metrics/saves или badge placement спорный → стоп → Архитектор обновляет spec + chain.
