---
name: architect
description: >-
  Architect: specs, layer contracts, chain.md before code. Use when acting as
  Архитектор, planning multi-role work, schema changes, or mid-flight escalation.
---

# Архитектор

## Skill-first

1. Этот файл. KB: `knowledge/engineering/roles/architect.md` и `sources/architect/` — только при редком паттерне.
2. LLM / промпты / tools / RAG в продукте → `.claude/skills/prompt-engineering/SKILL.md` (+ AI Bridge в chain).
3. LangGraph / Mem0 / vector store / parse → `.claude/skills/rag-stack/SKILL.md` + `plugins/architect/PLUGINS.md` (выбрать один store в spec).
4. Cortana retrieval (ТЗ §5–9) → `.claude/skills/cortana-retrieval/SKILL.md` + `cortana-stack`; **filter-first**, GraphRAG не default.

## Rules

- Сначала структура репо, потом спека **в файлах**: `memory/tickets/C-xx-slug/architect-spec.md` + `chain.md` — до любого кода.
- Назначь исполнителей и **порядок** в chain (часто Backend → Frontend/Motion; WebGL только явно).
- **Cortana retrieval chain (типовой):** Архитектор → AI Bridge → Backend (upsert entity index при sync) → Тестировщик → Фиксер → Деплоер → Клиент. Frontend/Motion не звать.
- Acceptance — языком Клиента (сценарий). Визуальные `C-*` → Frontend + `luxury-web-craft` / Motion. Палитру `DESIGN.md` не подменяй.
- DDL / схема / ключи хранилища → шаг Backend + `safe-db-migrations` (запрет DROP без двухэтапного депрекейта).
- Контракт ИИ (промпт, `SufficiencySignal`, tools, HITL) → spec по `prompt-engineering` + ТЗ §2.1; исполнитель — AI Bridge.
- Vector/memory: в spec явно Chroma **или** pgvector **или** Pinecone (+ Mem0 если нужна user-memory); не все сразу. Для entity-index Cortana — отдельная collection от dialog memory.
- Не пиши финальный код. Не веди бэклог (это Оркестратор).
- Mid-flight: обнови spec+chain, не патчи продукт сам.
- Сквозные инварианты (один список сущностей, цифры не спорят, ИИ не пишет в БД в обход премодерации) фиксируй в spec, не оставляй Кодеру «додумать».

## Content Factory UI waves (Studio / Mesh / Razbor)

Spec + `chain.md` **до кода**. Skills правды: `content-factory-ui`, `21st-ui-catalog`, `xyflow-agent-mesh`, `content-pipeline-agents`, `content-factory-analytics`. Не Кодер вместо FE+BE+AI Bridge.

**W-2026-10-06-nav-mesh-razbor** (закрыта каноном): C-58 / C-59 / C-57. **C-57 children и C-59 scriptwriter→publisher superseded** волной workspace-polish.

**W-2026-10-06-workspace-polish** (P0 сначала): **C-60 → C-61 → C-62**. Не overlap `SidebarNavigation` / `VerticalPostCarousel` / `RazborModal` параллельно.

| ID | Spec lock |
|----|-----------|
| C-60 | Меню Студии **без** children-модулей. Aside resizable (drag), persist `localStorage` **`cf.sidebar.width`**, clamp ~220–420. C-27 `nav-studio-children` **не** возвращать. |
| C-61 | Убрать `// Рабочая страница модуля`. **Запрет** `opacity` pulse на title/count (`showRefetchHint`). `handleCompetitorsTopicSearch` = `useCallback`. Glow «Создать» 21st на всех модулях. Nested scroll: `overscroll-contain`. |
| C-62 | Razbor chat: hide scrollbar. Scriptwriter CTA → **Designer** (не publisher). Designer bottom CTA → publisher. Toggle белый; Наши disabled+grey до draft. Drafts: same-size cards, L/R slides, scheduled date under card. |
| C-58 | Mesh view-only + last-known count (без `"…"`). |
| C-59 | Mic = `AgentChatComposer`; Designer только `carousel-engine`; publisher datetime без чата. CTA сценариста **не** к публицисту (см. C-62). |
| C-57 | Без счётчика Launchpad; MenuVertical `framer-motion` `text-sm`. Children Студии **сняты C-60**. |

### UX wave 4 — Mission Control (P0 first; ticket_limit soft)

Skills: `content-factory-ui`, `content-factory-analytics`, `content-pipeline-agents`, `web-motion-engine`, `backend`, `client-scenarios` S23–S27.

| ID (предложение Тренера) | Spec lock |
|--------------------------|-----------|
| **C-76** | Launchpad: плитки **«Статьи на сайт»** + **«Статьи в TG»**; **убрать** «Выберите модуль…»; одна описательная часть |
| **C-77** | Команда запуска: **CompactMultiButton** (`multi-button.tsx`); агенты **Разборщик** (чужой) vs **Аналитик** (`/analytics`) |
| **C-78** | Schedule: sticky hover popup; DnD слот **дата↔дата**; публицист следует календарю; убрать нижний хелп про время слота |
| **C-79** | Площадки: Settings CRUD API-ключей + параметр/picker площадки в генерации/слоте (Backend+FE) |
| **C-80** | Analytics: полная переработка «Самообучающаяся диагностика» — Scout/Outliers/Retention/RL/Telemetry, RU, `types/analytics.ts` |
| **C-81** | Settings: кнопка загрузки DESIGN.md; LLM URL провайдера + API key агрегатора; каталог моделей не только 4 стока |

Исторически: **4a** C-76→C-77→C-78; **4b** C-79→C-80→C-81. При `ticket_limit: full-queue` — **не** резать 4b; один chain C-79→C-80→C-81. Не overlap `SettingsShell` platforms + `AnalyticsShell` + LLM settings в **parallel** paths — только последовательный path lock. Остаток wave3 (publisher E2E live) — в guards, не путать ID.

### UX wave 5 — после приёмки UX-4 (C-82…C-87; ticket_limit full-queue)

Skills: `content-factory-ui`, `xyflow-agent-mesh`, `web-motion-engine`, `21st-ui-catalog`, `client-scenarios` S28–S31.

| ID | Spec lock |
|----|-----------|
| **C-82** | Studio Launchpad: убрать серый stock hover outline на плитках модулей |
| **C-83** | Mesh «Команда выпуска»: `MultiButton` **раскрытый** (не Compact), по центру; title как «Студия» |
| **C-84** | Schedule: один sticky opaque popup Save/Cancel; DnD без floating spam; без rail badges `4:5 · PNG`; клик time/platform не закрывает |
| **C-85** | Settings Design: только filename + upload; Floating Motion TOC справа (Dark Luxury); убрать textarea+Save/Reset |
| **C-86** | Settings Platforms: «Проверить подключение» + green/red status (не enabled checkbox) |
| **C-87** | Settings Agents: две MultiButton (content-type + agent), не tab pills |

Path lock: C-82∥C-83 OK (разные поверхности); C-84 отдельно; C-85→C-86→C-87 последовательно в `SettingsShell` (не parallel). Full-queue — не резать на пачки по 3.

### UX wave 8 — Mesh / Schedule / Settings (C-105…C-113; ticket_limit full-queue)

Skills: `content-pipeline-agents`, `xyflow-agent-mesh`, `content-factory-ui`, `web-motion-engine`, `21st-ui-catalog`. Тренер грейд: `memory/trainer/2026-10-09-ux-wave8-grade.md`.

| ID | Spec lock |
|----|-----------|
| **C-105** | Naming everywhere: **Разборщик** ≠ **Аналитик** ≠ **Тренер (пайплайн)**; UI Razbor/mesh/Settings не писать «Аналитик» для разбора чужого |
| **C-106** | Каждый pipeline: **Scout → Аналитик → Тренер →** release agents; Тренер NEW (skills/plugins/HF/GitHub или manual rules) |
| **C-107** | Mesh edges: стрелки + concrete handoff labels (не «json») |
| **C-108** | Schedule popup: позиция независима от expand правого file-tree |
| **C-109** | Schedule popup: draggable |
| **C-110** | Rail «Модули студии»: resizable width + persist `cf.schedule.rail.width` |
| **C-111** | Settings Scout: MultiButton не все типы слепо; per type — platform/social icon |
| **C-112** | Per content-type **свой** copywriter agent (не shared) |
| **C-113** | Agent prompts: upload MD + filename + list skills/plugins/MCP (не code textarea) |

Path lock (без overlap):

1. **C-105 + C-106 + C-107** — mesh naming + chain + edges (один mesh path)
2. **C-108 + C-109 + C-110** — schedule shell (один path)
3. **C-111 + C-112 + C-113** — Settings Scout/Agents (+ mesh panel sync C-113)

Не резать UX-8a/8b при full-queue. Cursor-Тренер ≠ продуктовый Тренер пайплайна.

### Vernatun UI wave — Brand / Mesh static / Schedule / Analytics (C-122…C-128; ticket_limit full-queue)

Skills: `content-factory-ui`, `xyflow-agent-mesh` (**static picture**), `content-pipeline-agents`, `content-factory-analytics`, `client-scenarios` S32–S35. Тренер: `memory/trainer/2026-10-10-vernatun-ui-wave-grade.md`.

| ID | Spec lock |
|----|-----------|
| **C-122** | Sidebar brand: PNG `logo-transparent` + **«Vernatun» справа** (не под) — **superseded by C-130** emblem-only |
| **C-123** | Studio: убрать «создание нового модуля» / RegisterModule entry |
| **C-124** | Mesh: static picture — **superseded by C-137** clean-slate rewrite |
| **C-125** | Dual-lane / barbell / Scout≠Trainer — **intent retained** in C-137 new UI |
| **C-126** | Schedule: `popupPos` persist across slot switch + refresh (`cf.schedule.popup.pos`) |
| **C-127** | Analytics: menu like Studio (per module); RL = Trainer + HITL **«Согласовано»** |
| **C-128** | Retention: %@15s через дробь `(n/m)` |

Path lock (без overlap files): historically C-122→C-128. New wave: **C-130…C-137** ниже.

### Nav / Mesh rewrite wave — C-130…C-137 (`ticket_limit: full-queue`)

Skills: `content-factory-ui`, `xyflow-agent-mesh` (**C-137 clean-slate**), `web-motion-engine` (C-131), `content-factory-analytics` (C-136 entry), `client-scenarios` S36–S38. Тренер: `memory/trainer/2026-10-10-nav-mesh-rewrite-grade.md`. Emblem asset: user-attached circle → `public/brand/vernatun-emblem.png`.

| ID | Spec lock |
|----|-----------|
| **C-130** | Brand: **emblem-only** circle (no baked wordmark) left of text **VERNATUN** |
| **C-131** | Carousel: smooth **crossfade**; **no black flash** between slides |
| **C-132** | Card meta: Century Gothic **white 12px** all modules |
| **C-133** | Hydration: ban conditional `data-testid` / mounted-only brand (`SidebarNavigation`) |
| **C-134** | Razbor / system source titles: Century Gothic **white 16px** everywhere |
| **C-135** | Razbor composer: longer input + **3 buttons right**; **circular red X** close |
| **C-136** | Nav IA: sidebar **only** Studio / Schedule / Settings; Mesh + Analytics = **module top nav** |
| **C-137** | Mesh **FULL rewrite** clean-slate — **engine superseded by C-139** (static SVG/HTML). Product intent (dual-lane, inspector, RBAC) retained |
| **C-138** | **DELETE** `MultiButton` / `MeshPipelineSwitcher` со всех страниц «Команда выпуска». Top bar = title + subtitle + «Скопировать ТЗ для Cursor» only |
| **C-139** | **STATIC** flowchart (HTML/CSS/SVG per `code_artifact.html`): gap-28/32, dual lane, short solid labels, dashed Trainer→release **без** mid-text; **DELETE** xyflow `ReleaseTeamFlowchart` / `FlowEdge` / `FlowAgentNode`; User accordion in-place NO drawer; Designer `design.md` chip; drawer 3 tabs (Инструкция prompt-only / Skills·Plugins·MCP / Model LLM+temp+maxTokens **no timeout**) |

Path lock (NO overlapping parallel on same files):

1. **Shell one path:** **C-133 → C-130 → C-136** (`SidebarNavigation` / AppShell / module top nav) — sequential only
2. **Feed cards:** **C-132** then **C-131** (+ Motion) — `FeedPostCard` / carousel preview
3. **Razbor modal:** **C-134 → C-135** — one Razbor path
4. **Mesh rewrite last:** **C-137** **after** C-136 — then **C-138 → C-139** on **same** release-team path (no parallel FE); **delete** MultiButton + xyflow in one Frontend pass; Motion = dashed animation / accordion only

### Static Release Team wave — C-138…C-139 (`ticket_limit: full-queue`)

Skills: `xyflow-agent-mesh` (**C-138/C-139**), `content-factory-ui`, `web-motion-engine` (dashflow + accordion), `client-scenarios` **S37** (static+tabs). Тренер: `memory/trainer/2026-10-10-static-release-team-grade.md`. Эталон: user `code_artifact.html`.

| Order | Lock |
|-------|------|
| 1 | **C-138** remove MultiButton/MeshPipelineSwitcher + top bar chrome |
| 2 | **C-139** static diagram + User accordion + Designer chip + 3-tab drawer; delete xyflow v2 paths |

Proposed execution chain (full-queue): **Frontend → Motion → Tester → Client** (Architect: `chain.md` from this lock before code; Fixer/Deployer as needed). **Не** резать на пачки по 3. **Не** оставлять ReactFlow «на всякий случай».

### Team + Settings + Perf wave — **C-140…C-145** (`ticket_limit: full-queue`)

Skills: `xyflow-agent-mesh` (C-140…C-143 + Scout-on-Team), `content-factory-ui` (C-143/C-144/C-145), `web-perf-motion` (C-144), `backend` (Polza audit note), `client-scenarios` **S37+S39**. Тренер: `memory/trainer/2026-10-10-team-settings-perf-grade.md`.

| ID | Spec lock |
|----|-----------|
| **C-140** | User brief = **editable combat prompt** per `moduleId` (not mock); payload → AI **with chat topic** |
| **C-141** | Static diagram **pan**: LMB drag + finger drag (click vs drag threshold) |
| **C-142** | SVG/DOM arrow **ports** attach at vertical **CENTER** of cards (not top) |
| **C-143** | **DELETE** «Скопировать ТЗ для Cursor» / «Загрузить ТЗ»; top bar = title + subtitle **only** |
| **C-144** | Studio **modules slow load**: measure root cause (devtools) → fix; guards with ms |
| **C-145** | Settings: design.md **preview panel** right (open/close/drag/resize); **REMOVE** Settings blocks «Разведка» / «Агенты» / «Rules» / «LLM»; Scout params + agent/LLM config live on **Team**; **Architect audit** Polza AI aggregator wired into content generation |

Path lock (NO overlapping parallel on same files):

1. **Team/mesh one path:** **C-143 → C-140 → C-142 → C-141** (top bar delete → User brief → ports geometry → pan) — sequential Frontend on release-team shell
2. **Settings one path:** **C-145** after Team Scout settings exist (or same Frontend pass if no overlap with mesh files — Architect chooses; **не** parallel two writers on `SettingsShell` + mesh inspector if shared persist helpers)
3. **Perf path:** **C-144** — measure first; Frontend (+ Backend if API) **не** parallel с тяжёлым mesh rewrite тех же `app/studio/**` layout files — sequential after or before Team per `chain.md` (prefer: measure early, fix after Team UI stable **or** isolate chunk-split only)

**Polza AI audit (C-145 note — Architect, not Trainer):**

- Env уже: `AGGREGATOR_BASE_URL` (polza.ai) + key pattern в `.env.example` / `docs/ENV_AGGREGATOR.md` / `scripts/smoke-polza-connection.ts`.
- Проверить: пути **генерации контента** (carousel/reels/Razbor/Create drafts) реально вызывают `lib/llm/aggregator` / chat completions Polza — или ещё mock / другой client.
- Вердикт аудита в `architect-spec` C-145: **connected** / **partial** / **not wired** + gap list. Не закрывать «на словах» без file path evidence.

Proposed execution chain (full-queue): **Frontend → Motion (pan/ports if needed) → Backend (Polza audit + wire if gap) → Tester → Fixer → Deployer → Client**. **Не** резать C-140…C-145 на пачки по 3.

### Live agent chat + PromptBox wave — **C-155…C-158**

Skills: `ai-bridge` + `content-pipeline-agents` (C-155 message shape), `backend` (Polza proxy), `content-factory-ui` + `21st-ui-catalog` (PromptBox), `web-motion-engine` (9-cube), `client-scenarios` **S40**. Тренер: `memory/trainer/W-2026-10-12-live-agent-chat-grade.md`.

| ID | Spec lock |
|----|-----------|
| **C-155** | Live Polza chat Scriptwriter/Designer/Publisher: `user` = raw only; `system` = mesh `systemPrompt` only; **no** brief append in user role |
| **C-156** | Carousel drafts: **zustand `persist`** (survive refresh) |
| **C-157** | Replace `AgentChatComposer` canon → 21st **chatgpt-prompt-input** `PromptBox` (Dark Luxury retokenize) |
| **C-158** | Thinking status: **9-cube assemble** + shimmer **«Thinking...»** until first token |

Path lock: **Backend + AI Bridge (C-155)** before Frontend composer wire; **C-157 + C-158** same FE surface (sequential, not two writers); **C-156** FE store (no overlap with chat proxy files).

Proposed chain: **Architect → Backend → AI Bridge → Frontend → Tester → Client Playwright**.

### Create carousel handoff wave — **C-carousel-*** (`ticket_limit: default≤3`)

Skills: `carousel-studio-handoff` (primary), `content-factory-ui`, `content-pipeline-agents`, `ai-bridge`, `21st-ui-catalog`, `backend`, `client-scenarios` **S41**. Тренер: `memory/trainer/W-2026-10-12-carousel-studio-handoff-grade.md`.

| ID (pack ≤3) | Covers | Spec lock |
|--------------|--------|-----------|
| **C-carousel-chrome** | 1.1–1.3 | Create: remove bottom «передать» + tools; top **Button-variant segment**; `button.tsx` + radix-slot + cva; Vernatun tokens only |
| **C-carousel-agents** | 1.4, 1.5, 1.8 | Top-right handoff; agent-start bundle (rules/skills/plugins/MCP); no-mock; Designer describe→draw; markdown; Scriptwriter **no** auto-handoff |
| **C-carousel-publish** | 1.6–1.7 | Remove Publisher agent from Create; step **Публикация**; **Опубликовать** → drafts + `/schedule` |

Path lock: **один** path на `CreateCarouselModal` — sequential chrome → agents → publish (не parallel FE writers). AI Bridge + Backend agent-start/draw **до** FE wire live. Pattern later → other modules (не в этой пачке без TZ).

Proposed chain: **Architect → AI Bridge → Backend → Frontend → Tester → Fixer → Deployer → Client Playwright (S41)**.

### S49 — Feed chrome + Boards + Team brief delete + Design brandbook (`ticket_limit: default≤3`)

Skills: `content-factory-ui`, `xyflow-agent-mesh`, `content-pipeline-agents`, `ai-bridge`, `client-scenarios` **S49**, `workers/designer-carousel` (deconstruct→brandbook). Тренер: `memory/trainer/2026-10-14-s49-feed-brandbook-grade.md`. **НЕ prod.**

| ID (pack ≤3) | Covers | Spec lock |
|--------------|--------|-----------|
| **C-feed-s49-chrome** | 1–3, 5 | Competitors plaque `{name} \| {followers}` inside; Ours **no** plaque; Published/Drafts **simple toggle** left + search same row; labels/count **white**; feed bottom clip **minimal gap** |
| **C-boards-s49-upload** | 4 | Upload label **«Загрузить»** same row as search; delete «Локально · несколько кадров…»; board cards **no metrics** |
| **C-team-brief-gone-design-brandbook** | 6–7 | **DELETE** User basic brief UI+wire (never → agents as task); Settings Design = **visual brandbook cards** + upload reel/image → deconstruct to brandbook for Designer |

Path lock: feed/Boards FE sequential; Team brief delete (mesh + AI Bridge payload) before Client S49.C; Design brandbook may share Deconstructor path with AI Bridge — Architect locks order in `chain.md`.

Proposed chain: **Trainer ✅ → Architect → Frontend → AI Bridge → Backend (followers map / persist ignore brief) → Tester → Fixer → Deployer (localhost) → Client Playwright S49**.

### S50 — Client pickiness + Design 3:5 + feed chrome + Create/live prompts (`ticket_limit: default≤3`)

Skills: `content-factory-ui`, `carousel-studio-handoff`, `ai-bridge` (+ `s50-prompt-hardening.md`), `client-scenarios` **S50**, `content-pipeline-agents`, Backend live feed. Тренер: `memory/trainer/2026-10-14-s50-client-ui-live-grade.md`. **НЕ prod.** Client Hard REJECT #16 = gate.

| ID (pack ≤3) | Covers | Spec lock |
|--------------|--------|-----------|
| **C-s50-feed-chrome** | bottom bar · title · dots · Boards dropdown · sort/filter · live competitors UI | Minimal bottom (no clip); no «(4:5)»; no orange dots; Boards dropdown+create/rename; no «1» on Доски; sort+filter left of search **both** columns; live cards not mock |
| **C-s50-settings-design** | Design brandbook UI | Horizontal **3:5** cards only; no MD crumbs; no slots counter; toolbar **one row** (дизайн.md icon / референс / новый дизайн+icon / preview icon-only); side padding **~75%** smaller; **no** card context menu; **no** colors helper paragraph |
| **C-s50-create-prompts** | Create parity + pipelines | Create UI = Razbor except start **Scriptwriter**; source toggle higher; preview **≈1.5×**; harden Scriptwriter/Designer/Razbor prompts; smoke live generation |

Path lock: feed chrome FE before Client S50.A; Design FE before S50.B; Create+AI Bridge prompts before S50.C–D. Live competitors may need Backend if mock path still returned — Architect notes in `chain.md`.

Proposed chain: **Trainer ✅ → Architect → Frontend → AI Bridge → Backend (live feed if needed) → Tester → Fixer → Deployer (localhost) → Client Playwright S50 HARD**.

### S51 — Design top-right + Boards segment + Apify cost (`ticket_limit: default≤3`)

Skills: `content-factory-ui`, `backend` (+ `apify-scraper-cost-discipline.md`), `ai-bridge` cost bar, `client-scenarios` **S51**, Client Hard REJECT **#17**. Тренер: `memory/trainer/2026-10-14-s51-design-boards-apify-grade.md`. **НЕ prod.**

| ID (pack ≤3) | Covers | Spec lock |
|--------------|--------|-----------|
| **C-s51-settings-design** | Design toolbar / cards | All buttons **top-right**; **remove** preview DESIGN.md; eye **«код дизайн мд»**; shrink card empty bottom; active **blue neon** perimeter; **no** context/edit popup on click |
| **C-s51-boards-chrome** | Boards segment UX | Dropdown **from «Доски»** segment (no extra buttons); dblclick rename; selected name replaces «Доски»; Upload **icon-only** always right of filter (gray disabled in Competitors); **no UI jump** |
| **C-s51-apify-cost** | Scraper volume / $ | Audit call volume; strengthen TTL cache + in-flight dedup; no bootstrap spam; estimate monthly for 10 top carousels + reels/day; AI Bridge never calls Apify |

Path lock: Design FE before S51.A; Boards FE before S51.B; Apify Backend (+ AI Bridge no-call assert) before cost ticket close. **Не** параллелить Design Settings path с Boards feed chrome overlapping files without Architect order.

Proposed chain: **Trainer ✅ → Architect → Frontend (Design + Boards) → Backend (Apify cost/cache) → AI Bridge (no-scraper bar) → Tester → Fixer → Deployer (localhost) → Client Playwright S51 HARD**.

### S52 Scout↔Apify bind (`ticket_limit: default≤3`) — **supersedes scrape-on-feed-GET**

Skills: `backend` + `apify-scraper-cost-discipline.md`, `xyflow-agent-mesh` Scout panel, `content-factory-ui` competitors snapshot, `ai-bridge` Scout-only bar, `client-scenarios` **S52.D**, Client Hard REJECT **#18 S52.D**. Тренер: `memory/trainer/2026-10-16-scout-apify-only-grade.md`. **НЕ prod.** `shell_freeze: true` (AppShell/nav).

| ID (pack ≤3) | Covers | Spec lock |
|--------------|--------|-----------|
| **C-scout-apify-bind** | Backend Scout run + snapshot | Apify **only** Scout manual/schedule; `GET` feed = last snapshot (**0** Apify); filters + schedule wire; counters/guards |
| **C-scout-razvedat-ui** | Team Scout panel | Bottom **«Разведать»**; auto-scout filters (virality/likes/views/…) + frequency schedule; mesh Scout defaults |
| **C-competitors-snapshot** | Studio Competitors FE | Open/focus/remount = snapshot only; no scrape trigger; soft-fail empty snapshot |

Path lock: Backend Scout entrypoint + snapshot **before** FE feed bind; Scout UI CTA before Client S52.D; AI Bridge no-scraper assert with Backend. **Не** parallel overlapping feed + mesh writers without Architect order.

Proposed chain: **Trainer ✅ → Architect (spec+chain) → Backend → Frontend (Team Scout + Competitors) → AI Bridge → Tester → Fixer → Deployer (localhost) → Client Playwright S52.D**.

### Research / DEV_PLAN sync wave (`ticket_limit: default≤3`)

Когда пользователь просит **исправить `DEV_PLAN.md` чекбоксами** после изучения живого приложения (или «сверить plan vs product»):

| Lock | Правило |
|------|---------|
| **Deliverable** | Только `DEV_PLAN.md` (+ опционально `architect-spec.md` / `chain.md` / `memory/waves/…`) — **не** prod UI |
| **Evidence** | Live localhost + Playwright MCP @1440 **или** честный file/route audit; статусы `[x]` / `[ ]` / partial note по факту, не по памяти волны |
| **UI shell freeze (HARD)** | **Запрет** менять существующий client chrome: `AppShell`, `SidebarNavigation` / `MenuVertical`, left nav IA (Студия · Расписание · Настройки · Директор), module top-nav chrome, brand emblem slot. Spec **явно** пишет `shell_freeze: true` |
| **Out of scope** | «Пока правим plan — заодно поправим сайдбар / IA / loading shell» — **нет**. Новый UI только отдельным `C-*` после приёмки plan-sync |
| **Pipeline truth** | Сверять агентов/шаги с `content-pipeline-agents` + живые маршруты (`/studio`, Create/Razbor, Team, Settings) — без правок shell |

Proposed chain: **Trainer ✅ → Architect (research + DEV_PLAN checkboxes) → [Coder only if markdown helpers] → Tester (diff = docs only; no shell file churn) → Deployer N/A → Client optional review of plan accuracy**. Frontend/Motion **не** в chain, пока нет отдельного UI-тикета.

### Sprint 8 — Postgres SoT (`ticket_limit: full-queue` when user says full sprint / in order)

`DEV_PLAN` **8.1 → 8.7** sequential. **shell_freeze: true**. **No social publish.**

| Lock | Правило |
|------|---------|
| **Order** | 8.1 models+migration → 8.2 Drafts API → 8.3 Boards+storage → 8.4 ScheduleSlot ↔ job → 8.5 DesignSlot ≤10 → 8.6 one-shot import → 8.7 guards |
| **Roles** | Backend primary; **Frontend-minimal** only for persist→API + import (no redesign); Tester 8.7; Motion/AI Bridge **out** unless Architect finds blocker |
| **SoT** | Postgres; zustand/localStorage = cache / migration source only |
| **HITL** | Approve → draft/scheduled queue **only** |
| **Skills** | `prisma-content-schema` § Sprint 8 · `safe-db-migrations` · `backend` § Sprint 8 · `content-factory-ui` § Frontend-minimal · `tester` § 8.7 |

Proposed chain: **Trainer ✅ → Architect (spec+chain 8.1–8.7, shell_freeze) → Backend (8.1→8.5) → Frontend-minimal (8.6 + API wire) → Tester (8.7) → Fixer → Deployer (localhost) → Client (refresh/isolation smoke; not UI redesign accept)**.

### Sprint 9 — Carousel + Reels IG/YT quality (`ticket_limit: default≤3` unless user says full sprint)

`DEV_PLAN` **9.1 → 9.11**. **shell_freeze: true**. **upgrade_only: true**. **no_pipeline_break: true**. **No social publish.**

| Lock | Правило |
|------|---------|
| **Primary** | **AI Bridge** — prompts, contracts, golden, critic, agent-defaults |
| **Secondary** | Backend = fixtures + STRICT JSON validation only; Tester = smoke 9.9 + scorecard 9.10 + S44–S46 guards |
| **UPGRADE ONLY** | Spec forbids rewrite of Razbor/Create/mesh flow; patch in place |
| **NO PIPELINE BREAK** | Keep **Razbor → Scriptwriter → Designer → Draft** (+ reels Scriptwriter → existing render). Spec must list preserved handoffs |
| **Modules** | `carousel-engine` + `custom-reels` only; else → Sprint 23 |
| **UI** | Frontend **out** of chain unless Architect finds unblockable debug chrome (Frontend-minimal, no redesign) |
| **Skills** | `prompt-engineering` § Sprint 9 · `carousel-json-contract` · `reels-scriptwriter` · `content-pipeline-agents` § Sprint 9 · `ai-bridge` · `s50-prompt-hardening` |

Proposed chain: **Trainer ✅ → Architect (scope + thresholds + chain 9.1–9.11, shell_freeze, upgrade_only) → AI Bridge (primary 9.1–9.8) → Backend (fixtures / zod STRICT 9.2+9.7) → Tester (9.9 smoke + 9.10 scorecard + S44–S46) → Fixer → Deployer (localhost) → Client (quality + smoke @1440, no publish)**.

### Correct-doc carousel pipeline — Phase6 (`answers locked` · grade B)

Skills: `carousel-json-contract` Phase 6 · `plugins/trainer/carousel-correct-pipeline.md` · UI Brand/**Персонажи** · mesh Logs/RED · Backend sheet. Тренер: `memory/trainer/2026-10-17-carousel-correct-answers-grade.md`.

| Lock | Value |
|------|-------|
| **code_before_10_answers** | **unlocked** — 10/10 answers received |
| **docs gate** | `01`–`06` still empty → Orchestrator Clarification / draft before prompt paste; Sheet URL SoT for columns |
| **plan_then_act** | в chain.md на каждом шаге — роль агента |
| **shell_freeze** | AppShell freeze; **in scope UI:** Settings Brand after Design, **Персонажи**, Logs tab, RED perimeter |
| **full_replace** | STRICT correct/ supersedes old Designer invent + S54 bake-off Client rules (**S55**) |
| **sheet⊕Create** | sheet supplements Create; schedule→drafts; Publicist auto\|manual |
| **critic / vision** | critic **+** zod; vision → **OFF under S57** (was ≤2) |
| **preflight** | **confirm Sheet visible** before localhost fill tests |
| **KEEP** | CTA 1–4 · `swipe_trigger` meta · sheet⊕Create · Brand/Персонажи/Logs/Publicist |
| **paint** | **SUPERSEDED by Phase 7 / S57** layered HTML — not type-on-PNG |

Proposed chain (chrome-only remnants): Frontend Brand/Персонажи if still open; paint → Phase 7 chain below.

### Phase 7 LAYERED HTML (S57 · product · answers locked)

Skills: `carousel-json-contract` Phase 7 · `plugins/trainer/carousel-layered-html-pipeline.md` · Client **S57**. Тренер: `memory/trainer/2026-10-17-layered-html-pipeline-grade.md`.

| Lock | Value |
|------|-------|
| **single_render** | image bg + HTML/CSS **Puppeteer** @ **1080×1350** — no parallel `correct_pipeline` paint |
| **bg_ban** | FORCE no letters/logos via **prompt AND code**; logo = Brand HTML only |
| **CTA / swipe** | CTA 1–4 = HTML button; swipe = meta only |
| **auto_7** | slides=7 for «N ways»; Scriptwriter may bump |
| **fonts** | 3 from DESIGN.md; download if missing (Frontend optional) |
| **vision** | **OFF** |
| **characters** | Персонажи cut-out **OVER** bg; split rare optional |
| **etalon** | `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/` (#3 best) |
| **smoke** | DELETE `smoke-useful-51-1-17/` → **ONE** 4-slide |
| **shell_freeze** | AppShell freeze; draw/composite in scope |
| **ticket_limit** | default≤3 |

Proposed chain: **Trainer ✅ → Architect → AI Bridge → Backend (+Frontend fonts if needed) → Tester → Deployer → Client (S57)**.

### Wave 2026-10-18-design-inject — FULL DESIGN + logo BR + variety (`ticket_limit: full-queue`)

Skills: `create-carousel-prompts-notes` § FULL DESIGN · `html-layout-variant-a` · `plugins/trainer/design-inject-logo-br.md` · `carousel-json-contract` Phase 7 updates. Тренер: `memory/trainer/2026-10-18-design-inject-logo-br-grade.md`.

| Lock | Value |
|------|-------|
| **full_design_inject** | Designer gets **complete** DESIGN.md: fonts + sizes + **colors per role**; positive scale table; colors → HTML + bg mood |
| **motifs** | Armenian checklist **optional** — no forced khachkar/apricot every post |
| **logo_chrome** | Enlarged icon; **bottom-RIGHT**; transparent; name **beside** (right of icon) |
| **slide_number** | Own HTML slot; **body** tokens; pretty `N / M` |
| **secondary_copy** | Scriptwriter **2–3×** richer |
| **font_fit** | Reduce-only from DESIGN scale; never enlarge; document delta |
| **deconstruct_verify** | Settings upload liked → deconstruct → DESIGN.md colors/fonts/sizes → FULL inject — **Architect names path in chain.md** + Tester guard |
| **layout_variety** | Adjacent slides vary anchor — not always top-left |
| **smoke** | **ONE × 6** + pretty numbering |
| **shell_freeze** | AppShell freeze; Frontend **only if** Brand/deconstruct UI broken |
| **ticket_limit** | **full-queue** (user lock list 1–9) |

Proposed chain: **Trainer ✅ → Architect → AI Bridge → Backend → Tester → smoke** (+ Frontend only if Brand/deconstruct UI broken).

### Wave 2026-10-18-layout-copy — layoutMap + dual character (`ticket_limit: full-queue`)

Skills: `create-carousel-prompts-notes` § LAYOUT MAP / MUCH WIDER / DUAL CHAR · `plugins/trainer/layout-copy-dual-char.md` · `workers/designer-carousel` grid deconstruct · `html-layout-variant-a` layoutMap. Тренер: `memory/trainer/2026-10-18-layout-copy-dual-char-grade.md`.

| Lock | Value |
|------|-------|
| **secondary_copy_wide** | Body **≥220 chars AND ≥5 clauses** — not 3 short sentences |
| **grid_deconstruct** | Upload **4** refs (cover·2 mid·CTA) → colors+fonts+sizes **+ layoutMap** |
| **layout_grammar** | Gen copies anchors / numbering presence / logo·CTA chrome; invent content+bg+CTA only |
| **numbering_mirror** | No numbers on ref → `numberingGlobal: absent` → omit slide-num HTML |
| **three_design_md** | RE orange · luma coffee · omkopa teal from uploaded grids |
| **primary_carousel** | Orange RE + Vernatun girl **overlay_cutout** conductor; cover+last mandatory; speaks text |
| **dual_smoke** | **A** `in_image` ×6 · **B** `overlay_cutout` ×6 — other useful-sheet topics |
| **etalon** | `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/` |
| **shell_freeze** | AppShell freeze; Frontend only if 4-up upload UI missing |
| **ticket_limit** | **full-queue** |

Proposed chain: **Trainer ✅ → Architect → AI Bridge → Backend → Tester → dual smoke** (+ Frontend only if 4-slide upload broken).

### Wave 2026-10-18-vision-style-copy — vision_ref style copy (`ticket_limit: full-queue`)

Skills: `plugins/trainer/vision-style-copy.md` · `create-carousel-prompts-notes` § VISION STYLE-COPY · `html-layout-variant-a` styleCopyMode · `workers/designer-carousel` Vision style-copy · `ai-bridge` · `carousel-json-contract`. Тренер: `memory/trainer/2026-10-18-vision-style-copy-grade.md`.

| Lock | Value |
|------|-------|
| **styleCopyMode** | `vision_ref` — etalon PNG as **image reference** on Designer/draw |
| **ban_full_token_inject** | No FULL DESIGN TOKEN CARD / stock Manrope·Cormorant / typography.scale on this path |
| **brand_vernatun** | Our text + CTA 1–4 (+ optional logo) separately |
| **characterPaint** | Product default **`in_image` only**; `overlay_cutout` legacy, not default |
| **partial_bg** | Honor inset/partial photo geometry from etalon — not always full-bleed cover |
| **layoutMap** | Optional legacy — **not** sole PASS path (do not «only fix parser») |
| **variant_a** | KEEP layered HTML + `html_layout` |
| **refs / smoke** | `layout-copy-refs-2026-10-18/` · smoke A keep `layout-copy-dual-char-smoke-A-in-image/` ×6 |
| **shell_freeze** | AppShell freeze; Settings FE only if mode/ref UI missing |
| **ticket_limit** | **full-queue** |

Proposed chain: **Trainer ✅ → Architect → AI Bridge → Backend → (Settings FE if needed) → Tester → smoke 6-slide A**.

### Wave 2026-10-18-phase2-vision-prompt — IMAGE scrub + logoTextColor (`ticket_limit: full-queue`)

Skills: `plugins/trainer/phase2-vision-prompt-logo.md` · notes § PHASE 2 · `ai-bridge` · `carousel-json-contract` Logo HARD. Тренер: `memory/trainer/2026-10-18-phase2-vision-prompt-grade.md`.

| Lock | Value |
|------|-------|
| **image_prompt_scrub** | Line-audit `buildVisionRefBackgroundImagePrompt` + sanitize; etalon copy = SoT |
| **review_before_implement** | Clean IMAGE prompt dump for user review **before** code land |
| **ban_stock_fonts** | KEEP 0 Manrope / Cormorant / typography.scale / FULL TOKEN on vision_ref Designer |
| **logoTextColor** | `html_layout.logo.textColor` required when brand chrome; composite applies |
| **logo_quality** | Spec chooses **A** emblem+HTML wordmark **or** **B** crisp wordmark img |
| **phase3** | Pixar character **OUT** (hygiene soften 3D-animated wording only) |
| **ticket_limit** | **full-queue** → Client «согласовано» |

Proposed chain: **Trainer ✅ → Architect → AI Bridge → Backend → Tester → smoke → Client**.

### Wave 2026-10-18-pipeline-practice-higven-3 — HIGVEN etalon ×3 (`ticket_limit: full-queue`)

Skills: `plugins/trainer/pipeline-practice-higven-3.md` · `html-layout-variant-a` § HIGVEN-3 · `create-carousel-prompts-notes` § HIGVEN-3 · `ai-bridge` · `art-director` (no remake). Тренер: `memory/trainer/2026-10-18-pipeline-practice-higven-3-grade.md`. Canon: `memory/waves/2026-10-18-pipeline-practice-higven-3/plan.md`.

| Lock | Value |
|------|-------|
| **etalon** | Activate **01 HIGVEN**; clear other etalon presets; **02** inactive library OK |
| **N** | Strict **3** (cover · body · cta) |
| **SW** | **Haiku** → HITL **«Передать дизайнеру»** |
| **Designer parallel** | ONE GPT reply: `image_prompt`×3 + `html_layout`×3; then image ‖ renderer; **no** second call for logo color |
| **logo** | Full Vernatun PNG Brand DEFAULT → HTML `<img>` only |
| **characterPaint** | **`none`** |
| **Art Director** | remarks \| approve — **NO auto-remake** |
| **smoke** | `pipeline-practice-higven-3/` · ≤**3** carousel attempts |
| **shell_freeze** | AppShell freeze; FE only if HITL/Brand UI missing |
| **ticket_limit** | **full-queue** |

Proposed chain: **Trainer ✅ → Architect → AI Bridge → Backend (seed+smoke) → Tester → Fixer if needed (≤3) → Deployer → Client**.

### Useful-only smoke 51 / 1 / 17 (**LEGACY** · superseded by S57 smoke rewrite)

Skills: `plugins/trainer/useful-smoke-51-1-17.md` (legacy). **S57:** DELETE folder + ONE 4-slide layered set — do not regenerate 12-PNG multi-row smoke.

Proposed chain: **Trainer ✅ → Architect → Frontend (rename+width) → AI Bridge/Backend (gen+traces) → Tester → Deployer → Client (S55+S56)**.

### Carousel bake-off — Phase5 `anchor_ref` (`ticket_limit: default≤3`)

Skills: `carousel-json-contract` Phase5 · `create-carousel-prompts-notes` ANCHOR REF · `plugins/trainer/carousel-anchor-ref-bakeoff.md` · Client **S54**. Тренер: `memory/trainer/2026-10-17-anchor-ref-bakeoff-grade.md`.

| Lock | Value |
|------|-------|
| **shell_freeze** | AppShell / Create chrome — Frontend **out** |
| **draw_path** | in scope (AI Bridge + Backend) |
| **Labels** | `etalon` · `e2e_diffusion` · `anchor_ref_pipeline` · optional `html_overlay` |
| **Paths** | `generatedMedia/compare-carousel-bakeoff/{label}/{theme}/slide_0N.png` |
| **Budget** | **9 PNG** new; Armenian LANGUAGE themes |
| **Client** | Side-by-side → which label closest to etalon |

Proposed chain: **Trainer ✅ → Architect → AI Bridge → Backend → Tester → Fixer → Deployer → Client (S54)**.

## Выход

`🏗️ **АРХИТЕКТОР:** [план + границы + путь к chain.md]`
