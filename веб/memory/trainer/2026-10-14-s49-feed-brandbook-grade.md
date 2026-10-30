# Trainer grade — 2026-10-14 — s49-feed-brandbook (S49)

## План хода

- Запрос: волна UI + mesh wire — Competitors plaque `name | followers` inside; Ours без plaque; Published/Drafts simple toggle + search same row; minimal feed bottom gap; Boards «Загрузить» + no helper + no board metrics; white Published/Drafts/count; **DELETE** Team User basic brief (never → agents); Settings Design = visual brandbook cards + upload→deconstruct for Designer.
- Режим: UI + AI Bridge + Backend map (+ mesh brief delete). **НЕ prod.**
- `ticket_limit: default≤3` — пользователь: «≤3 or full if needed»; 7 пунктов упакованы в **3** тикета (full-queue не запрошен явно).
- Роли по chain: Архитектор → Frontend → AI Bridge → Backend → Тестировщик → Фиксер → Деплоер → Клиент.

## Грейд: C → **A** (после апгрейда skills этим ходом)

До шага 0: **C** — канон S48 оставлял followers **снаружи** plaque; Ours с plaque; MultiButton/chrome Boards helper; User brief = empty field (не delete); Design = colors/Embla без Heritage-style brandbook cards.  
После дописки skills/rules: **A** — команда готова к Архитектору / ≤3 tickets.

## Пробелы (закрыты в skills; код — волна)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Followers не inside plaque после `\|` | Frontend (+ BE map) | skill/ui | P0 |
| 2 | Ours всё ещё с name/followers plaque | Frontend | skill/ui | P0 |
| 3 | Top = MultiButton / search не в ряду; labels не white; большой bottom gap | Frontend | skill/ui | P0 |
| 4 | Boards helper + metrics + не «Загрузить» | Frontend | skill/ui | P0 |
| 5 | User basic brief field жив / может уйти агентам | Mesh + AI Bridge + Backend | skill/mesh/ai | P0 |
| 6 | Design без visual brandbook cards / deconstruct не в brandbook form | FE + AI Bridge + Designer worker | skill/ui/ai | P0 |
| 7 | Нет Client S49 HARD | Client | skill/scenarios | P0 |

MCP: Playwright + chrome-devtools — OK. Платный MCP не предлагать. Prod — запрещён.

## Who strengthened (обязательный отчёт)

### Engineering team (Cursor / Vernatun roles)

| Роль | Что усилено |
|------|-------------|
| **Frontend** | `content-factory-ui` S49 feed/Boards/Design; `frontend.mdc` §19–22 |
| **Architect** | `architect` § S49 ticket pack + chain |
| **Backend** | `backend` S49 no brief inject + followers map |
| **AI Bridge** | `ai-bridge` brandbook deconstruct + never User brief |
| **Tester** | `tester` S49 guards checklist |
| **Client** | `client-scenarios` **S49 HARD**; `client.mdc` Hard REJECT **#15** (+ #8 brief delete) |
| **Motion** | не обязателен (toggle/clip без новой motion-системы); при jank — `web-motion-engine` по chain |
| **Trainer** | `gap-playbook` S49 rows; `plugins/trainer/s49-feed-brandbook.md` + PLUGINS |

### Release-team (mesh / pipeline agents)

| Агент выпуска | Что усилено |
|---------------|-------------|
| **Scout / Разведчик** | task = Scout settings only — **не** User brief (`content-pipeline-agents` + `xyflow-agent-mesh` S49 notes) |
| **Разборщик** | task = media URLs + razbor-live — **не** User brief |
| **Сценарист** | task = handoff / raw chat / CTA — **не** User brief |
| **Дизайнер** | task = dramaturgy + **active brandbook / DESIGN.md tokens** (S49 visual brandbook); worker `designer-carousel` note |
| **Публикация / Публицист** | task = schedule + platform — **не** User brief |
| **Тренер (пайплайн)** | task = Analyst conclusions → patches — **не** User brief |

## Что добавлено этим ходом

- `content-factory-ui` — S49 FeedPostCard / dual-feed chrome / Boards / Design brandbook visual; Anti-patterns.
- `xyflow-agent-mesh` — **S49 DELETE** User basic brief + release-team agent notes.
- `content-pipeline-agents` — S49 DELETE brief + task-source table for mesh agents.
- `ai-bridge` — brandbook deconstruct + no brief glue.
- `client-scenarios` — **S49 HARD** A–D + Hard REJECT.
- `client.mdc` — Hard REJECT **#15**; #8 brief delete.
- `frontend.mdc` — §19–22 S49.
- `architect` — S49 ≤3 ticket pack + proposed chain.
- `backend` / `tester` / `workers/designer-carousel` — S49 lines.
- `gap-playbook` + `plugins/trainer/PLUGINS.md` + `plugins/trainer/s49-feed-brandbook.md`.

## Recommended tickets (`ticket_limit: default≤3`)

| ID (proposed) | Title | Priority |
|---------------|-------|----------|
| **C-feed-s49-chrome** | Competitors plaque `{name} \| {followers}` inside; Ours no plaque; Published/Drafts simple toggle + search same row; labels/count white; minimal feed bottom gap | P0 |
| **C-boards-s49-upload** | Boards «Загрузить» same row as search; remove «Локально · несколько кадров…»; no metrics on board cards | P0 |
| **C-team-brief-gone-design-brandbook** | DELETE User basic brief (never → agents); Settings Design visual brandbook cards + upload reel/image → deconstruct to brandbook for Designer | P0 |

## Proposed chain (≤3, no full-queue)

```
Тренер ✅ (этот файл)
→ Архитектор (spec + chain.md locks: plaque string, Ours flag, toggle chrome, Boards copy, brief delete wire, brandbook schema)
→ Frontend (feed/Boards/Design UI)
→ AI Bridge (deconstruct→brandbook; strip brief from agent-start/generate)
→ Backend (followers field; ignore legacy brief persist)
→ Тестировщик (guards S49.A–D)
→ Фиксер
→ Деплоер (localhost only — НЕ prod)
→ Клиент (Playwright @1440 S49 HARD)
```

Не параллелить overlapping: Team brief delete (mesh + proxy) до Client S49.C; Design brandbook после Architect schema lock.

## Вердикт

Команда готова к волне: **да**  
Лимит тикетов: **default≤3**  
Prod: **нет**
