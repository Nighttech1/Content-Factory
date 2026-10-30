---
name: content-factory-analytics
description: >-
  Premium Analytics dashboard «Самообучающаяся диагностика» for Vernatun
  Content Factory. Use for /analytics UI, types/analytics.ts, Scout/Outliers/
  Retention/RL/Telemetry — Scout scripts by topic, anomalies N/M, sync stamp.
---

# Content Factory Analytics — Самообучающаяся диагностика

## When

Любая работа над `/analytics`, `components/analytics/*`, `types/analytics.ts` (или `lib/analytics/*` types), mock/live ingest метрик. **Не** путать с агентом **Разборщик** (Razbor чужого) — здесь **Аналитик** / продукт-дашборд. Scout UI scripts ≠ LLM «цель».

## Product goal (UX wave 4 + wave 7)

Полная переработка экрана: не KPI-ряд + таблица постов, а **premium Dark Luxury dashboard** «Самообучающаяся диагностика». Весь chrome / labels / empty states — **на русском**.

**UX-7:** чистый header без AI-eyebrow; Scout = topic + scripts; anomalies compact; dual-row filter; learning-cycles note для Архитектора.

## Types contract — `types/analytics.ts` (C-80 — создать, сейчас нет)

Frontend канон (Архитектор может зеркалить в `lib/analytics/*`). Файл **`types/analytics.ts` обязателен** в волне C-80 (сейчас отсутствует — KPI-shell без typed Self-learning).

Минимум (имена типов EN, **UI strings RU**):

| Тип / блок | Назначение | RU chrome (примеры) |
|------------|------------|---------------------|
| **Scout** (`ScoutSignal`) | Разведка ниши: рост/падение; тренды | «Разведка ниши», «Растёт», «Падает» |
| **Outliers** (`OutlierCard`) | Аномалии saves/shares/views | «Аномалии», «Почему выделяется» |
| **Retention** (`RetentionPoint`) | Кривая удержания `t → value` | «Удержание», **запрет** EN «Cross-platform…» |
| **RL feed** (`RlProposal`) | Гипотезы / правки промптов; HITL | «Лента самообучения», «Предложение» |
| **Telemetry** (`TelemetryStatus`) | Ingest / свежесть снимков | «Телеметрия», «Свежий», «Устарел» |

Все UI-facing поля: `title` / `description` / `unit` на русском. EN только в id/коде (`kind: "scout"`).

Скелет экспорта:

```ts
export type AnalyticsDashboard = {
  scout: ScoutSignal[];
  outliers: OutlierCard[];
  retention: RetentionPoint[];
  rlFeed: RlProposal[];
  telemetry: TelemetryStatus[];
  /** UX-7: last network sync wall-clock */
  syncedAt?: string; // ISO → UI hh.dd.mm.yy
  anomaliesCount?: number;
  totalContentCount?: number;
};
```

## UI layout (Frontend)

1. Header: **«Самообучающаяся диагностика»** (не `Analytics` / mono `//`).
2. Секции (порядок гибкий по спеке, но все пять присутствуют): Scout · Outliers · Retention · RL feed · Telemetry.
3. Visual: glass cards Dark Luxury; charts — 21st / recharts adapt; **не** Carbon purple enterprise slop.
4. Empty / loading: RU skeleton; без full-page opacity:0 (`content-factory-ui` nav).
5. Убрать/заменить: EN RetentionChart subtitle; сырой KPI-only shell без диагностики.

Файлы: `AnalyticsShell`, `AnalyticsHeader`, `AnalyticsMainGrid`, `KpiCardsRow` (встроить или deprecate), `RetentionChart`, новые Scout/Outliers/RL/Telemetry components, `types/analytics.ts`.

## Header / chrome — UX wave 7 (C-102)

| Правило | Деталь |
|---------|--------|
| Убрать AI eyebrow | Строки вида **«ДИАГНОСТИКА · цикл 12»** / mono cycle badge — **удалить** |
| Убрать | CTA / copy **«пересчет эвристик»** (и аналоги «пересчитать эвристики») |
| **Синхронизация** | Полное слово **«Синхронизация»** (не «Синх.») + время сети **`hh.dd.mm.yy`** (часы.день.месяц.год от last sync / network clock) |
| Source text | Шрифт **Century Gothic** (`--font-ui`), цвет **белый** |
| Title Scout | **«Разведка ниши»** — **bold** Century Gothic **20px**; **убрать** scout blurb / длинный helper под заголовком |
| Anomalies + total | Один блок: **`N / M`** где N = anomalies count, M = total content (не два разнесённых KPI) |
| Top-right filter | Motion dropdown **две строки**: (1) тип контента, (2) площадка — см. `web-motion-engine` |
| Запрет | Eyebrow cycle; «эвристик»; truncated «Синх»; Inter/mono на source; Scout subtitle prose; «цель» рядом со Scout (см. ниже) |

## Scout — scripts by topic UX wave 7 (C-103)

Scout = **скрипты разведки**, не LLM goal-setting.

| UI | Правило |
|----|---------|
| Topic input | Поле ввода темы |
| Search | **Жёлтая** кнопка поиска (brand yellow accent) |
| CTA | **«Выбрать тему»** (фиксирует topic для скриптов) |
| Убрать | Label / chip **«цель»** (script pipeline ≠ LLM objective) |
| Buttons | **«Аномалии»** / **«Стабильные»** (или аналог) — **запускают scripts по выбранной теме**, не открывают пустой LLM chat |
| Carousel | Карусель аномалий **top-15** (max 15 cards) |
| Summary | Рядом / под каруселью — **человеческое summary от Разборщика** (human-readable RU; может быть mock / от pipeline agent Razborщик, не сырой JSON) |

Параметры авто-поиска по умолчанию — **Scout inspector на «Команда выпуска»** (per Scout; **C-145**). Settings блок «Разведка» (**C-104**) — **удалён**.

## Architect note — learning cycles (для spec, C-102)

Ответ Архитектору (заложить в `chain.md` / spec, не как UI eyebrow):

**Цикл обучения (learning cycle)** в Self-learning диагностике = один проход: ingest метрик → Scout/Outliers signals → RL proposals (гипотезы промптов) → HITL approve/reject → применение в agent prompts → следующий ingest для измерения эффекта.  
UI **не** показывает «цикл 12» в eyebrow. Цикл — доменная семантика Backend/AI Bridge + RL feed, не chrome. Счётчик циклов при необходимости — только внутри Telemetry / RL detail, не как page eyebrow.

## Backend / data

- Read aggregates через существующий analytics repository; mock OK если live нет.
- Scout scripts: filter-first by topic; anomalies/stable = deterministic or pipeline scripts (`content-pipeline-agents` Разборщик summary), не «цель LLM».
- RL feed proposals → audit / HITL (`content-pipeline-agents`); Analyst **предлагает**, не перезаписывает prod prompts.
- Secrets / tokens площадок — не в analytics payloads.
- `syncedAt` → format `hh.dd.mm.yy` на клиенте (timezone local).

## Shell menu like Studio — UX Vernatun (C-127) + **module-scoped entry C-136**

`/analytics` **и** module-scoped analytics navigation = **тот же паттерн меню**, что у Студии (меню/переключатель **метрик per module** / content-type):

| Правило | Деталь |
|---------|--------|
| Menu | MultiButton / MenuVertical-паттерн как Launchpad channels → выбор модуля → метрики **этого** модуля |
| Scope | Scout / Outliers / Retention / RL / Telemetry фильтруются или переключаются **per moduleId** |
| **Entry C-136** | Primary entry = кнопка **«Аналитика»** в **top nav** `/studio/[moduleId]` (не пункт глобального сайдбара). Сайдбар = Studio / Schedule / Settings only (`content-factory-ui`) |
| Запрет | Один «глобальный» дашборд без module switcher; EN Analytics-only chrome; **Аналитика как 4-й пункт sidebar** после C-136 |

Файлы: `AnalyticsShell`, filter / MultiButton; module workspace top nav; согласовать с `content-factory-ui` § C-136.

## RL feed — предложения Тренера + HITL (C-127)

Лента самообучения (`RlFeed` / `rlFeed`):

| Правило | Деталь |
|---------|--------|
| Author | Предложения пишет / показывает **Тренер (пайплайн)**, не Scout и не «Скаут предлагает» |
| HITL | До применения к skills/rules — кнопка **«Согласовано»** (и Reject/Отклонить). **Без** «Согласовано» — **не** патчить prod skills/rules |
| Wire | После «Согласовано» → apply patch (Settings agents / md rules); audit log. Mock OK до Backend |
| Запрет | Auto-apply без HITL; Scout как author proposals; Analyst silently overwrite (старый текст skill: Analyst предлагает → **superseded**: UI author = **Тренер**, HITL обязателен) |

Тип: `RlProposal` + поле `author: "trainer"` + `status: "pending" | "approved" | "rejected"`.

## Retention — % на 15-й секунде через дробь (C-128)

| Правило | Деталь |
|---------|--------|
| Metric | На кривой / карточке Retention показать **удержание на 15-й секунде** |
| Format | **Процент через дробь**, напр. **`62% (31/50)`** или **`31/50 · 62%`** — числитель = удержавшиеся на t=15s, знаменатель = старт/views cohort; % рядом |
| UI | RU label («на 15-й секунде»); не EN-only «retention@15» без % |
| Запрет | Только голая кривая без 15s callout; % без дроби cohort; молчать про 15s |

Файлы: `RetentionChart`, `RetentionPoint` (+ optional `at15: { retained, total, pct }`).

## Acceptance (Клиент)

Сценарий **S25** + UX-7 + **S33/S34**: `/analytics` → menu like Studio (per module); RL = Trainer proposals + **«Согласовано»** до apply; Retention 15s `% (n/m)`; нет eyebrow цикл; Синхронизация + stamp; Scout topic+yellow; anomalies `N / M`.

## Do not

- Оставлять только KPI + PublishedPostsTable как «готово».
- Смешивать Razbor «Аналитик» tab с дашбордом без переименования Разборщик (`content-pipeline-agents`).
- Писать секреты в types/mock JSON в git.
- AI eyebrow «ДИАГНОСТИКА · цикл N»; «пересчет эвристик»; Scout «цель» как LLM goal.
- Anomalies и total content в двух далёких карточках вместо `N / M`.
- Один mixed filter list вместо dual-row content-type + platform.
- Scout blurb под «Разведка ниши»; title не CG 20px bold.
- Carousel >15 без лимита; summary как raw JSON.
- Analytics без per-module menu как у Студии (C-127).
- RL auto-apply / Scout как author proposals (C-127).
- Retention без %@15s через дробь (C-128).
- Analytics только как global sidebar item после **C-136** (должен быть module top-nav entry).
