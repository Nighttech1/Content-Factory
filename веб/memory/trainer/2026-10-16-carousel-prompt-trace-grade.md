# Trainer grade — 2026-10-16 — carousel-prompt-trace

## План хода

- Запрос: диагностировать слабое звено **Scriptwriter → Designer → Image**; MD session logs в `docs/карусель тест/`; усилить skills под dump/trace; при необходимости поправить Scriptwriter prompts (viral craft → JSON); budget **2×3 = 6 PNG**.
- Режим: prompts / skills / optional dump helper — **не** UI shell.
- Роли по chain: Архитектор → **AI Bridge** (primary) → Backend (только dump/routing wire) → Тестировщик → Фиксер → Деплоер → Клиент. Frontend **omit**.
- Отвергнутое: pipeline rewrite; UI redesign Create; Apify/feed work; soft-mock без JSON; secrets в MD.

## Грейд: B

Было **C** (критичный пробел знания): не было skill/protocol dump full system+user+reply+per-slide image prompts; не было папки/шаблонов `docs/карусель тест/`; agents не знали VIRAL CRAFT как отдельный inject сверх schema.  
После закрытия пробелов в skills/templates — **B**: команда готова к Архитектору; AI Bridge ещё **внедрит** VIRAL CRAFT в `create-carousel-prompts.ts` и заполнит живые MD на smoke.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 | Status |
|---|--------|------|------|----------|--------|
| 1 | Нет протокола prompt-trace / MD dump | AI Bridge / Tester | skill | P0 | **closed** — `carousel-prompt-trace` |
| 2 | Нет `docs/карусель тест/` + templates | AI Bridge | docs | P0 | **closed** — README + `_templates/` |
| 3 | Flat viral JSON при schema-OK | AI Bridge | prompts notes | P0 | **closed in notes**; code inject = chain |
| 4 | Нет EXACT image prompt per slide в артефактах | AI Bridge / Backend | skill | P0 | **closed** in skill; live dump = chain |
| 5 | Optional `CAROUSEL_PROMPT_TRACE` helper | Architect + Backend | spec/code | P1 | **open** — lock in chain.md |
| 6 | Frontend в chain «заодно» | Orchestrator | rule | P0 | **locked** shell_freeze / omit FE |

## Что добавлено этим ходом

- `.cursor/skills/carousel-prompt-trace/SKILL.md` — dump protocol Step1/Step2, budget 6, locks
- `docs/карусель тест/README.md` + `_templates/01-scriptwriter-session.md` + `02-designer-session.md`
- `create-carousel-prompts-notes.md` — § Viral craft + § Prompt-trace dump
- `prompt-engineering` · `ai-bridge` · `carousel-json-contract` · `content-pipeline-agents` — ссылки на trace
- `gap-playbook.md` — 4 симптома
- `plugins/trainer/carousel-prompt-trace.md` + `PLUGINS.md` + `sprint9-carousel-reels.md` blurb
- `.cursor/registry/agents.md` — skill + AI Bridge skills list

## Locks

| Lock | Value |
|------|-------|
| ticket_limit | default≤3 (один diagnostic epic) |
| upgrade_only | true |
| no_pipeline_break | true — **Scriptwriter → Designer → Draft** |
| shell_freeze | true |
| validation_budget_png | **6** (2 carousels × 3 slides) |
| no social publish | true |
| secrets_in_md | forbidden |

## Proposed chain hint

```
Trainer (done) → Architect (spec: VIRAL CRAFT inject points; CAROUSEL_PROMPT_TRACE optional;
                 docs/карусель тест fill on smoke; budget 6; shell_freeze; no_pipeline_break)
  → AI Bridge (primary: patch create-carousel-prompts.ts VIRAL CRAFT; run 2 topics;
               write NN-scriptwriter/designer MD with FULL prompts; exact image prompts)
  → Backend (only if env dump helper / log wire locked — else skip)
  → Tester (guards: MD sections complete; JSON viral checklist; ≤6 PNG; Create shape intact)
  → Fixer → Deployer (localhost) → Client (read MD traces + Playwright Create @1440)
```

Frontend: **omit**.

## Вердикт

Команда готова к волне: **да** (грейд **B** — идти к Архитектору сразу).
