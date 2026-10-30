# Trainer grade — 2026-10-18-pipeline-practice-higven-3

## План хода

- Запрос: тренировка пайплайна по канону `memory/waves/2026-10-18-pipeline-practice-higven-3/plan.md` — эталон **01 HIGVEN**, Designer parallel pack, HITL handoff, N=3, full Vernatun PNG, `characterPaint=none`, AD no remake, ≤3 attempts.
- Режим: backend + AI Bridge pipeline / Settings Design seed / smoke (не UI-chrome redesign).
- Роли по chain: **Architect → AI Bridge → Backend (seed+smoke) → Tester → Fixer if needed (≤3) → Deployer → Client**.
- `ticket_limit:` **full-queue** (plan lock).
- Отклонения Клиента: нет открытых C-* этой волны; предыдущие волны (Phase2 / vision-style / dual-char) имели **другие** defaults (N=6, `in_image`, emblem/wordmark paths) — их нельзя тащить сюда без override.

## Грейд: B → A (после закрытия пробелов этим ходом)

До апгрейда: **B/C** — не было единой карточки HIGVEN-3; product defaults (`characterPaint=in_image`, N=4/6, logoTextColor MUST, Sonnet SW в части skills) конфликтовали с plan locks.

После дописи skills/plugins: **A** — команда знает locks и proposed chain.

## Пробелы (закрыты)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет wave-card: parallel `image_prompt`+`html_layout` ONE reply | AI Bridge / Architect | skill/plugin | P0 |
| 2 | Product default `characterPaint=in_image` vs wave `none` | AI Bridge / Backend | skill | P0 |
| 3 | Smoke bars 4/6/7 vs strict N=3 cover/body/cta | Tester / Backend | skill | P0 |
| 4 | Phase2 logoTextColor / path A emblem+HTML vs full PNG only | AI Bridge / Backend | skill | P0 |
| 5 | Settings seed: clear other etalons, activate 01, 02 inactive OK | Backend | plugin + plan | P0 |
| 6 | HITL «Передать дизайнеру» vs auto-handoff | Pipeline / FE if UI | skill | P1 |
| 7 | Attempt STOP ≤3 не в gap-playbook | Orchestrator / Fixer | gap-playbook | P1 |
| 8 | AD budget still «6-slide» wording | Art Director | skill | P2 |

## Что добавлено этим ходом

- `plugins/trainer/pipeline-practice-higven-3.md` — HARD locks + chain + budget
- `plugins/trainer/PLUGINS.md` — строка карточки
- `.cursor/skills/art-director/html-layout-variant-a.md` — § HIGVEN-3 override
- `.cursor/skills/ai-bridge/SKILL.md` — bullet HIGVEN-3
- `.cursor/skills/architect/SKILL.md` — wave section + proposed chain
- `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` — § HIGVEN-3 PARALLEL PACK + logo override
- `.cursor/skills/content-pipeline-agents/SKILL.md` — HIGVEN-3 row + HITL button
- `.cursor/skills/tester/SKILL.md` — HIGVEN-3 guards G1–G7
- `.cursor/skills/art-director/SKILL.md` — 3-slide budget for this wave
- `.cursor/skills/trainer/gap-playbook.md` — 5 строк симптомов
- `memory/waves/2026-10-18-pipeline-practice-higven-3/brief.md` — brief для Оркестратора

## MCP / env

- Playwright / chrome-devtools — из `.cursor/mcp.json` (бесплатный npx) — OK для Client.
- Платный MCP не предлагать.
- Секреты LLM/Brand — только `.env`.

## Вердикт

Команда готова к волне: **да**

`ticket_limit: full-queue`  
Proposed chain: Architect → AI Bridge → Backend (seed+smoke) → Tester → Fixer if needed (≤3 attempts) → Deployer → Client.
