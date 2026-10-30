# Trainer grade — 2026-10-16 — Scout↔Apify only

## План хода

- Запрос: Apify Instagram scraper **привязан только к Scout** — кнопка **«Разведать»**, auto-scout filters + schedule; колонка **Конкуренты** = **last Scout snapshot**; Apify **никогда** на page load / focus / remount.
- Режим: backend cost + Team mesh Scout UI + Studio feed bind + Client S52.D (усиление команды, не prod).
- Роли по chain: Архитектор → Backend → Frontend → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент.
- `ticket_limit: default≤3`
- `shell_freeze: true` (AppShell / left nav)
- **НЕ prod**

## Грейд: A

До усиления был **C** (S51 канон всё ещё разрешал Apify на «explicit feed GET» — противоречит запросу). Пробелы закрыты в skills/rules этим ходом.

## Пробелы (закрыты)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | S51: scrape on feed GET / Competitors open | Backend / FE | skill | P0 — **закрыт** Scout-only + snapshot |
| 2 | Нет канона CTA «Разведать» + filters/schedule в Scout panel | Frontend / Mesh | skill | P0 — **закрыт** xyflow + content-factory-ui |
| 3 | Нет Client Playwright S52.D / Hard REJECT | Клиент | skill/rule | P0 — **закрыт** client-scenarios + client.mdc §18 |
| 4 | AI Bridge «live = Backend feed» без Scout owner | AI Bridge | skill | P1 — **закрыт** Scout-only bar |

## Что добавлено этим ходом

- `.cursor/skills/backend/apify-scraper-cost-discipline.md` — Scout-only triggers; feed = 0 Apify
- `.cursor/skills/backend/SKILL.md` — wire snapshot; supersede scrape-on-feed-GET
- `.cursor/skills/content-factory-ui/SKILL.md` — Competitors = last snapshot; Scout «Разведать»
- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — Scout panel CTA + auto-scout filters/schedule defaults
- `.cursor/skills/ai-bridge/SKILL.md` — Scout owner; no feed/tool scrape
- `.cursor/skills/client-scenarios/SKILL.md` — **S52.D** HARD
- `.cursor/rules/client.mdc` — §18 S52.D Hard REJECT
- `.cursor/skills/architect/SKILL.md` — wave pack ≤3 + chain
- `.cursor/skills/tester/SKILL.md` — S52.D counters
- `.cursor/skills/content-pipeline-agents/SKILL.md` — Scout owns Apify → snapshot
- `.cursor/skills/trainer/gap-playbook.md` — 2 rows
- `plugins/trainer/s52-scout-apify-only.md` + `PLUGINS.md` index

## Proposed tickets (≤3)

| ID | P | Scope |
|----|---|--------|
| **C-scout-apify-bind** | P0 | Backend: Scout run entrypoint; snapshot SoT; schedule/filters; feed GET never Apify; counters |
| **C-scout-razvedat-ui** | P0 | Frontend/Mesh: bottom **«Разведать»**; auto-scout filters + frequency; Scout defaults |
| **C-competitors-snapshot** | P0 | Frontend Studio: Competitors open/focus/remount = snapshot only; soft-fail empty |

## Proposed chain

```
Trainer ✅ → Architect (spec + chain.md, shell_freeze, НЕ prod)
  → Backend (C-scout-apify-bind)
  → Frontend (C-scout-razvedat-ui + C-competitors-snapshot; no overlap without Architect order)
  → AI Bridge (no-scraper / Scout describe-only)
  → Tester (S52.D guards / apify_run_count on feed-open = 0)
  → Fixer → Deployer (localhost only)
  → Client Playwright S52.D
```

## MCP / env

- Playwright / chrome-devtools — OK для S52.D (бесплатные из mcp.json).
- `IG_SCRAPER_API_KEY` — только `.env`; не в memory/tickets.
- Платный MCP не предлагать.

## Вердикт

Команда готова к волне: **да**  
Грейд: **A** · `ticket_limit: default≤3` · **НЕ prod**
