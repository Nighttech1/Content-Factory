# Trainer grade — 2026-10-08-ux-wave4b-full

## План хода

- Запрос: пользователь **явно** снял лимит «макс. 3 C-*» и просит добить **весь бэклог UX-4** — остаток **C-79 → C-80 → C-81** одним проходом.
- `ticket_limit:` **full-queue** (не default≤3).
- Scope 4b: (1) Platforms CRUD + picker; (2) Analytics Self-learning RU + `types/analytics.ts`; (3) Settings DESIGN.md upload + LLM URL/key + динамический catalog.
- Режим: UI + Backend persist + analytics types; Тренер код не пишет.
- Контекст: UX-4a (C-76…C-78) уже smoke green (`W-2026-10-08-ux-wave4a`).
- Роли: Тренер → Архитектор → Frontend (+21st) → Backend → Тестировщик (S25/S27 + platforms) → Фиксер → Деплоер → Клиент.
- MCP: Playwright / chrome-devtools / 21st — без платных MCP.
- Secrets: LLM key / platform tokens только `.env` / secure store — не в tickets/git.

## Грейд: A

До усиления 4b-контрактов в этом ходе: **B** — канон wave4 уже был, но дыры реализации: нет `types/analytics.ts`; `LlmModelId` = union из 4; нет Platforms UI/API; лимит 3 ещё был жёстким в rules.

После апгрейда канона + skills: **A** — команда готова к full-queue chain.

### По ролям

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Orchestrator / cycle rules | A | Лимит 3 → soft + full-queue exception |
| Frontend (`content-factory-ui`) | A | Platforms CRUD+picker; LLM dynamic; DESIGN upload |
| Analytics (`content-factory-analytics`) | A | RU dashboard + обязательный `types/analytics.ts` скелет |
| Backend | A | Platforms CRUD mask; models proxy; DESIGN body |
| Architect | A | Path lock sequential C-79→C-80→C-81, no parallel Settings/Analytics |
| Client scenarios | A | S25 / S27 (+ platforms в S27) |

## Пробелы (код — закрывает волна, не Тренер)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет Settings Platforms CRUD + picker / `platformId` | FE + BE | code | P0 |
| 2 | Нет `types/analytics.ts`; UI = KPI-shell, не Self-learning RU | FE (+ BE types) | code | P0 |
| 3 | `llm-models.ts` — жёсткий union 4 моделей; нет URL/key UI | FE + BE | code | P0 |
| 4 | DESIGN.md — нет кнопки file upload (только override/textarea) | FE | code | P1 |
| 5 | Guards S25/S27 + platforms mask на snapshot | Tester | guards | P1 |

Роли/registry/MCP: без дыр. Data-safety: не трогать Postgres/Redis/медиа.

## Что добавлено этим ходом

- `.cursor/rules/orchestrator.mdc` — лимит soft + full-queue.
- `docs/CLIENT_ORCHESTRATOR_CYCLE.md` — то же.
- `.cursor/skills/trainer/SKILL.md` — § лимит / `ticket_limit`.
- `.cursor/skills/trainer/gap-playbook.md` — симптомы «остановился на 3» / «разрезали 4b».
- Согласованность: `client.mdc`, `TEAM_ARCHITECTURE.md`, `ARCHITECTURE.md`, prompt cycle, `architect` SKILL, knowledge shared, `TEAM_TICKETS_README`.
- Skills усиление 4b: `content-factory-ui` (platforms+LLM), `backend` (C-79…C-81), `content-factory-analytics` (types skeleton + RU).
- Этот артефакт.

## Вердикт

Команда готова к волне: **да**  
`ticket_limit: full-queue`

### Proposed chain (одним проходом, без нарезки)

`Архитектор (spec+chain C-79→C-80→C-81) → Frontend (+ 21st-ui-catalog) → Backend (platforms + LLM models proxy + analytics types mirror) → Тестировщик (S25, S27, platforms mask) → Фиксер → Деплоер localhost → Клиент`

Path lock (последовательно, не parallel):

1. **C-79** — Platforms CRUD + picker / `platformId`
2. **C-80** — Analytics Self-learning RU + `types/analytics.ts`
3. **C-81** — DESIGN upload + LLM aggregator dynamic catalog

Не резать на отдельные волны 4b-1 / 4b-2. После guards всей тройки — приёмка Клиента.
