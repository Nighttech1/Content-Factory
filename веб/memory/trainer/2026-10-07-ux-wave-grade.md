# Trainer grade — 2026-10-07-ux-wave

## План хода

- Запрос: UX-волна по утверждённому плану (plan file не трогать): быстрый nav ≤1s; карусели 9:16 stack + Создать карусель modal; Холст → «Команда выпуска» + AgentPropertiesPanel; расписание collapsed/wrap/без day-strip/стрелки у title.
- Режим: UI + Mesh + Motion (route enter) + приёмка сценариями.
- Роли по chain: Тренер (шаг 0) → Архитектор (spec + chain) → Frontend → Motion → Тестировщик → Фиксер → Деплоер → Клиент.
- Skills-фокус: `content-factory-ui`, `web-motion-engine`, `content-pipeline-agents`, `xyflow-agent-mesh`, `client-scenarios`, `gap-playbook`.
- MCP: Playwright / chrome-devtools в `.cursor/mcp.json` — живы; платный MCP не нужен.
- Не делать: прод-код `app/`/`components/`; не закрывать C-*; не править plan file.

## Грейд: A

До апгрейда skills: **C** (критичный пробел знания — канон UX-волны отсутствовал в skills, риск регресса C-62 L/R-on-card / mesh chrome / schedule).  
После дописи этого хода: **A** — команда может идти к Архитектору.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Не было канона nav ≤1s / запрета full-page opacity:0 | Motion + Frontend | skill | P0 |
| 2 | Карусели: 9:16 stack vs плитки/сток/L/R на карточке; CreateCarouselModal; scrollbar | Frontend | skill | P0 |
| 3 | «Разбор» visibility (не hover-only) | Frontend + pipeline | skill | P0 |
| 4 | Mesh title «Команда выпуска», убрать // owner chrome, AgentPropertiesPanel | Frontend (mesh) | skill | P0 |
| 5 | Schedule: collapsed folders, wrap, no day-strip, month arrows by title | Frontend | skill | P1 |
| 6 | Нет client-сценариев S15–S17 под новые CTA | Клиент | skill | P1 |

Роли/registry/MCP/rules: без дыр (Frontend, Motion, Architect, Tester, Client, Trainer на месте). Env IG к этой волне не обязателен.

## Что добавлено этим ходом

- `.cursor/skills/content-factory-ui/SKILL.md` — Nav/route loading; carousel 9:16 stack; CreateCarouselModal; schedule collapsed/wrap/day-strip/month arrows; scrollbar split (chat hide vs stack visible); Do not UX wave.
- `.cursor/skills/web-motion-engine/SKILL.md` — запрет full-page opacity:0 на route enter.
- `.cursor/skills/content-pipeline-agents/SKILL.md` — Razbor CTA always visible.
- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — «Команда выпуска», убрать // chrome, линия агентов, AgentPropertiesPanel + checklist.
- `.cursor/skills/client-scenarios/SKILL.md` — S15, S16, S17.
- `.cursor/skills/trainer/gap-playbook.md` — 9 новых строк симптомов UX wave.

## Вердикт

Команда готова к волне: **да**
