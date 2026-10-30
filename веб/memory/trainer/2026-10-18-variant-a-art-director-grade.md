# Trainer grade — 2026-10-18 — Variant A + Art Director

## План хода

- Запрос: (1) Variant A — Designer LLM → `html_layout` JSON (template/anchor/highlights) → `carousel-layered-composite`; (2) NEW agent **Art Director** after carousel ready — remarks OR approve, **NO auto-remake**, UI mesh/Team; (3) smoke ONE carousel + AD text only; (4) VPS checklist at end = **Orchestrator**.
- Режим: pipeline / AI Bridge / Backend / Frontend mesh · усиление команды (новый агент)
- Роли по chain: **Architect → AI Bridge → Backend → Frontend → Tester → Deployer → (smoke+AD) → Client optional**
- `ticket_limit: default≤3`
- Отклонённого Клиентом `C-*` под эту волну нет (старт шага 0)

## Грейд: B

Было **C** (нет роли AD, нет контракта `html_layout`, web-visual-critic = сайты не IG-карусель). После stubs — **B**: команда может идти в Архитектора; zod/composite map / worker folder / mesh wire — у специалистов, не у Тренера.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 | Статус |
|---|--------|------|------|----------|--------|
| 1 | Нет агента Art Director в registry/rules/skills | Trainer | agent/skill/rule | P0 | **закрыт** stubs |
| 2 | Нет контракта Variant A `html_layout` | AI Bridge / Backend | skill | P0 | **закрыт** skill stub; Architect formalizes zod |
| 3 | Composite сегодня hardcode layout / `layout_variant`≈role | Backend | code | P0 | **открыт** → Architect+Backend |
| 4 | Нет worker `art-director/` на диске | Backend | worker | P1 | **открыт** (реестр + skill указывают; создать по spec) |
| 5 | Mesh/Team UI без ноды AD | Frontend | ui | P1 | **открыт** → Frontend по chain |
| 6 | Critique patterns IG/AI-carousel не были в skills | Trainer | skill | P1 | **закрыт** checklist + public patterns card |
| 7 | VPS checklist | Orchestrator | ops | P2 | **не Тренер** — в конце волны |
| 8 | MCP Playwright/DevTools | Client/Tester | mcp | — | OK (бесплатные в mcp.json) |

## Что добавлено этим ходом

- `.cursor/skills/art-director/SKILL.md`
- `.cursor/skills/art-director/critique-checklist.md`
- `.cursor/skills/art-director/html-layout-variant-a.md`
- `.cursor/rules/art-director.mdc`
- `.cursor/agents/art-director.md`
- `plugins/trainer/variant-a-art-director.md` + строка в `PLUGINS.md`
- Registry + `workers/_index.md` + knowledge shell `knowledge/engineering/roles/art-director.md`
- Pointers: `carousel-json-contract` Phase 7 · `content-pipeline-agents` · `carousel-layered-html-pipeline.md`
- `gap-playbook.md` 4 строки (html_layout / no remake / mesh UI / AD≠Client)

## Proposed chain

```text
Architect (html_layout zod + composite template map; AD step; mesh/Team; NO remake; smoke ONE)
  → AI Bridge (Designer html_layout prompt; AD system + checklist)
  → Backend (execute layout; AD persist verdict; worker stub)
  → Frontend (mesh + Team show verdict/remarks; shell_freeze)
  → Tester (guards) → Deployer (localhost)
  → smoke ONE carousel + AD review text
  → Client optional
  → Orchestrator: VPS checklist
```

## Вердикт

Команда готова к волне: **да** (грейд **B** — идти к Архитектору; не стоп)
