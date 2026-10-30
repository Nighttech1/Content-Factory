# Architect spec — C-132 (card meta 12px)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **Feed path #1** — до C-131.

## Goal

Единый типографический токен для meta/caption на feed-карточках всех Studio-модулей.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Token** | Font: Century Gothic via `--font-ui` (или `--font-century` если уже в globals — не плодить третий стек). Color: **white** (`text-white` / token white). Size: **12px** (`text-[12px]` или `text-xs` только если =12px). |
| **D2 Surfaces** | Title snippet, @username, views / likes / comments (и аналогичные meta rows) на `FeedPostCard` / carousel cards — **все модули**, использующие `VerticalPostCarousel`. |
| **D3 Scope ban** | Не менять Razbor modal titles (→ **C-134** 16px). Не менять Schedule blue field labels (C-92). |
| **D4 Files** | Primarily `components/studio/FeedPostCard.tsx` (и shared meta subcomponents); touch `VerticalPostCarousel` only if meta styles live there. |

## In scope

- Typography classes on feed card meta across modules
- Optional shared class/utility `cf-card-meta` if it reduces drift

## Out of scope

- Carousel transition motion (C-131)
- Razbor chrome (C-134/C-135)
- Mesh / shell

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | `content-factory-ui` § Card meta C-132 |
| Motion | — | после, в C-131 |

## Acceptance (язык Клиента)

1. S36: meta на карточках = CG white 12px на Наши и Конкуренты (несколько модулей spot-check).
2. Нет серого/muted body font как primary meta; нет Inter default.

## Risks

- Truncate long titles — OK; size/color/font must hold.
- Contrast on dark glass — white 12px must remain readable.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
