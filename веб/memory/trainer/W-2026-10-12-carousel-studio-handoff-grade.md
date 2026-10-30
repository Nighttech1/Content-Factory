# Trainer grade — W-2026-10-12-carousel-studio-handoff

## План хода

- Запрос: окно **Создать карусель** — chrome (убрать bottom handoff/tools; Button segment сверху; «Передать задание» справа); live агенты без mock; Designer describe→draw; шаг **Публикация** вместо Публициста; markdown; сценарист без auto-handoff. Паттерн на другие модули позже.
- Режим: UI Create modal + AI Bridge handoff/agent-start + Backend draft/schedule/draw; Client S41
- Роли по chain: Архитектор → AI Bridge → Backend → Frontend → Тестировщик → Фиксер → Деплоер → Клиент (Playwright)
- Конфликт знания до хода: skills требовали Publisher+чат + MultiButton footer «передать» — **ломает** 1.1–1.8
- `ticket_limit: default≤3` — одна фича-волна упакована в **3** тикета `C-carousel-*` (вся 1.1–1.8 в одном проходе пачки); full-queue не запрошен явно
- `promts` учтён: цикл до «согласовано» через CLIENT_ORCHESTRATOR_CYCLE

## Грейд: B

До патчей skills: **C** (Publisher канон; footer handoff; нет describe→draw; нет markdown; auto-handoff OK; нет button segment / agent-start bundle).  
После патчей этого хода: **B** — команда может идти к Архитектору; lock в spec: markdown lib, draw API path, точный label «Передать на публикацию» vs copy 1.5 «публицисту» (superseded 1.7).

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| carousel-studio-handoff (new) | A | Канон 1.1–1.8 |
| content-pipeline-agents | B | Create superseded; Razbor Publisher пока жив |
| content-factory-ui | B | Create chrome rewritten |
| ai-bridge | B | Agent-start bundle + no-mock |
| backend | B | Publish without Publisher agent |
| 21st-ui-catalog | B | button variants + markdown tips |
| client-scenarios S41 | B | HARD Playwright path |
| MCP Playwright / 21st / free stack | A | без платных MCP |
| Env Polza / CAROUSEL_API_KEY | B | имена в skills; значения только `.env` |

## Пробелы

| # | Пробел | Роль | Слой | P | Статус |
|---|--------|------|------|---|--------|
| 1 | Create = Publisher + MultiButton bottom handoff | Pipeline / FE | skill | P0 | закрыт |
| 2 | Нет describe→draw Designer | AI Bridge | skill | P0 | закрыт |
| 3 | Нет agent-start rules/skills/plugins/MCP | AI Bridge / BE | skill | P0 | закрыт |
| 4 | Нет markdown chat канона | FE | skill | P1 | закрыт |
| 5 | Auto-handoff сценариста | Pipeline | skill | P0 | закрыт |
| 6 | Нет S41 / button.tsx канона | Client / FE | skill | P0 | закрыт |
| 7 | Exact image-gen wire + MD renderer choice | Architect | spec | P1 | **lock в spec** |

## Что добавлено этим ходом

- `.cursor/skills/carousel-studio-handoff/SKILL.md` — **новый**
- `.cursor/skills/content-pipeline-agents/SKILL.md` — C-carousel supersession Create
- `.cursor/skills/content-factory-ui/SKILL.md` — Create chrome rewrite
- `.cursor/skills/ai-bridge/SKILL.md` — agent-start bundle; Create без Publisher
- `.cursor/skills/backend/SKILL.md` — C-carousel row
- `.cursor/skills/21st-ui-catalog/SKILL.md` — button variants / markdown search
- `.cursor/skills/client-scenarios/SKILL.md` — **S41**
- `.cursor/skills/architect/SKILL.md` — C-carousel-* pack + chain
- `.cursor/skills/trainer/gap-playbook.md` — 9 строк симптомов
- `.cursor/rules/frontend.mdc` — пункт 17 Create carousel
- `plugins/trainer/PLUGINS.md` — carousel-studio-handoff + S41

## Proposed tickets (**C-carousel-***)

| ID | Work items | P |
|----|------------|---|
| **C-carousel-chrome** | 1.1, 1.2, 1.3 | P0 |
| **C-carousel-agents** | 1.4, 1.5, 1.8 | P0 |
| **C-carousel-publish** | 1.6, 1.7 | P0 |

Одна волна / одна пачка ≤3 — покрывает всю фичу Create; Razbor Publisher не в scope без отдельного TZ.

## Proposed chain

`Архитектор → AI Bridge → Backend → Frontend → Тестировщик → Фиксер → Деплоер → Клиент Playwright (S41)`

## Вердикт

Команда готова к волне: **да** (грейд B; сначала Архитектор spec + `chain.md`, без product-кода от Тренера)
