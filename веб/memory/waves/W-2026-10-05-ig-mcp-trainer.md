# Wave W-2026-10-05 — IG ID + MCP UI tools + агент Тренер

| Field | Value |
|-------|-------|
| **Wave** | `W-2026-10-05-ig-mcp-trainer` |
| **Tickets** | `C-42` (env IG id), `C-43` (MCP paths), `C-44` (Тренер из Sputnik mentor) |
| **Status** | in progress |

## План оркестратора

1. **Оркестратор** — план + волна (этот файл).
2. **Бекендер (конфиг)** — записать `IG_USER_ID` в `.env`; слот под токен позже.
3. **Оркестратор / инфраструктура** — починить пути Node в `.cursor/mcp.json` (Playwright, chrome-devtools, image-compare, a11y, lighthouse); убедиться что UI-инструменты в конфиге.
4. **Архитектор** — источник Тренера = `cortana-mentor` (единственный наставник в Sputnik); spec адаптации под Content Factory.
5. **Кодер (реестр)** — `trainer.mdc` + skill + registry + team-org + orchestrator + cycle.

## Invariants

- Токен Instagram **не** писать в memory/tickets/git — только `.env` когда пользователь даст.
- IG User ID можно в `.env` (не секрет уровня token).
- Тренер не клонирует Cortana TG/psych portrait runtime — только роль наставника в цикле разработки.
