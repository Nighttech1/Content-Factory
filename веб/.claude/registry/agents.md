# Реестр команды агентов — Content Factory (Vernatun)

> Нативный Claude Code слой: правила — `.claude/rules/`, скиллы — `.claude/skills/`, субагенты — `.claude/agents/`, MCP — `.mcp.json`.

## Базовая команда

| Роль | Правило | Скилл | MCP / плагины |
|------|---------|-------|----------------|
| Клиент | `rules/client.md` | **`client-scenarios`** (клики/ввод/assert), `client-review`, `web-visual-critic`, `ticket-engine`, `taste-skill`; чеклисты `responsive-mobile-web` | встроенный браузер (desktop+mobile) сценарии+скрин, console/network · `plugins/client` |
| Оркестратор | `rules/orchestrator.md` | реестр + team-org + `ARCHITECTURE.md` / `DEV_PLAN.md` | |
| Архитектор | `rules/architect.md` | `architect`, `content-module-sdk`, `prompt-engineering` | `plugins/architect` |
| Фронтендер | `rules/frontend.md` | **A (основной):** `image-to-luxury-ui`, `luxury-web-craft`, `create-design-md`, `design-token-guardian`, `xyflow-agent-mesh`, `content-factory-ui`, **`content-factory-analytics`**, **`21st-ui-catalog`**, `responsive-mobile-web` · Stitch HTML → UI · автоподбор с 21st.dev | `plugins/frontend` + **MCP `21st`** |
| Motion | `rules/motion.md` | `web-motion-engine`, `emil-animate`, `review-animations`, `web-perf-motion`, `remotion-pipeline` | `plugins/motion` |
| Бекендер | `rules/backend.md` | `backend`, `safe-db-migrations`, `bullmq-job-queue`, `prisma-content-schema`, `sse-job-stream` | postgres MCP; `plugins/backend` |
| AI Bridge | `rules/ai-bridge.md` | `ai-bridge`, `prompt-engineering`, `heygen-avatar`, `content-pipeline-agents`, `carousel-prompt-trace` (carousel weak-link), `rag-stack` (опц. Analyst) | `plugins/ai-bridge` |
| Кодер | `rules/coder.md` | `coder` + маршрутизация по chain | |
| Тестировщик | `rules/tester.md` | `tester`, RBAC mesh guards, Armenian font check | Lighthouse, встроенный браузер |
| Фиксер | `rules/fixer.md` | `fixer` | `plugins/fixer` |
| Деплоер | `rules/deployer.md` | `deployer` | VPS gate после Клиента |
| **Тренер** | `rules/trainer.md` + `.claude/agents/trainer.md` | **`trainer`** (канон BM committee/trainer: грейд A–D, gap-playbook); `taste-skill`, `client-scenarios` | `plugins/trainer` · встроенный браузер бесплатно |
| **Art Director** *(pipeline; по chain)* | `rules/art-director.md` + `.claude/agents/art-director.md` | **`art-director`** (brutal carousel QA; remarks\|approve; **NO auto-remake**); Variant A `html-layout-variant-a`; `taste-skill` | `plugins/trainer/variant-a-art-director.md` · mesh/Team UI |

## Профили Frontend (Content Factory)

| Задача | Стек | Агенты в chain |
|--------|------|----------------|
| Design system + Studio Launchpad | Next 15 + Tailwind v4 + framer-motion | Frontend (A + `21st-ui-catalog`) → Motion → Клиент |
| Agent Mesh Canvas | `@xyflow/react` + PulseEdge | Frontend (+ `xyflow-agent-mesh`) → Motion |
| Media Inspector HITL | Video 9:16 / Carousel DnD | Frontend → Motion |
| Analytics Self-learning | Scout/Outliers/Retention/RL/Telemetry + `content-factory-analytics` | Frontend → Backend (types) → Клиент |
| Module SDK + workers | Prisma + BullMQ + Remotion/HeyGen | Backend → AI Bridge → Frontend |

**Flutter / Cortana / Sputnik Life OS skills** в библиотеке сохранены как legacy, но **не подключать** в chain Content Factory без явного запроса.

## Доменные skills фабрики (новые)

| Skill | Когда |
|-------|--------|
| `content-factory-ui` | Токены Dark Luxury, GlassCard, Stitch mapping; UX-4 Launchpad/Mission Control/Schedule/Settings |
| `carousel-studio-handoff` | Create: Button segment + handoff; Designer describe→draw; Публикация→**Черновики**; S41 + **S43** |
| `carousel-json-contract` | Dramaturgy JSON ↔ Layout; dynamic N; **active DESIGN.md**; **C-drafts-always**; S42 |
| `carousel-prompt-trace` | Weak-link Client debug: MD dumps in `docs/карусель тест/`; full prompts Scriptwriter→Designer→Image; budget 6 PNG |
| *(Settings Design)* | канон в `content-factory-ui` § Design Embla ≤10 + Razbor «Добавить новый дизайн»; 21st `carousel.tsx`; **S43** |
| `content-factory-analytics` | `/analytics` «Самообучающаяся диагностика» + `types/analytics.ts` |
| `21st-ui-catalog` | **PRIMARY UI** Frontend: search/pick/adapt с 21st.dev (красивее + анимации); сток запрещён при живом MCP |
| `xyflow-agent-mesh` | `/admin/mesh`, AgentNode, PulseEdge, Minimap |
| `content-module-sdk` | `IContentModule`, registry, plugin slot |
| `remotion-pipeline` | Cartoon reels / video composition |
| `heygen-avatar` | Module 4 Avatar API + persona switcher |
| `bullmq-job-queue` | Очереди рендера, статусы JobStatus |
| `prisma-content-schema` | User/ContentJob/Role модели |
| `sse-job-stream` | `useJobStream`, GenerationDrawer live log |
| `content-pipeline-agents` | Researcher → Hook → Script → Designer → **Art Director** (optional) → HITL → Publisher → Analyst |
| `art-director` | Post-carousel visual QA: approve \| remarks; **NO auto-remake**; Variant A `html_layout` critique |
| **`club-reels-module`** | Модуль снятых рилсов клуба `club-reels`: registry + capcut-gate allowlist + loop «правки → правила» (style-memory). Живое видео, не cartoon/heygen |
| **`reels-scriptwriter-workspace`** | Чат-воркспейс со Сценаристом как у Клода: рельс тредов по типам идей, idea→script→съёмка→исходники в том же треде. UX-оболочка (контент — `reels-scriptwriter`) |
| **`reels-timeline-editor`** | CapCut-аналог: NLE timeline 9:16 (дорожки/trim/split/ripple/overlay/motion), wired to MontageProject schema + ffmpeg render. Снять mock в `CapCutEditorShell` |

## MCP / инструменты

В Claude Code живые проверки веду **встроенным браузером** (`mcp__Claude_Browser__*`); записи ниже — зеркало `.mcp.json` (из `.cursor/mcp.json`), используются если сервер поднят.

| MCP | Зачем | Эквивалент в Claude Code |
|-----|--------|--------------------------|
| **21st** | Каталог UI: `search` / `get_component` / themes — Frontend сам подбирает паттерны | MCP `21st` (нужен `API_KEY_21ST`) |
| playwright (1440) | Desktop: сценарии (click/type/wait/snapshot) + скрин | встроенный браузер @1440 |
| playwright-iphone / android | Те же сценарии на мобилках | `resize_window` mobile preset |
| chrome-devtools | Сеть/консоль/perf | `read_console_messages` / `read_network_requests` |
| image-compare | Diff vs Stitch HTML screenshots | повторный screenshot |
| a11y | Доступность инспектора | — |
| lighthouse | Perf Analytics page | lighthouse MCP если доступен |
| postgres | Prisma/Postgres gate (после поднятия БД) | postgres MCP |

## Агенты-работяги (Content Pipeline)

Отдельный контур от команды выше. Операционные инструкции микро-агентов фабрики (производство контента), не разработка Studio/Mesh.

**Корень:** [`workers/`](../../workers/README.md) · реестр: [`workers/_index.md`](../../workers/_index.md) · brand lock: [`workers/_shared/`](../../workers/_shared/brand-lock.md)

| Worker | Папка | Mesh / модуль |
|--------|-------|----------------|
| Researcher | `workers/researcher/` | The Researcher |
| Hook Writer | `workers/hook-writer/` | The Hook Writer |
| Script Writer | `workers/script-writer/` | The Script Writer |
| Router | `workers/router/` | Dynamic Router |
| Designer Carousel | `workers/designer-carousel/` | Module 1 · **MD brandbook lock** |
| Designer Graphics | `workers/designer-graphics/` | Module 2 |
| Designer Cartoon | `workers/designer-cartoon/` | Module 3 |
| Designer HeyGen | `workers/designer-heygen/` | Module 4 |
| HITL Gate | `workers/hitl-gate/` | Human-in-the-Loop |
| **Art Director** | `workers/art-director/` *(создаёт Backend по spec; skill stub уже есть)* | Post-ready carousel QA — remarks \| approve; **NO auto-remake** |
| Publisher | `workers/publisher/` | The Publisher |
| Analyst | `workers/analyst/` | The Analyst |

Спека встраивания в код (для AI Bridge): skill `content-pipeline-agents` + `art-director`. Не смешивать с ролями Frontend/Backend.
**Variant A:** Designer emits `html_layout` → `carousel-layered-composite` executes — see `art-director/html-layout-variant-a.md`.

## Не включены по умолчанию

Geo-аналитик, Mapbox, Flutter Life OS chain, Cortana retrieval (можно вернуть позже для Analyst RAG).
