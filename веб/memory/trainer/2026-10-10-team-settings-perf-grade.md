# Trainer grade — 2026-10-10 — team-settings-perf

`ticket_limit: full-queue`

## План хода

- Запрос: Команда выпуска (combat brief, pan, center ports, remove copy-TZ, module perf) + Settings (design preview panel; remove Разведка/Agents/Rules/LLM; Polza audit)
- Режим: Mesh / UI / Settings / Perf / Backend audit note; **без app-кода** на шаге 0
- Тикеты волны: **C-140…C-145** (вся очередь одним проходом)
- Роли: Frontend → Motion → Backend (Polza) → Tester → Fixer → Deployer → Client
- Отвергнуто / superseded: C-138 copy-TZ CTA; C-104 «Разведка в Settings»; Settings Agents/LLM как канон; mock User brief

## Грейд: A

До апгрейда был **C**: skills требовали «Скопировать ТЗ», Settings «Разведка»/Agents/LLM, не было pan/ports/combat-brief/perf-root-cause/C-145. Пробелы закрыты в skills/rules ниже → **A**.

## Пробелы (закрыты этим ходом)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | User brief = mock, нет wire brief+topic → AI | Frontend / AI Bridge | skill | P0 |
| 2 | Static diagram без pan LMB/finger | Frontend / Motion | skill | P0 |
| 3 | Arrow ports от top, не center | Frontend | skill | P0 |
| 4 | Copy/Upload ТЗ всё ещё канон top bar | Frontend | skill | P0 |
| 5 | Module slow load без root-cause checklist | Frontend / Perf | skill | P0 |
| 6 | Settings = Разведка + Agents + LLM; нет design preview panel | Frontend | skill | P0 |
| 7 | Polza в .env, нет architect audit lock на content gen | Architect / Backend | skill | P1 |
| 8 | S37/Client Hard REJECT устарели (copy TZ, нет S39) | Client / Tester | skill/rule | P0 |

## Что добавлено этим ходом

- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — C-140…C-143 + Scout-on-Team
- `.cursor/skills/content-factory-ui/SKILL.md` — C-143/C-144/C-145 Settings trim + design preview + module perf
- `.cursor/skills/web-perf-motion/SKILL.md` — C-144 Studio modules slow
- `.cursor/skills/web-motion-engine/SKILL.md` — C-141 pan affordance
- `.cursor/skills/content-pipeline-agents/SKILL.md` — C-140 brief→AI+topic
- `.cursor/skills/content-factory-analytics/SKILL.md` — Scout params → Team
- `.cursor/skills/backend/SKILL.md` — Polza C-145 audit
- `.cursor/skills/architect/SKILL.md` — path lock C-140…C-145 + Polza note
- `.cursor/skills/trainer/gap-playbook.md` — симптомы C-140…C-145
- `.cursor/skills/client-scenarios/SKILL.md` — S37 update + **S39 HARD**
- `.cursor/rules/client.mdc` — Hard REJECT пункт 8 → C-138…C-145 / S37+S39
- `plugins/trainer/PLUGINS.md` — указатели волны

## MCP

Playwright / chrome-devtools из `.cursor/mcp.json` — без платных ключей. Платный MCP не предлагать.

## Polza AI — note for Architect (не закрыто Тренером)

- Env hint уже есть: `AGGREGATOR_BASE_URL` → polza.ai, smoke `scripts/smoke-polza-connection.ts`, `lib/analyst/llm.ts` / `lib/llm/aggregator` частично.
- **Обязан Архитектор в C-145:** пройти все content-generation call sites → вердикт **connected / partial / not wired** + список gap. Settings LLM UI снимается; источник правды = env + Team model pick.

## Вердикт

Команда готова к волне: **да**

`proposed_chain:` Frontend → Motion → Backend (Polza audit/wire) → Tester → Fixer → Deployer → Client  
`architect:` lock в skill; перед кодом `chain.md` + path order C-143→C-140→C-142→C-141; C-145 Settings; C-144 measure-then-fix  
`ticket_limit:` full-queue — вся очередь C-140→C-145 одним проходом
