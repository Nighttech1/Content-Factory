# Trainer grade — 2026-10-17 useful-smoke-51-1-17

## План хода

- Запрос: мини-волна после correct pipeline — useful-only intake, rename Пейзажи→Персонажи, half-width Settings Brand/Персонажи, smoke 3×4 из rows 51/1/17 + MD timeline traces.
- Режим: UI (rename+width) + backend/AI Bridge (gen+traces) + усиление команды (skills/rules only на шаге 0).
- Роли по chain: Architect → Frontend → AI Bridge/Backend → Tester → Deployer → Client.
- Отвергнутое ранее: dual meetings|useful poll; «Пейзажи» как product label; full-width settings stacks; smoke без MD traces.
- `ticket_limit: default≤3` (focused mini-wave; не full queue).

## Грейд: B

Было **C** (skills всё ещё «Пейзажи» + dual meetings|useful + бюджет 6 PNG без rows 51/1/17). После апгрейда skills/rules/plugins — **B**: мелкий остаточный риск (живой sheet/env на шаге Backend), можно идти в код.

## Пробелы (до апгрейда)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Intake `meetings\|useful` dual — user wants useful-only gid 902078005 | Backend / Architect | skill | P0 |
| 2 | UI label «Пейзажи» в FE/Client/correct card | Frontend / Client | skill/rule | P0 |
| 3 | Нет half-width (~50vw) для Brand/Персонажи | Frontend | skill | P0 |
| 4 | Prompt-trace budget 6 PNG; нет smoke rows 51/1/17 ×4 + timeline MD | AI Bridge / Tester | skill | P0 |
| 5 | Нет S56 Client checklist для useful-smoke | Client | skill/rule | P1 |

## Что добавлено этим ходом

- Card `plugins/trainer/useful-smoke-51-1-17.md`
- `content-factory-ui` — **Персонажи** rename + `max-w-[50%]` Brand/Персонажи
- `carousel-json-contract` Phase 6 — useful-only + Персонажи + budget 12 PNG
- `backend` — useful-only gid + smoke rows 51/1/17
- `carousel-prompt-trace` (+ plugin) — Useful-smoke § + 12 PNG timeline
- `ai-bridge` · `content-pipeline-agents` · `create-carousel-prompts-notes` — useful/Персонажи
- `architect` — mini-wave locks + proposed chain
- `client-scenarios` **S56** + S55 rename/width; `client.mdc` §21 wording
- `frontend.mdc` §28 rename+half-width
- `carousel-correct-pipeline.md` + `gap-playbook` + `PLUGINS.md` index
- Prod code: **не трогали** (gap in skills only)

## Proposed chain

```text
Architect (spec: useful-only gid 902078005; rename Пейзажи→Персонажи; Brand/Персонажи max-w-[50%];
           smoke rows 51/1/17 ×4; MD traces → docs/карусель тест/; chain.md)
  → Frontend (rename + half-width)
  → AI Bridge / Backend (gen from useful rows + prompt-trace MD dump)
  → Tester (guards S55/S56 + 12 PNG + MD sections)
  → Deployer (localhost)
  → Client (Playwright S55+S56 + read MD timelines)
```

Motion / Mesh redesign: **out**. AppShell `shell_freeze`; Settings Brand/Персонажи **in scope**.

## Вердикт

Команда готова к волне: **да** (грейд B — идти к Архитектору).
