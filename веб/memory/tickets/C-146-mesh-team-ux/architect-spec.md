# Architect spec — C-146…C-153 (Mesh Team UX)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product UI implementation code from Architect.**  
> Wave: `W-2026-10-11-mesh-team-ux`. Trainer grade: `memory/trainer/W-2026-10-11-mesh-team-ux-grade.md`.  
> **ticket_limit: full-queue** (user listed all items C-146…C-153).

## Goal

Довести «Команда выпуска» до чистого UX: без reset/hints, title с именем модуля, file upload skills/plugins, сильный MCP binding, Scout без MultiButton типов, уникальные роли/промпты по модулям (особенно `custom-reels`), и понятный RU-док куда вставлять ключи ENV.

## Ticket map

| ID | P | Surface | One-line lock |
|----|---|---------|---------------|
| **C-146** | P0 | User card (`ReleaseTeamFlowchart.tsx`) | **DELETE** «Сбросить к шаблону модуля» + весь блок `user-brief-hints` / hints toggle |
| **C-147** | P0 | `CanvasTopBar` + page `sr-only` h1 | Title = ``Команда выпуска: ${MESH_PIPELINE_LABELS[pipelineId]}``; `pipelineId` prop from page/store |
| **C-148** | P0 | `AgentInspectorDrawer` Skills·Plugins | File upload skills (`.md`) + plugins (`.md`/`.json`/`.zip` or folder name); persist names/paths in agent arrays; optional `POST /api/settings/agent-packs/upload` **or** local FileReader + metadata; Trainer suggests from `plugins/<role>/PLUGINS.md` |
| **C-149** | P1 | Inspector MCP section | Binding object: website URL + optional tools list + description (not chip string only) |
| **C-150** | P0 | `ScoutInspectorSettings` | **REMOVE** MultiButton content-types; Scout = current pipeline only |
| **C-151** | P0 | `PIPELINE_COPY` + seed `custom-reels` | `copywriterName=Сценарист`, `designerName=Монтажёр рилсов`; montage prompt = raw video cut/join/subs/inserts/effects/gen inserts; role ≠ «Дизайн / сборка» |
| **C-152** | P1 | All `MESH_PIPELINE_IDS` | Audit `PIPELINE_COPY` + seeds — unique names/prompts/skills; table below is contract |
| **C-153** | P1 | Docs (+ soft wire note) | `docs/ENV_FIRST_CAROUSEL.md` — plain Russian: where to paste `AGGREGATOR_API_KEY` + `IG_SCRAPER_*` (+ carousel key if used); **no secrets in git** |

## Decision locks

### C-146 — Reset + hints DELETE

| Lock | Decision |
|------|----------|
| **D146.1** | Remove button `data-testid="user-brief-reset"` and label «Сбросить к шаблону модуля» from User card in `components/mesh/v2/ReleaseTeamFlowchart.tsx`. |
| **D146.2** | Remove hints UI: `data-testid="user-brief-hints"`, `user-brief-hints-toggle`, `hintsExpanded` state, `templateHint` preview under brief, and helper copy about «Подсказка шаблона…». |
| **D146.3** | Keep editable combat textarea (`user-brief-textarea`) + persist (C-140). Empty brief → placeholder / empty-state only — **not** jazz-hint blurbs. |
| **D146.4** | `defaultCombatBrief` / `COMBAT_USER_BRIEFS` remain as **seed defaults on first visit / missing key** only — not as a visible «reset» control. |

### C-147 — Title with ModuleName

| Lock | Decision |
|------|----------|
| **D147.1** | Visible title (`data-testid="mesh-screen-title"`): ``Команда выпуска: ${MESH_PIPELINE_LABELS[pipelineId]}`` (exact RU label from `lib/mesh-roles.ts`). |
| **D147.2** | `CanvasTopBar` **must** accept `pipelineId: MeshPipelineId` (or resolved label string). Parent `ReleaseTeamFlowchart` already knows `pipelineId` — pass it down. |
| **D147.3** | Page `app/studio/[moduleId]/mesh/page.tsx` `sr-only` h1 must match the same string (a11y / SEO), not bare «Команда выпуска». |
| **D147.4** | Subtitle stays one RU line (pipeline description). Top bar remains **title + subtitle only** (C-143). No MultiButton / Copy TZ. |

### C-148 — Skills / Plugins file upload

| Lock | Decision |
|------|----------|
| **D148.1** | Tab «Скиллы & Инструменты»: Skills accept **`.md`**; Plugins accept **`.md` / `.json` / `.zip`**, or user attaches a **folder name** (string metadata) when zip unavailable. |
| **D148.2** | Persist on agent: arrays of **names/paths** (not file body secrets). Prefer typed refs: `{ id, filename, path?, source: "upload" \| "catalog" \| "trainer" }`. Migration: existing `skills: string[]` / `plugins: string[]` may keep string filename entries for backward compat; UI always shows filename. |
| **D148.3** | Storage path (Frontend chooses one; Backend if server): **(A)** optional `POST /api/settings/agent-packs/upload` → server stores under app data / temp pack dir, returns `{ filename, path }`; **(B)** local `FileReader` + attach metadata only (name/size/type) into zustand/localStorage — OK for localhost MVP if API not ready. Spec allows either; Tester guards filename visible after attach. |
| **D148.4** | **Trainer (pipeline agent)** on Skills·Plugins: action «Найти / добавить плагин» — suggest from repo `plugins/<role>/PLUGINS.md` (+ optional stub catalog). Proposal → HITL «Согласовано» before apply to agent.plugins. Not Cursor-Trainer. |
| **D148.5** | Never echo API keys / file contents into tickets, logs, or memory. |

### C-149 — MCP stronger fields

| Lock | Decision |
|------|----------|
| **D149.1** | Replace chip-only `mcp: string[]` UX with editable cards (typed `AgentMcpBinding` below). |
| **D149.2** | Update `types/mesh-agent.ts`: `mcp: AgentMcpBinding[]`. Seed migration: map legacy `mcp://…` strings → binding with `name` + `website` placeholder (or docs URL) + `enabled: true`. |
| **D149.3** | UI minimum: website URL, optional tools list, description; name + enabled toggle. Forbidden: secrets in fields; MCP = bare chip string as sole representation. |

```ts
type AgentMcpBinding = {
  id: string;
  name: string;
  website: string;           // required in UI
  description?: string;      // human what it does
  tools?: string[];          // optional tools list
  transport?: "stdio" | "sse" | "http";
  commandOrUrl?: string;     // no secrets
  authEnvKeys?: string[];    // NAMES only
  enabled: boolean;
};
```

### C-150 — Scout: no content-type MultiButton

| Lock | Decision |
|------|----------|
| **D150.1** | In `ScoutInspectorSettings.tsx`: **DELETE** `MultiButton` / `scout-inspector-content-types` / `SCOUT_CONTENT_TYPE_OPTIONS` type switcher. |
| **D150.2** | Scout settings bind **only** to current `pipelineId` / module window. Changing content type = navigate to another module’s «Команда выпуска». |
| **D150.3** | Keep niche / platforms / frequency / top-N / toggles for **this** pipeline. |

### C-151 — custom-reels Сценарист / Монтажёр

| Lock | Decision |
|------|----------|
| **D151.1** | In `PIPELINE_COPY["custom-reels"]`: `copywriterName = "Сценарист"`; `designerName = "Монтажёр рилсов"`. |
| **D151.2** | `copywriterPrompt` = reels script (hook/roles/plot/timing/subs brief) — not carousel slide copy. |
| **D151.3** | `designerPrompt` **must** mention raw video montage: cut, join, subs, inserts, effects, gen inserts; inputs = raw clips (+ script). |
| **D151.4** | In `seedAgentsForPipeline` for `custom-reels`: designer `role` **must not** be «Дизайн / сборка» — use e.g. «Монтаж сырого видео» / «Монтажёр · Рилс». |
| **D151.5** | Card chip: **no** carousel `design.md` as primary chip on custom-reels (optional montage/timeline chip OK). |
| **D151.6** | Handoff contract (AI Bridge): Сценарист → `promptForMontage` + script fields; Монтажёр consumes raw videos — see `content-pipeline-agents` C-151 JSON. |

### C-152 — PIPELINE_COPY audit matrix (contract)

Frontend + AI Bridge **must** keep names/prompts/skills unique per module. Shared scaffold (Scout/Analyst/Trainer/Publisher) OK; **release pair** copywriter/designer must not be copy-paste of carousel onto video modules.

| `pipelineId` | ModuleName (`MESH_PIPELINE_LABELS`) | Copywriter / Script UI | Designer / Editor UI | Prompt / skills uniqueness rule |
|--------------|-------------------------------------|------------------------|----------------------|---------------------------------|
| `carousel-engine` | Карусели Instagram (4:5) | Копирайтер каруселей | Дизайнер карусели | Slides 4:5 + `design.md`; Razbor in lane A |
| `aesthetic-graphics` | Полезные картинки & Инфографика | Копирайтер графики | Дизайнер графики | Single useful graphic / infographic — not carousel pack |
| `cartoon-reels` | Мульт-Reels (2D сторителлинг) | Копирайтер мульт-рилсов | Дизайнер 2D | 2D beats / scenes — not live montage |
| `heygen-reels` | HeyGen AI-Аватар Reels | Копирайтер HeyGen | Рендер HeyGen | Spoken avatar — not CapCut montage |
| `site-articles` | Статьи на сайт | Копирайтер сайта | Редактор сайта | SEO article — not reels |
| `tg-articles` | Статьи в TG | Копирайтер TG | Редактор TG | TG hook/longread — not site SEO clone |
| `custom-reels` | Рилс | **Сценарист** | **Монтажёр рилсов** | Raw video montage IO (**C-151**) |
| `custom-clips-to-reels` | Нарезки с видео в рилсы | Копирайтер нарезки | Монтажёр нарезки | Clip detection / moments — distinct from full custom-reels script |
| `custom-info-video` | Информационное видео | Копирайтер инфо-видео | Дизайнер инфо-видео | Thesis/VO structure — not 15s Recs hook clone |

**Audit checklist (implementers):** for each row, grep `PIPELINE_COPY` + seeded `name`/`role`/`systemPrompt`/`skills` — no identical prompt strings across different module families; custom-reels designer role ≠ «Дизайн / сборка».

### C-153 — ENV first carousel (plain Russian doc)

| Lock | Decision |
|------|----------|
| **D153.1** | Create/update **`docs/ENV_FIRST_CAROUSEL.md`** in **plain Russian** for a non-dev user: where to open `.env`, which lines to paste, restart note. |
| **D153.2** | Document at least: `AGGREGATOR_API_KEY` (+ `AGGREGATOR_BASE_URL` if needed) — LLM/Polza; `IG_SCRAPER_API_KEY` (+ optional `IG_SCRAPER_BASE_URL`) — competitors; and if carousel vendor key is used: `CAROUSEL_API_KEY` / `CAROUSEL_API_BASE_URL` (align with `docs/ENV_CAROUSEL.md` — may cross-link; do not duplicate secrets). |
| **D153.3** | **No real key values** in docs/skills/memory/git. Soft-fail without keys → mock. |
| **D153.4** | Backend: smoke may report `KEY_OK len/prefix` only — never print secret. Wire path optional this wave if UI/docs-only prep is enough; if wire exists, document which feature needs which key. |

## Path locks (no overlapping writers)

1. **Mesh chrome one path (Frontend):** C-146 → C-147 → C-150 on `ReleaseTeamFlowchart` / `CanvasTopBar` / mesh page / `ScoutInspectorSettings` — sequential, one FE owner.  
2. **Inspector packs path (Frontend → Backend?):** C-148 → C-149 on `AgentInspectorDrawer` + `types/mesh-agent.ts` + agent-store (+ upload route if chosen).  
3. **Pipeline contracts (AI Bridge + Frontend seeds):** C-151 → C-152 on `lib/mesh/agent-defaults.ts` (+ prompts/handoff if separate).  
4. **Docs (Backend):** C-153 `docs/ENV_FIRST_CAROUSEL.md` — after or parallel to path 3 (no overlap with mesh TSX). Prefer after FE title/scout stable.

**Forbidden parallel:** two agents editing `ReleaseTeamFlowchart.tsx` or `AgentInspectorDrawer.tsx` at once.

## In scope

- `components/mesh/v2/ReleaseTeamFlowchart.tsx` — C-146
- `components/mesh/CanvasTopBar.tsx`, `app/studio/[moduleId]/mesh/page.tsx` — C-147
- `components/mesh/v2/AgentInspectorDrawer.tsx`, `types/mesh-agent.ts`, agent-store — C-148/C-149
- Optional `app/api/settings/agent-packs/upload/route.ts` (or equivalent) — C-148
- `components/mesh/v2/ScoutInspectorSettings.tsx` — C-150
- `lib/mesh/agent-defaults.ts` (`PIPELINE_COPY` + seed roles) — C-151/C-152
- AI Bridge prompt/handoff strings for custom-reels montage — C-151/C-152
- `docs/ENV_FIRST_CAROUSEL.md` (+ cross-link `ENV_CAROUSEL.md` / `ENV_AGGREGATOR.md`) — C-153

## Out of scope

- Product UI code from Architect (this ticket)
- Returning MultiButton / xyflow / Copy TZ
- Settings «Разведка» / «Агенты» / «LLM» blocks (C-145 stays deleted)
- VPS/prod deploy
- Committing secrets
- Changing RBAC (OWNER-only mesh)

## Layers / owners

| Layer | Role | Tickets |
|-------|------|---------|
| Chrome + Scout + title + inspector UX | **Frontend** | C-146…C-150 |
| Upload API (if not FileReader-only) | **Backend** | C-148 |
| MCP type migration support | Frontend (+ Backend if persist server) | C-149 |
| PIPELINE_COPY / prompts / montage IO | **AI Bridge** (+ FE seed labels) | C-151, C-152 |
| ENV doc | **Backend** | C-153 |
| Guards + Playwright scenarios | **Tester** → **Deployer** localhost → **Client** | all |

Skills: `xyflow-agent-mesh`, `content-factory-ui`, `content-pipeline-agents`, `backend`, `prompt-engineering` (AI Bridge), `client-scenarios` (extend S37/S39 for upload/MCP/Scout/title).

## Acceptance (язык Клиента)

1. На User brief **нет** «Сбросить к шаблону модуля» и **нет** раскрываемых подсказок шаблона — только поле брифа.  
2. Заголовок (видимый + sr-only) = «Команда выпуска: » + точное имя модуля из `MESH_PIPELINE_LABELS`.  
3. В drawer у агента можно **загрузить** skill `.md` и plugin файл; имена видны в списках; у Тренера — поиск/предложение плагина из `plugins/<role>/PLUGINS.md`.  
4. MCP-карточка имеет website (+ tools/description); Scout **без** MultiButton типов контента.  
5. На модуле «Рилс»: **Сценарист** + **Монтажёр рилсов** (не «Дизайн / сборка»); остальные модули с уникальными именами/промптами; в `docs/ENV_FIRST_CAROUSEL.md` ясно куда вставить ключи (без секретов в репо).

## Risks

- Dual representation `skills: string[]` vs file-ref objects — migrate carefully; don't wipe existing packs.  
- MCP type change breaks store hydrate — provide string→binding mapper once.  
- custom-reels still sharing designer packId `designer` — UI labels/prompts must diverge even if packId stays for Settings sync (Architect allows packId reuse; **display + prompt must be unique**).  
- Upload API vs FileReader — pick one in FE `decisions.md`; if API, Backend first in chain before FE wire.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение. Не патчить продукт из роли Архитектора.
