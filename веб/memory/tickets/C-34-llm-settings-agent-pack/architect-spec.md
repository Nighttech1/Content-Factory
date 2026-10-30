# Architect spec — C-34

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Страница **Настройки** `/settings` в сайдбаре: выбор LLM-модели на агента; в `.env.example` — `AGGREGATOR_API_KEY` (+ optional base URL); папка `agents/` с markdown-инструкциями на каждого pipeline-агента. Модели — localStorage.

## Depends

- Wave order: C-32 → C-33 → **C-34**.
- Pipeline agent ids from razbor + future mesh: Analyst, Scriptwriter, Designer, Researcher, Hook Writer, Renderer, Publisher (extend list in `lib/settings/llm-models.ts`).

## In scope

### 1. Route + sidebar

1. New App Router page `app/settings/page.tsx`.
2. Add nav item **«Настройки»** in `components/shell/SidebarNavigation.tsx` (icon e.g. Settings; not owner-only).
3. UI block: per-agent model selector (select/combobox) from a fixed catalog of model ids (aggregator-facing names).

### 2. Env placeholders (no real keys)

1. Update `.env.example`:

```bash
# LLM aggregator (all agents). Never commit real key.
AGGREGATOR_API_KEY=
# Optional override
AGGREGATOR_BASE_URL=
```

2. Document briefly in comment or `docs/` one-liner: all agents use this aggregator; local `.env` only.
3. **Never** write real keys into memory tickets, specs, or git.

### 3. Agent instruction pack

1. Folder **`agents/`** at repo root (preferred over `docs/agents/` for discoverability).
2. One markdown file per pipeline agent, e.g.:
   - `agents/analyst.md`
   - `agents/scriptwriter.md`
   - `agents/designer.md`
   - `agents/researcher.md`
   - `agents/hook-writer.md`
   - `agents/renderer.md`
   - `agents/publisher.md`
3. Each file sections (minimum): **Role**, **Base prompt**, **Skills**, **Plugins**, **MCP servers**, **Notes**.
4. Content can be stubs that match current mock behaviour + pointers to existing skills; AI Bridge may refine later — not blocking for UI.

### 4. Model config lib + persistence

1. `lib/settings/llm-models.ts`:
   - Agent id union / list.
   - Default model per agent.
   - Catalog of allowed model string ids (aggregator models).
   - Read/write helpers for **localStorage** key e.g. `cf.llm-models.v1`.
2. Settings page uses this lib; SSR-safe (hydrate after mount).
3. Backend stub: optional `lib/settings/aggregator-env.ts` that **reads** `process.env.AGGREGATOR_API_KEY` / `AGGREGATOR_BASE_URL` for future calls — must not log the key; unused live call OK this wave.

## Out of scope

- Live aggregator HTTP calls / billing / key validation UI that echoes secrets.
- Server-side persistence of model prefs (DB).
- Changing Brand Kit → C-33.
- Ours tabs / Razbor composer → C-32.
- DB wipe / migrate.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| `.env.example` + optional aggregator env stub | Backend | Placeholders only |
| `agents/*.md` pack | AI Bridge | Instruction files; prompt-engineering skill |
| `lib/settings/llm-models.ts` + `/settings` + sidebar | Frontend | localStorage |
| Motion | Optional | Page enter only |
| Tester | Guards | Route, sidebar, env example keys present, agents files exist, no real keys |

## Contracts

### localStorage

| Key | Value |
|-----|-------|
| `cf.llm-models.v1` | `Record<AgentId, modelId>` JSON |

### Env

| Var | Required | In git |
|-----|----------|--------|
| `AGGREGATOR_API_KEY` | for live later | empty placeholder in `.env.example` only |
| `AGGREGATOR_BASE_URL` | optional | placeholder |

### Agents folder

| Path | Purpose |
|------|---------|
| `agents/<agent>.md` | Human+agent readable instruction pack |

### Invariants

- No real keys in repo/memory.
- Model prefs client-only this wave.
- Settings does not force social publish.

## Acceptance criteria (язык Клиента)

1. В сайдбаре есть **Настройки**; открывается `/settings` с выбором модели для каждого агента; выбор сохраняется после перезагрузки (localStorage).
2. В `.env.example` есть пустые `AGGREGATOR_API_KEY` и опционально `AGGREGATOR_BASE_URL`.
3. В репо есть папка `agents/` с markdown на каждого pipeline-агента.
4. Guard: route 200; no secrets scanned in committed files. Safety: no DB wipe.

## Risks

- Accidental commit of filled `.env` — enforce example-only; Tester scan.
- Agent list drift vs Razbor ids — single source in `llm-models.ts`.
- AI Bridge stubs too thin — acceptable if files exist with required sections.

## Mid-flight escalation

If product requires server-synced model prefs or live aggregator chat — stop → Architect extends Backend + AI Bridge chain (new ticket if scope grows).
