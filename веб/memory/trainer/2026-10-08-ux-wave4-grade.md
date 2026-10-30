# Trainer grade — 2026-10-08-ux-wave4

## План хода

- Запрос: UX-волна 4 / Mission Control после wave3 (C-73…C-75).
- Симптомы / scope: (1) Launchpad — каналы «Статьи на сайт» + «Статьи в TG»; убрать «Выберите модуль…»; одна описательная часть; (2) команда запуска — CompactMultiButton вместо workflow-кнопок; Разборщик vs Аналитик; (3) Schedule — sticky hover popup, DnD дата↔дата, публицист↔календарь, площадка + Settings CRUD ключей, picker в генерации, убрать нижний хелп; (4) Analytics — полная переработка «Самообучающаяся диагностика» (Scout/Outliers/Retention/RL/Telemetry), RU; (5) Settings — upload DESIGN.md; LLM URL+key агрегатора; модели не только 4 стока.
- Режим: UI + Motion + Backend persist + pipeline naming + analytics types; **не** app-код в этом ходе Тренера.
- Роли по chain: Тренер (шаг 0) → Архитектор (spec + chain, ≤3 C-* / проход) → Frontend → Motion → Backend → Тестировщик → Фиксер → Деплоер → Клиент.
- Skills-фокус: `content-factory-ui`, `content-factory-analytics` (новый), `client-scenarios`, `web-motion-engine`, `content-pipeline-agents`, `backend`, `architect`, `21st-ui-catalog`, `gap-playbook`.
- MCP: Playwright / chrome-devtools / 21st — без платных MCP.
- Контекст «не то» / конфликты: wave2 schedule hover без sticky bridge; LLM catalog hardcode 4 models; Razbor tab «Аналитик» конфликтует с продуктовым Аналитиком `/analytics`; wave3 leftover «C-76 publisher E2E» — не смешивать с новым C-76 Launchpad (вложить E2E в guards C-78 или P2).

## Грейд: A

До апгрейда skills: **C** — критичные пробелы: (a) нет канона каналов site/TG + ban «Выберите модуль…»; (b) CompactMultiButton для Mission Control не в UI skill (только Razbor footer); (c) нет sticky popup / date↔date / platforms CRUD; (d) нет skill analytics Self-learning / types; (e) Settings без upload + dynamic LLM; (f) Разборщик vs Аналитик не разведены.

После дописи этого хода: **A** — команда может идти к Архитектору.

### По ролям (после апгрейда)

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Frontend (`content-factory-ui` + analytics + 21st) | A | Каноны Launchpad / Mission Control / Schedule / Settings / Analytics записаны |
| Motion (`web-motion-engine`) | A | Sticky popup + date↔date DnD |
| Backend (`backend`) | A | Platforms / LLM aggregator / schedule / analytics types |
| Architect (`architect`) | A | Locks C-76…C-81 + нарезка волн 4a/4b |

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет плиток «Статьи на сайт» / «Статьи в TG»; copy «Выберите модуль…» | Frontend | skill→code | P0 |
| 2 | Workflow-кнопки вместо CompactMultiButton | Frontend | skill→code | P0 |
| 3 | Razbor «Аналитик» = путаница с `/analytics` | Frontend + pipeline | skill→code | P0 |
| 4 | Hover popup исчезает; нет date↔date DnD; нижний хелп | Frontend + Motion | skill→code | P0 |
| 5 | Публицист не sync с календарём | Frontend + Backend | skill→code | P0 |
| 6 | Нет Platforms CRUD + picker | Frontend + Backend | skill→code | P1 |
| 7 | Analytics KPI-shell ≠ Self-learning dashboard | Frontend (+ Backend types) | skill→code | P0 |
| 8 | Design без upload; LLM 4 стока; нет URL/key UI | Frontend + Backend | skill→code | P1 |
| 9 | Сценарии S23–S27 | Клиент | skill | P1 |

Роли/registry/MCP/rules: без дыр. `multi-button.tsx` уже в дереве (CompactMultiButton). Env IG к волне не обязателен. Secrets LLM/platforms — только `.env` / secure store. Data-safety: не трогать Postgres/Redis/медиа.

## Что добавлено этим ходом

- `.cursor/skills/trainer/gap-playbook.md` — 13 строк симптомов UX wave4.
- `.cursor/skills/content-factory-ui/SKILL.md` — Launchpad channels+copy; Mission Control CompactMultiButton; Settings Design upload / LLM / Platforms; Schedule sticky+date↔date+help ban; Do not.
- `.cursor/skills/content-factory-analytics/SKILL.md` — **новый** skill Self-learning dashboard + types contract.
- `.cursor/skills/client-scenarios/SKILL.md` — S23–S27.
- `.cursor/skills/web-motion-engine/SKILL.md` — sticky hover + date↔date DnD.
- `.cursor/skills/content-pipeline-agents/SKILL.md` — Разборщик vs Аналитик; publisher↔calendar; platformId.
- `.cursor/skills/backend/SKILL.md` — UX-4 data contracts.
- `.cursor/skills/architect/SKILL.md` — locks C-76…C-81 + волны 4a/4b.
- `.cursor/skills/21st-ui-catalog/SKILL.md` — search tips wave4.
- `plugins/trainer/PLUGINS.md` — указатели wave4 + analytics skill.
- Этот артефакт: `memory/trainer/2026-10-08-ux-wave4-grade.md`.

## Вердикт

Команда готова к волне: **да**

### Рекомендуемый chain (для Архитектора)

`Архитектор → Frontend (+ 21st) → Motion (schedule sticky/DnD) → Backend (platforms + LLM catalog + analytics types) → Тестировщик (S23–S27) → Фиксер → Деплоер → Клиент`

### Нарезка волн ≤3 C-* (P0 first)

| Волна | Тикеты | Фокус |
|-------|--------|--------|
| **UX-4a** | **C-76**, **C-77**, **C-78** | Launchpad каналы+copy → Mission Control MultiButton + Разборщик/Аналитик → Schedule sticky/DnD/publisher sync/убрать хелп |
| **UX-4b** | **C-79**, **C-80**, **C-81** | Platforms CRUD+picker → Analytics Self-learning → Settings DESIGN upload + LLM aggregator |

Лимит Оркестратора: один проход = одна волна (≤3). P0 сначала (4a), затем 4b.
