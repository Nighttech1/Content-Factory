# Trainer grade — 2026-10-10 — static-release-team

`ticket_limit: full-queue`

## План хода

- Запрос: полный рефакторинг «Команда выпуска» по user TZ + эталон `code_artifact.html`
- Режим: Mesh / UI (static diagram + drawer); без app-кода на шаге 0
- Тикеты волны: **C-138** (remove MultiButton/MeshPipelineSwitcher) → **C-139** (STATIC flowchart + User accordion + Designer chip + 3-tab drawer; DELETE xyflow Flow*)
- Роли: Frontend → Motion → Tester → Client (Architect lock уже в skill; `chain.md` перед кодом)
- Отвергнуто ранее: C-129 label offsets; C-137 xyflow path всё ещё даёт сдвиги → static supersedes

## Грейд: A

До апгрейда был **C** (skills требовали MultiButton + допускали xyflow view-layer; drawer = systemPrompt/skills/rules/modelConfig с timeout-риском; User=agent). Пробелы закрыты в skills/rules ниже → **A**.

## Пробелы (закрыты этим ходом)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | MultiButton/MeshPipelineSwitcher всё ещё канон mesh | Frontend | skill | P0 |
| 2 | C-137 допускал новый xyflow — сдвиги снова | Frontend | skill | P0 |
| 3 | Drawer schema ≠ 3 tabs artifact; rules отдельно; timeout | Frontend | skill | P0 |
| 4 | User = agent/drawer; нет accordion | Frontend | skill | P0 |
| 5 | Нет design.md chip на Designer card | Frontend | skill | P1 |
| 6 | S37/Client Hard REJECT устарели под xyflow/C-137 fields | Client/Tester | skill | P0 |
| 7 | Architect path lock остановился на C-137 | Architect | skill | P0 |

## Что добавлено этим ходом

- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — rewrite **C-138 / C-139** STATIC
- `.cursor/skills/content-factory-ui/SKILL.md` — mesh MultiButton superseded; top bar / drawer / anti-patterns
- `.cursor/skills/trainer/gap-playbook.md` — строки C-138/C-139 symptoms
- `.cursor/skills/architect/SKILL.md` — lock C-138…C-139 + path order + full-queue chain
- `.cursor/skills/client-scenarios/SKILL.md` — **S37** + Hard REJECT под static/tabs
- `plugins/trainer/PLUGINS.md` — указатели C-138/C-139
- `.cursor/rules/client.mdc` — Hard REJECT пункт 8 → C-138/C-139 + S37 static/tabs
- `.cursor/skills/web-motion-engine/SKILL.md` — SVG dashflow + User accordion (не PulseEdge)

## MCP

Playwright / chrome-devtools из `.cursor/mcp.json` — без платных ключей. Платный MCP не предлагать.

## Вердикт

Команда готова к волне: **да**

`proposed_chain:` Frontend → Motion → Tester → (Fixer) → Deployer → Client  
`architect:` lock в skill; перед кодом короткий `chain.md` + delete-list  
`ticket_limit:` full-queue — вся очередь C-138→C-139 одним проходом
