# Trainer grade — 2026-10-13 — scriptwriter swipe + CTA

## План хода

- Запрос: усилить Сценариста каруселей — (1.1) per-slide «зачем листать дальше» как **meta** engagement QA (clarify/`swipe_trigger` meaning, не on-slide); (1.2) CTA catalog **1–4 HARD** в prompts + apply по номеру из чата на `cta_slide`; (1.3) Frontend «?» top-right в Create Scriptwriter chat со шпаргалкой.
- Режим: усиление команды (skills/rules) → затем волна кода
- Роли по chain: Архитектор → AI Bridge → Frontend → (Backend zod если в chain) → Тестировщик → Фиксер → Деплоер → Клиент **S46**
- `ticket_limit: default≤3`
- Proposed tickets (P1): `C-scriptwriter-swipe-cta` (prompts+zod+meta) · `C-scriptwriter-cta-hint-ui` («?» panel) · optional smoke/guards в том же wave pack

## Грейд: A

До апгрейда: **C** (пробел знания — `swipe_trigger` путался с on-slide; CTA catalog отсутствовал; нет S46/UI hint канона).  
После апгрейда skills/rules: **A** — команда готова к Архитектору и коду.

## Аудит (до → после)

| Слой | Было | Стало |
|------|------|-------|
| workers/script-writer | `swipe_trigger` = «why swipe» без meta/CTA | Meta HARD + CTA catalog 1–4 + S46 FAIL |
| carousel-json-contract | swipe = cause to swipe; CTA vague | § swipe meaning + CTA catalog + checklist + ticket id |
| create-carousel prompts notes | не было | `create-carousel-prompts-notes.md` для AI Bridge inject |
| content-factory-ui | нет «?» | § Scriptwriter CTA cheat sheet + testids |
| client-scenarios | S45 max | **S46 HARD** A/B/C |
| client.mdc | Hard REJECT …11 | + **12 S46** |
| content-pipeline-agents | swipe as generic | meta + CTA + prompts notes pointer |
| plugins/trainer | S45 | S46 + prompts-notes ref |
| MCP | Playwright OK | без платных MCP |

## Пробелы (закрыты этим ходом)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | `swipe_trigger` ≠ on-slide (rename meaning) | AI Bridge / Scriptwriter | skill | P1 |
| 2 | CTA catalog 1–4 HARD + user number | AI Bridge | skill + prompts notes | P1 |
| 3 | Create «?» cheat sheet | Frontend | skill content-factory-ui | P1 |
| 4 | Client gate S46 | Клиент | scenarios + client.mdc | P1 |

Оставшееся для волны кода (не skills): zod/`create-carousel-prompts.ts` inject, UI button, guards — **Архитектор lock**.

## Что добавлено этим ходом

- `workers/script-writer/SKILL.md` + `PLUGINS.md`
- `.cursor/skills/carousel-json-contract/SKILL.md`
- `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` **(new)**
- `.cursor/skills/content-factory-ui/SKILL.md` (§ «?» hint)
- `.cursor/skills/client-scenarios/SKILL.md` (**S46**)
- `.cursor/rules/client.mdc` (Hard REJECT §12)
- `.cursor/skills/content-pipeline-agents/SKILL.md`
- `plugins/trainer/PLUGINS.md`

**Не** писали prod-код (`app/`, `lib/`, `components/`).

## Proposed chain

```text
Архитектор (spec + chain.md: zod cta_type, swipe meta assert, Create «?» UX)
  → AI Bridge (create-carousel-prompts.ts + mesh Scriptwriter overlay per create-carousel-prompts-notes)
  → Frontend (Create Scriptwriter «?» top-right + panel CTA 1–4; testids)
  → Backend (только если Architect locks zod/API parse path overlapping)
  → Тестировщик (guards S46 + smoke)
  → Фиксер
  → Деплоер localhost
  → Клиент S46 Playwright @1440
```

Не параллелить: prompts overlay ↔ Create Scriptwriter chrome (оба трогают Create path).

## Вердикт

Команда готова к волне: **да**
