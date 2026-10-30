# Trainer grade — 2026-10-15 — DEV_PLAN research / shell freeze

## План хода

- Запрос: research wave — изучить живое приложение, **исправить `DEV_PLAN.md` чекбоксами** под фактическое состояние; **constraint:** существующий client UI shell / nav / chrome **не менять** (`shell_freeze`).
- Режим: docs/research (не UI-feature); сверка product vs DEV_PLAN + pipeline truth.
- Роли по chain: **Trainer ✅ → Architect** (audit + DEV_PLAN) → Tester (docs-only / no shell churn) → Client optional. **Без** Frontend/Motion.
- `ticket_limit: default≤3` (один plan-sync пакет достаточно; full-queue не запрошен).

## Грейд: A

После закрытия пробела shell-freeze в skills/plugins — команда готова к Архитектору.

| Слой | Статус |
|------|--------|
| Агент Architect | OK — `.cursor/rules/architect.mdc` + skill |
| Skills focus | `architect`, `ticket-engine`, `content-pipeline-agents` — усилены под research + freeze |
| Rule / data-safety | Не конфликтует (нет truncate/migrate/publish) |
| MCP | Playwright / chrome-devtools в `.cursor/mcp.json` — OK для evidence; платный MCP не нужен |
| Env | Не требуется для plan-sync |

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 | Статус |
|---|--------|------|------|----------|--------|
| 1 | Не было явного **UI shell freeze** для DEV_PLAN research wave | Architect / FE risk | skill/plugin | P0 | **закрыт** этим ходом |
| 2 | ticket-engine знал только визуальные C-* | Client/Orchestrator | skill | P1 | **закрыт** (plan tickets) |
| 3 | pipeline skill не отделял doc-sync от UI правок | AI Bridge/Architect | skill | P2 | **закрыт** |

## Что добавлено этим ходом

- `.cursor/skills/architect/SKILL.md` — § Research / DEV_PLAN sync + `shell_freeze` HARD + proposed chain
- `.cursor/skills/ticket-engine/SKILL.md` — § Plan / research tickets
- `.cursor/skills/content-pipeline-agents/SKILL.md` — § DEV_PLAN / research waves
- `.cursor/skills/trainer/gap-playbook.md` — 2 строки (устаревший plan + shell breakage)
- `plugins/trainer/dev-plan-shell-freeze.md` + строка в `plugins/trainer/PLUGINS.md`
- этот файл: `memory/trainer/2026-10-15-dev-plan-research-grade.md`

## Вердикт

Команда готова к волне: **да**

Next: Архитектор — live/route audit → правка `DEV_PLAN.md` checkboxes only; `shell_freeze: true` в spec.
