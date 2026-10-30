# Content Factory — готовность команды и пробелы

## Что уже есть (скопировано из Sputnik + апгрейд)

| Блок | Статус |
|------|--------|
| Правила ролей (orchestrator, architect, frontend, motion, backend, ai-bridge, coder, tester, fixer, deployer, client) | ✅ |
| Цикл Клиент↔Оркестратор | ✅ `docs/CLIENT_ORCHESTRATOR_CYCLE.md` |
| Skills luxury UI / motion / tester / deployer | ✅ |
| MCP visual QA (Playwright ×3, chrome-devtools, image-compare, a11y, lighthouse) | ✅ |
| Plugins ролей | ✅ |
| Доменные skills фабрики (9 шт.) | ✅ добавлены |
| `ARCHITECTURE.md` + `DEV_PLAN.md` | ✅ |

## Что добавлено под план разработки

1. `content-factory-ui`
2. `xyflow-agent-mesh`
3. `content-module-sdk`
4. `remotion-pipeline`
5. `heygen-avatar`
6. `bullmq-job-queue`
7. `prisma-content-schema`
8. `sse-job-stream`
9. `content-pipeline-agents`

## Рекомендуемые следующие шаги (не блокеры старта Спринта 1)

| Нужно | Тип | Зачем | Когда |
|-------|-----|--------|-------|
| Postgres MCP (после поднятия БД) | MCP | Gate к Prisma | Спринт 6 |
| Redis/BullMQ dashboard (опц. Arena) | Plugin/tool | Отладка очередей | Спринт 6–7 |
| Figma MCP (если появятся макеты сверх Stitch) | MCP/Plugin | Дизайн-синк | По необходимости |
| shadcn CLI + Radix | уже в skills ui-styling | Примитивы | Спринт 1 |
| Cursor extension: Tailwind IntelliSense, ESLint, Prisma | IDE | DX | Спринт 1 |
| Secrets `.env.example` (HeyGen, Redis, DATABASE_URL, LLM) | Config | Без ключей в git | Перед Спринтом 6 |
| E2E Playwright tests в репо | Tester skill уже есть | RBAC mesh + hy fonts | Спринт 7 |
| Satori/Puppeteer worker notes | расширить module SDK | Module 1 | Спринт 6 |

## Legacy (не использовать в chain по умолчанию)

`cortana-*`, `sputnik-data-schema`, Flutter skills, sqlite MCP Sputnik — оставлены в библиотеке на случай переноса идей, в Content Factory chain не входят.

## Клиент: сценарии (не только скрины)

Уже подключён **Playwright MCP** — умеет click / type / fill / snapshot / wait.  
Добавлен skill `client-scenarios` + обновлены `client.mdc` и `plugins/client/PLUGINS.md`.  
Опционально позже: Stagehand MCP, если UI будет слишком «плавающим».

## Агенты-работяги контента

Отдельный контур: папка [`workers/`](../workers/README.md) (не путать с `.cursor/skills` разработчиков).  
Brand lock карусели: MD brandbook → одинаковые слайды.

## Вердикт

**Команда готова начинать Спринт 1** (дизайн-система + App Shell) по циклу Оркестратора.
Backend/HeyGen/Remotion skills уже на месте — подключатся в Спринтах 6–7 без перестройки команды.
