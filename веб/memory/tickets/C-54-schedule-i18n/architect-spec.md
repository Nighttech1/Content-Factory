# Architect spec — C-54

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Экран `/schedule`: календарь с 21st.dev + справа очередь готовых постов по модулям. Весь пользовательский chrome приложения — **русский** (C-46 EN Launchpad **superseded**).

## Depends

- C-52 / C-53 Done (меньше overlap; mesh header после пайплайнов).
- Skills: `21st-ui-catalog` (calendar/agenda), `content-factory-ui` § `/schedule` + RU glossary, `frontend.mdc`.
- **Порядок волны:** C-52 → C-53 → **C-54**.
- Persist слотов: **только клиент** `localStorage` ключ `cf.schedule.v1`. **Backend не требуется.**

## In scope

### 1. Расписание `/schedule` (21st-first)

Заменить английский placeholder `app/schedule/page.tsx`.

Макет:

- **Основная зона:** календарь / таймлайн слотов — MCP `21st` `search` → pick animated dark glass → `get_component` → ретокены Dark Luxury. Без 21st (401/timeout) — fallback `luxury-web-craft` + отчёт `21st=unavailable`.
- **Справа:** вертикальный список модулей **как первая секция Студии** (`mergeStudioModules`: 4 CORE + 3 product). Под каждым — посты **готовые к выкладке**.
- Если слот назначен — подпись **под** постом: дата + время (локаль RU).

Готовые посты: **mock OK** — фикстуры `ours` из `getFeedForModule` / статичный fixture-модуль `lib/schedule/` + hydration. Не ходить в Prisma. Не публиковать в соцсети (HITL не обходить — слот ≠ publish).

Назначение слота: клик поста + выбор datetime в календаре (или drop на день) → запись в store.

`data-testid`: `schedule-page`, `schedule-calendar`, `schedule-module-rail`, `schedule-ready-post`, `schedule-slot-label`.

### 2. Persist `cf.schedule.v1`

Клиентский util (рядом с settings storage), без API:

```ts
type ScheduleSlotV1 = {
  postId: string;
  moduleId: string;
  startsAt: string; // ISO-8601
};

type ScheduleFileV1 = {
  version: 1;
  slots: ScheduleSlotV1[];
};
```

Ключ: **`cf.schedule.v1`**. Порча JSON → безопасный default `{ version: 1, slots: [] }`. Секретов нет.

### 3. RU chrome inventory

Код/id маршрутов остаются EN (`/admin/mesh`, `carousel-engine`). Пользовательские строки — RU.

| Где | Было | Нужно |
|-----|------|--------|
| `SidebarNavigation` NAV_ITEMS + parent | Canvas (Node Mesh), Schedule, Analytics, Brand Kit, `Studio` | Холст, Расписание, Аналитика, Бренд-кит, **Студия** |
| `app/studio/page.tsx` | Studio Launchpad | Студия |
| `ModuleSelectorGrid` | Target Render Channels | Каналы рендера |
| `app/settings/page.tsx` | `// Settings`, лейбл Model / Page size | Настройки / Модель / На странице |
| `LLM_AGENTS[].label` | Researcher, Hook Writer, … | русские роли (Исследователь, Автор хуков, …) |
| `app/admin/mesh/page.tsx` | Owner only · Agent Mesh / sr-only Agent Mesh Canvas; Redirecting to Studio | RU |
| `CanvasTopBar` | Active Jobs, Avg Latency, GPU Cluster, Active/Idle, `[+ Add Pipeline Module]` | Активные задачи, Задержка, GPU, Активен/Простой, «Добавить модуль пайплайна» |
| `AnalyticsHeader` | Self-Learning Diagnostics + EN subtitle / ENGINE TELEMETRY | русские заголовок и пояснение |
| Workspace | `// MODULE WORKSPACE`; FeedPostCard Ours/Competitor если ещё EN | Рабочая страница модуля; Наши / Конкуренты |
| `app/schedule/page.tsx` | Schedule / Publishing calendar placeholder | Расписание + RU empty states |

Не переводить: имена моделей (`GPT-4o`), id модулей, `code`/env (`AGGREGATOR_API_KEY`), URLs.

C-46 «оставить Studio Launchpad EN» — **не** регрессировать.

## Out of scope

- Backend calendar API, Prisma slots, Redis
- Реальный publish / HITL сетей
- C-48 описания custom-плиток
- Новые mesh графы (уже C-53)
- Смена RBAC

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Schedule UI 21st + rail + storage | **Frontend** | `21st-ui-catalog` first |
| Calendar/slot micro-motion | **Motion** | enter календаря, подпись слота; reduced-motion |
| API | — | **Backend не звать** |
| AI Bridge | — | нет |

## Contracts

### Storage

| Key | `cf.schedule.v1` |
|-----|------------------|
| Scope | browser localStorage |
| Write | при назначении/снятии слота |
| Read | hydrate on `/schedule` mount |

### Ready posts

Источник mock: published `ours` по `moduleId` (fixtures). Пост в слоте остаётся в правом списке, под ним datetime.

### 21st

`decisions.md` тикета: `21st id=… · element=calendar · motion=yes`. Не `search_picker`.

## Acceptance criteria (язык Клиента)

1. `/schedule` — красивый календарь, не английский placeholder; справа модули и готовые посты; при слоте — дата/время под постом (S6).
2. После reload слоты на месте (`cf.schedule.v1`).
3. Сайдбар и заголовки: Студия / Холст / Расписание / Аналитика / Бренд-кит / Настройки — без Canvas/Schedule/Launchpad как nav-copy.
4. На Студии нет «Studio Launchpad» / «Target Render Channels»; settings leftover EN убран; шапка mesh по-русски.
5. Никакого publish в соцсети с этого экрана.

## Risks

- 21st MCP недоступен — fallback, не стоп волны.
- Overlap mesh page/TopBar с C-53 — C-54 **только строки**, не ломать pipeline switcher.
- Analytics длинный EN marketing copy — перевести смысл, не тащить Yerevan telemetry-slop дословно.
- Smoke, которые ждут английские строки nav — Tester обновляет.

## Mid-flight escalation

- Persist на сервер / multi-device — новый Backend-тикет; **не** в этой волне.
- 21st generate/credits — не включать; только catalog `search`+`get_component`.
