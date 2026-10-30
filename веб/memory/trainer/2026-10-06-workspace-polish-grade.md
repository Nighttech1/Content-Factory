# Trainer grade — 2026-10-06-workspace-polish

## План хода

- Запрос: волна **W-2026-10-06-workspace-polish**. Три тикета. Прод-код Тренер не пишет.
- Режим: UI shell + module workspace + Razbor/drafts. Без prod publish, без wipe DB/Redis/медиа.
- Роли: **Архитектор → Frontend (+ 21st, content-factory-ui) → Motion → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент**. Backend не нужен, если persist сайдбара = `localStorage cf.sidebar.width`.
- Лимит: ≤3 = **C-61 P0, C-62 P0, C-60 P1**. Path lock: **C-60 → C-61 → C-62** (как в `memory/waves/W-2026-10-06-workspace-polish.md`).
- Приёмка: client-scenarios **S12 / S13 / S14** (+ S9 обновлён). Playwright / chrome-devtools бесплатно. Платный MCP не предлагать.
- Отвергнуто / superseded: C-57 «Studio children в сайдбаре»; C-59 CTA сценариста «отправить публицисту»; C-52/C-58 «тихий opacity в шапке» как индикатор refetch.

## Тикеты волны

| ID | P | Суть |
|----|---|------|
| **C-60** | P1 | Сайдбар без dropdown модулей Студии; drag-resize aside; persist `cf.sidebar.width` |
| **C-61** | P0 | Убрать `// Рабочая страница модуля`; STOP blink: `showRefetchHint` opacity pulse на title/count; `useCallback` search; glow «Создать»; nested `overscroll-contain` |
| **C-62** | P0 | Razbor: hide scrollbar; сценарист → дизайнер; дизайнер CTA → публицист; тумблер белый / Наши disabled; drafts = same-size + L/R + дата |

## Грейд: A

До патча этого хода было бы **C**: канон C-57 (дети Студии), C-59 (сценарист→публицист) и совет «opacity в шапке как тихий loading» прямо воспроизвели бы баги тикетов. После закрытия пробелов в skills/rules команда готова. Цикл/MCP/роли целы → не D.

## Пробелы (закрыты в skills до кода)

| # | Пробел | Роль | Слой | P0/P1/P2 | Статус |
|---|--------|------|------|----------|--------|
| 1 | Dropdown модулей Студии vs C-60 | Frontend | `content-factory-ui` C-60 | P1 | закрыт |
| 2 | Resize + `cf.sidebar.width` | Frontend | `21st-ui-catalog` + UI skill | P1 | закрыт |
| 3 | `showRefetchHint` opacity = blink | Frontend + Motion | `content-factory-ui` C-61 + `web-motion-engine` + `motion.mdc` | P0 | закрыт |
| 4 | Search не `useCallback` → debounce loop | Frontend | `content-factory-ui` C-61 | P0 | закрыт |
| 5 | Glow «Создать» vs taste no-glow | Frontend | `21st-ui-catalog` + `taste-skill` исключение Cobalt/Gold | P1 | закрыт |
| 6 | Nested scroll колонок | Frontend + Motion | UI + `mobile-touch-scroll` | P1 | закрыт |
| 7 | Сценарист минуя дизайнера | AI Bridge + Frontend | `content-pipeline-agents` C-62 | P0 | закрыт |
| 8 | Claude-hide scrollbar / toggle / drafts cards | Frontend | `content-factory-ui` Razbor + drafts | P0 | закрыт |

## Что добавлено этим ходом

- Артефакт: этот файл.
- Skills/rules: `content-factory-ui`, `21st-ui-catalog`, `content-pipeline-agents`, `gap-playbook`, `frontend.mdc`, `motion.mdc`, `web-motion-engine`, `tester`, `client-scenarios` S12–S14, `client-review/regression-guards`, `ai-bridge`, `mobile-touch-scroll`, `taste-skill`, `plugins/trainer/PLUGINS.md`.
- Прод-код `app/` / `components/` **не** трогался.

## Аудит слоёв

| Слой | Вердикт |
|------|---------|
| Роли registry + trainer/architect/frontend/motion/ai-bridge/tester/client | OK |
| MCP playwright / chrome-devtools / 21st | OK, бесплатный путь |
| data-safety | OK — не wipe, не publish в обход HITL |
| Env IG | не блокер |
| Overlap | sidebar (C-60) ≠ carousel header (C-61) ≠ RazborModal/drafts (C-62). Всё равно **последовательно** |

## Рекомендуемый chain

```
Архитектор → Frontend → Motion → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент
```

Path lock:

1. **Архитектор** — spec + `chain.md`: MenuVertical flat; resize clamp; запрет opacity на chrome; `useCallback`; 21st glow-button; nested scroll; Razbor handoff C-62; drafts L/R. Не трогать prod publish.
2. **Frontend** — C-60 (`SidebarNavigation` / `menu-vertical`) → C-61 (`StudioModuleWorkspace`, `VerticalPostCarousel`) → C-62 (`RazborModal`, drafts `FeedPostCard`).
3. **Motion** — glow Create микро; **нет** pulse шапки; overscroll колонок.
4. **AI Bridge** — packs: scriptwriter output → designer step; designer CTA → publisher pane; non-carousel без шагов 3–4.
5. **Тестировщик** — guards C-60/61/62 + S12–S14; C-57 children больше не assert.

## Вердикт

Команда готова к волне: **да**
