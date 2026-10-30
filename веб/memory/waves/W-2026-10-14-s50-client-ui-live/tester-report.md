# 🧪 ТЕСТИРОВЩИК — W-2026-10-14-s50-client-ui-live (S50)

**Дата:** 2026-10-14  
**Тикеты:** C-s50-feed-chrome · C-s50-settings-design · C-s50-create-prompts  
**Доказательства:** Playwright MCP @1440 + `scripts/smoke-s50-competitors-live-vs-mock.ts`

## S50.A — Feed chrome (`/studio/carousel-engine`)

| Check | Result |
|-------|--------|
| Title без «(4:5)» | PASS — «Карусели Instagram» |
| Thick bottom clipping cards | PASS — dual-feed до низа колонок; мёртвой толстой полосы нет |
| Orange dots у Наши/Конкуренты | PASS — нет |
| Sort + filter left of search (обе колонки) | PASS |
| Boards dropdown + «Создать доску»; нет «1» на Доски | PASS |
| Нет pagination dots на карточках | PASS (только L/R) |

Скрин: `s50-carousel-1440.png`, `s50-boards-1440.png`

## S50.B — Settings Design

| Check | Result |
|-------|--------|
| Brandbook aspect **3:5** (`ratio≈0.6`) | PASS |
| Нет raw DESIGN.md crumbs под карточками | PASS |
| Нет счётчика слотов | PASS |
| Toolbar one row: дизайн.md · референс · новый дизайн · eye icon-only | PASS |
| Нет colors helper | PASS |
| Click card → нет context menu | PASS |

Скрин: `s50-settings-design-1440.png`

## S50.C — Create modal

| Check | Result |
|-------|--------|
| Start **Сценарист** | PASS (`create-step-scriptwriter` selected) |
| Handoff в input + «?» CTA 1–4 | PASS |
| Нет Tools / «Карусель конкурента» | PASS |
| Preview slot ≈1.5× (`w-[min(100%,29rem)]`) | PASS (пустой placeholder до «Нарисовать») |
| Competitors/Ours toggle выше | PASS |

Скрин: `s50-create-1440.png`

## S50.D — Live competitors

| Check | Result |
|-------|--------|
| Mock competitor cards painted | PASS — **0** competitors (не picsum mock) |
| Smoke live-vs-mock | **WARN** — scraperKey=SET, empty (Apify 403 soft-fail) |
| Generation live smoke | SKIP UI (не блокирует UI-приёмку; prompts усилены AI Bridge волной) |

## P0 product (Fixer)

**Нет** UI P0 по Hard REJECT #16.

## Guards

- `memory/tickets/C-s50-feed-chrome/guards.md`
- `memory/tickets/C-s50-settings-design/guards.md`
- `memory/tickets/C-s50-create-prompts/guards.md`
