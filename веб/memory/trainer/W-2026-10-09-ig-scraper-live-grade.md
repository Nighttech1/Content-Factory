# Trainer grade — W-2026-10-09-ig-scraper-live

## План хода

- Запрос: live **Apify Instagram scraper** → Studio колонка **«Конкуренты»** для `carousel-engine` + `custom-reels` (~50 posts, map CAROUSEL vs REEL, replace mock, sort by popularity, real metrics).
- `ticket_limit:` **full-queue** (волна `memory/waves/W-2026-10-09-ig-scraper-live.md`).
- Режим: **backend / IG** (+ тонкий Frontend feed path).
- Роли по chain: **Тренер → Архитектор → Backend → Frontend → Тестировщик → Фиксер → Деплоер → Клиент**.
- Env (имена only): `IG_SCRAPER_API_KEY`, optional `IG_SCRAPER_BASE_URL`. Секреты не в skills/memory.
- MCP: Playwright / chrome-devtools для приёмки badge + metrics; платный MCP не предлагать.
- Тренер **не** пишет app/API код.

## Грейд: C → B+

**До усиления:** **C** — Backend skill без Apify/competitors-scrape контракта; `content-pipeline-agents` запрещал всё кроме Graph («unofficial APIs forbidden») → команда не имела канона под scraper wave.

**После апгрейда skills (этот ход):** **B+** — знания закрыты; код ещё не сделан. До **A** после зелёных guards на live feed.

### По ролям

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Backend (`backend`) | B+ | § Live Instagram scraper: env, map, split, sort, soft-fail |
| Pipeline (`content-pipeline-agents`) | B+ | discovery path B = Apify; env names |
| Frontend (`content-factory-ui`) | B+ | live competitors chrome; no browser Apify |
| Architect | B | **P0:** переименовать тикеты волны — C-107…C-110 уже заняты UX-8 (mesh/schedule) → использовать **C-114+** (или slug `C-IG-*`) в spec/chain |
| Tester / Client | B | сценарий: badge live + metrics + module split; допишет Тестировщик |
| Motion / AI Bridge | n/a | не в scope волны |
| MCP / registry | A | без дыр; ключи только `.env` |

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | ~~Нет Apify/scraper контракта в Backend skill~~ → закрыто | Backend | skill | P0 |
| 2 | ~~Pipeline «Graph only» блокировал scraper~~ → закрыто | AI Bridge / packs | skill | P0 |
| 3 | ~~FE без live metrics / no-browser-Apify~~ → закрыто | Frontend | skill | P1 |
| 4 | Коллизия id C-107…C-110 с UX-8 | Архитектор | wave/tickets | P0 |
| 5 | Product: client+map+wire ещё не в коде | Backend → FE | code | P0 (волна) |

## Что добавлено этим ходом

- `backend` — § Live Instagram scraper (Apify): env names, ~50 hashtag, FeedPost map, CAROUSEL vs REEL by module, popularity sort, soft-fail mock, no secret logging.
- `content-pipeline-agents` — Allowed source path B + env `IG_SCRAPER_*`.
- `content-factory-ui` — § Live competitors для `carousel-engine` + `custom-reels`.
- `gap-playbook` — 3 строки симптомов scraper/mock/split/metrics.
- `plugins/trainer/PLUGINS.md` — pointer на Apify competitors.
- Этот артефакт.

## Recommended chain

1. **Архитектор** — spec + `chain.md`; **перенумеровать** тикеты волны на C-114…C-117 (или эквивалент); path lock Backend feed files → Frontend workspace badge/metrics only.
2. **Backend** — Apify client → map/split/sort → wire `carousel-engine` + `custom-reels` competitors; soft-fail mock.
3. **Frontend** — consume live `FeedPost.metrics` + `sourceMode` (no new provider UI); dual-feed без mock merge when live.
4. **Тестировщик** — guards: live when key present / mock when absent; carousel≠reels mix; metrics > 0 on sample; no key in logs.
5. **Фиксер** → **Деплоер** localhost → **Клиент**.

Не параллелить Backend feed route и Frontend workspace на overlapping paths без chain.

## Вердикт

Команда готова к волне: **да** (после Architect ticket renumber в spec).

`ticket_limit: full-queue`

---

## RETRY — 2026-10-09 (post C-114…C-117 / Apify 401)

**Контекст:** pipeline C-114…C-117 уже в коде. Блок был **Apify 401** (старый ключ). Новый `IG_SCRAPER_API_KEY` лежит в `.env` на диске (длина ~46; значение не логировать). Цель retry: re-auth → scrape ~50 → fill competitors.

**Грейд retry:** **B+** (без смены). Знания и контракты skills закрыты; код волны сдан. До **A** — только после зелёного live feed (auth + metrics + split). Архитектор/Frontend не нужны, пока probe снова не упрётся в auth/contract.

**Пробел знаний:** нет (ops/env). Платный MCP не предлагать. Секреты не в memory.

### Retry chain (узкий)

1. **Backend** — probe Apify с ключом из env (без печати секрета); confirm 200 + ~50 posts map/split.
2. **Деплоер** — restart localhost API после смены env.
3. **Тестировщик** — live feeds guards (badge/metrics/split) → **Клиент**.

Если probe снова 401/contract fail → стоп, назад к Архитектору (и при необходимости Frontend chrome). Иначе Architect/Frontend skip.

---

## RETRY2 — 2026-10-09 (Client acceptance REJECTED — no Playwright)

**Контекст:** пользователь отклонил приёмку Клиента. Клиент **не** использовал Playwright MCP на живом UI. Скрин пользователя: `carousel-engine` — tiny 2-up cards, метрики нечитаемы, выглядит как mock. Приёмка «по API / словам» недопустима.

**Грейд пути Client:** **D → C** после усиления rules/skills (этот ход). Пока Клиент снова не прогонит Playwright @1440 + сценарий — путь Client **не выше C**; волна не «согласовано».

| Роль / skill | Грейд RETRY2 | Комментарий |
|--------------|--------------|-------------|
| Client path (`client.mdc` + `client-review` + `client-scenarios`) | **C** (было fail = D) | HARD GATE Playwright вписан; до A — только после live Playwright re-accept |
| Frontend (`content-factory-ui`) | B | UI: restore stack sizes + readable metrics (C-118); **без** нового Apify scrape |
| Backend / Apify | n/a skip | **No new Apify scrape** в этой retry-волне |
| Architect / Tester | B | chain ниже; Tester guards на видимые метрики |

**Пробел (закрыт правилами):** Клиент мог вынести вердикт без Playwright → закрыто HARD GATE в `client.mdc` + `client-review` + note live competitors в `client-scenarios`.

### Recommended tickets

| Id | Scope |
|----|--------|
| **C-118** | Restore stack sizes + metrics visible on Конкуренты/Наши cards (`carousel-engine`) |
| **C-119** | Client Playwright re-acceptance only (navigate+snapshot/screenshot @1440; badge Онлайн OR live usernames/metrics) |

### Retry2 chain (узкий)

1. **Архитектор** — spec + `chain.md` для C-118 / C-119; path lock FE feed cards only.
2. **Frontend** — stack sizes + readable metrics (no new scraper/provider).
3. **Тестировщик** — guards: metrics/badge visible on localhost.
4. **Клиент** — **только Playwright MCP** @1440 + S* live competitors; без Playwright вердикт недействителен.

**No new Apify scrape.** `ticket_limit: default≤3` (два тикета).

**Команда готова к retry2:** **да** (после Architect).

---

## APPEND — 2026-10-09 C-120 (user: restore 2-up density)

User explicitly wants feed cards ~2× smaller → **2 cards per row** in **all** Studio feed sections (Наши + Конкуренты; `carousel-engine`, `custom-reels`, other `VerticalPostCarousel` modules). **C-118** single-column stack density is **superseded** for layout density only (metrics/live badge still required). Client acceptance remains **Playwright-mandatory**. See `memory/trainer/2026-10-09-c120-feed-2up-grade.md`.
