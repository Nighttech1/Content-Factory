# XYFlow Agent Mesh — Команда выпуска (STATIC flowchart)

## When

Экран **«Команда выпуска»** (module-scoped после **C-136**; исторически `/admin/mesh`), dual-lane пайплайн, inspector drawer по клику на **агента**.

**Эталон волны:** `code_artifact.html` (user Downloads) + user TZ. Skills supersede C-83…C-98 MultiButton chrome и C-137 xyflow/ReactFlow path.

## Stack — **C-138 + C-139 STATIC** (supersedes C-124…C-137 canvas engines)

| ID | Канон | Запрещено |
|----|--------|-----------|
| **C-138** | **DELETE** `MultiButton` / `MeshPipelineSwitcher` / content-type switcher **со всех** страниц «Команда выпуска» | Expanded MultiButton, Compact, tabs пайплайна в top bar |
| **C-139** | **STATIC** блок-схема: **HTML/CSS/SVG** (как artifact). Prefer **не** `@xyflow/react` / ReactFlow infinite canvas | `ReleaseTeamFlowchart` v2 на xyflow, `FlowEdge` / `FlowAgentNode` xyflow, free pan/zoom board, seed coords с дрейфом |

**C-137 intent retained (продукт):** dual-lane, User, Scout≠Trainer, inspector, OWNER RBAC, module top-nav entry. **C-137 engine choice (новый xyflow view-layer) — ОТМЕНЁН** для этого экрана → только static diagram.

### Delete list (обязателен — Frontend в chain.md)

- `MeshPipelineSwitcher`, любой MultiButton на mesh/release-team pages
- Legacy + v2 xyflow: `AgentMeshCanvas`, MiniMap/Controls/Dots, `PulseEdge` mid-clutter, **`ReleaseTeamFlowchart` / `FlowEdge` / `FlowAgentNode`** на ReactFlow
- Dead mesh-seed free-canvas coords; dual-path «старый + новый» canvas

### Static flowchart checklist (C-139)

- [ ] Layout: scrollable container + **SVG overlay** для связей; ноды = DOM cards (не ReactFlow nodes)
- [ ] Gaps: **gap-28** между карточками ряда; **gap-32** / ряд-spacer как в artifact (`gap-28` / vertical `gap-36` OK если читаемо @1440)
- [ ] **Dual lane:** (A) User → Разборщик/Сценарист → … → Publisher; (B) Scout → Аналитик → Тренер
- [ ] Solid edges A + B: **короткие RU labels** (1–3 слова) на solid; **не** mid-text на dashed
- [ ] **Dashed** Trainer→release agents: **БЕЗ** mid-edge text labels (C-129 dashed rule hardened)
- [ ] **0 overlap** blocks @1440; нет сдвигов от infinite canvas
- [ ] Dot-grid background OK (CSS); **не** xyflow Dot background as board chrome
- [ ] Клиент **S37** обновлённый (static + tabs; не S33-xyflow)

## Top bar — C-138 chrome → **C-143 / C-147 supersede**

| Нужно | Запрещено |
|-------|-----------|
| Title **всегда** `Команда выпуска: {ModuleName}` (RU display name модуля, напр. «Карусели», «Рилсы») | Голый «Команда выпуска» без суффикса; MultiButton / MeshPipelineSwitcher |
| Subtitle (одна RU строка) | KPI Задачи/Задержка/GPU |
| **Только** title + subtitle (C-143) | Кнопка **«Скопировать ТЗ для Cursor»** / «Загрузить ТЗ» / любой copy-TZ CTA (**C-143 DELETE**) |

Опционально: status pill «Пайплайн активен» — только если не ломает «title + subtitle only». Refresh «выровнять» / debug `//` eyebrows — **запрещены**.

## User ≠ agent — **C-140** → **C-146** → empty «Задание» → **S49 DELETE basic brief**

| Правило | Деталь |
|---------|--------|
| **S49 HARD DELETE** | **Удалить** поле **client basic brief / «Задание» / combat brief** с Команды выпуска (User node). Нет accordion textarea, нет seed, нет empty-state «напишите ТЗ» |
| Drawer | **НЕ** открывать для User (как и раньше) |
| Клик User | Показать **роль / identity** (иконка, label «Пользователь») **без** editable brief field |
| Wire to AI (**S49**) | Текст удалённого brief **НИКОГДА** не уходит агентам как task / system / user / agent-start / handoff / generate context. Persist keys brief — migrate/ignore, **не** читать в runtime |
| Live chat (C-155) | system = agent `systemPrompt` only; user = raw composer only |
| Запрет | Вернуть combat brief UI; ghost-inject старый localStorage brief; `user: brief + message`; generate-path «task = User brief» |
| **C-146 DELETE** (архив) | reset-to-template / hint-copy — уже не нужны после удаления поля |

### Release-team agents notes (**S49** strengthen)

| Агент (mesh) | Note |
|--------------|------|
| Scout / Разведчик | Task = Scout settings текущего module + источники; **не** User brief |
| Разборщик / Analyst path | Task = media URLs + moduleId + Razbor insights; **не** User brief |
| Сценарист | Task = handoff JSON / raw chat / CTA number; **не** User brief |
| Дизайнер | Task = dramaturgy + active brandbook/DESIGN.md tokens; **не** User brief |
| Публицист / Публикация | Task = schedule + platform; **auto schedule OR manual time** (Phase6); **не** User brief |
| Тренер (пайплайн) | Task = Analyst conclusions → skill patches; **не** User brief |

## Pan + ports — **C-141 / C-142** (static shell)

Static ≠ «мертвая картинка без жестов». Контейнер схемы:

| ID | Правило | Запрет |
|----|---------|--------|
| **C-141** | **Pan** схемы: **LMB drag** (desktop) + **finger drag** (touch). Scroll wheel / overflow OK как доп.; primary = grab-pan | Снова тащить ReactFlow infinite canvas «ради pan»; pan ломает click на карточках (нужен click vs drag порог) |
| **C-142** | SVG/DOM стрелки стыкуются к **вертикальному CENTER** боковой грани карточки (mid-Y port), не к top/header | Порты от верхнего края / title baseline; стрелки «в воздух» над карточкой |

## Designer card

На карточке Дизайнера — **attached chip** `design.md` = **active** slot из Settings Embla library (`C-settings-design-md-carousel`), не orphan filename. Click chip → Settings Design / preview. Не только в drawer.

## Scout settings on Team — **C-145** → **C-150** → **S52 Scout↔Apify bind**

Параметры разведки живут в **инспекторе Scout** на «Команда выпуска» — **один Scout на текущий module pipeline**. Settings блок «Разведка» (**C-104**) — **удалён**.

| **C-150 DELETE** | `MultiButton` / pills / tabs **типов контента** внутри Scout inspector |
| Канон | Смена типа = другой module → другая «Команда выпуска»; Scout settings **только** для текущего `moduleId` |

### Scout panel defaults + **«Разведать»** (S52 HARD)

| UI | Canon |
|----|--------|
| **Bottom CTA** | Кнопка **«Разведать»** внизу Scout agent panel — **единственный** manual trigger Apify / Scout run |
| **Auto-scout filters** | В settings Scout: пороги **virality / likes / views** (и др. по Architect schema) — применяются к Scout run, не к feed GET |
| **Frequency schedule** | Расписание auto-scout (daily/weekly/interval) в тех же Scout settings → Backend scheduler |
| **Handoff** | Scout run → persist **snapshot** → Studio **Конкуренты** читает snapshot |
| **Запрет** | Apify / scrape side-effect при open Competitors, mesh mount, focus, remount; «обновить ленту» без Scout CTA |

Defaults (mesh agent-defaults / Scout prefs): filters + schedule present with sensible product defaults; empty filters ≠ silent scrape-all-on-nav.

## Inspector drawer — tabs (C-139 → **C-148 / C-149** → **Phase6 +Логи**)

Клик по **агенту** (не User) → drawer. Tabs:

| Tab | Содержимое | Запрещено |
|-----|------------|-----------|
| **Инструкция** | System prompt / instruction **only** (MD OK + upload `.md`) | Отдельный блок **rules** / «Правила» рядом с prompt |
| **Скиллы & Инструменты** | Три группы: **1. Skills** → **2. Plugins** → **3. MCP** — **file upload**, не text-only | Одна плоская свалка; JSON dump; только textarea имён без файлов |
| **Модель & Параметры** | LLM select, **temperature**, **maxTokens** | Поле **timeout** / любой timeout control |
| **Логи** (Phase6 Correct) | Run/error log for this agent (timestamps, fail reason, job id) — read-only product surface | Секреты / raw API keys in log lines; empty stub forever when errors exist |

### Workflow error chrome — **RED perimeter** (Phase6)

| Правило | Деталь |
|---------|--------|
| **When** | Agent node on «Команда выпуска» has last run **error** / critic fail / vision `needs_review` escalated to agent fault |
| **Chrome** | **RED** perimeter / border glow on that agent card (visible @1440 without opening drawer) |
| **Clear** | Perimeter clears when error acknowledged or next successful run |
| **Запрет** | Silent fail with green/idle chrome; only toast without card signal |

### Publicist (Phase6)

| Path | Canon |
|------|--------|
| **Auto** | Publish drafts per **schedule from settings** (Publicist / schedule prefs) |
| **Manual** | User sets **manual publish time** |
| Task | schedule + platform; **не** User brief |
| Запрет | Silent social publish outside Publicist auto\|manual path |

### Skills / Plugins — **file upload (C-148)**

| Группа | Accept | UI |
|--------|--------|-----|
| Skills | `.md` (skill packs) | Upload + текущий filename; список прикреплённых |
| Plugins | `.md` / `.plugin` / plugin manifest | Upload + filename; **не** «вставь текст плагина» как единственный путь |
| MCP | карточки свойств (C-149), не произвольный blob | см. ниже |

**Trainer-test path (C-148):** у **Тренера (пайплайн)** в tab Skills·Plugins — действие **«Найти / добавить плагин»** (поиск WebSearch/GitHub/HF **или** локальный catalog stub) → proposal → HITL «Согласовано» до apply. Не путать с Cursor-Тренером команды.

### MCP properties — **C-149** (минимум полей)

Каждый MCP entry — объект, не голая строка имени:

```ts
type AgentMcpBinding = {
  id: string;
  name: string;           // display
  website: string;        // docs / product URL (обязательно в UI)
  transport?: "stdio" | "sse" | "http";
  commandOrUrl?: string;  // launch cmd или endpoint (без секретов в git)
  toolsSummary?: string;  // кратко: какие tools даёт
  authEnvKeys?: string[]; // только ИМЕНА env (напр. API_KEY_21ST), никогда значения
  enabled: boolean;
};
```

| Нужно в UI | Запрещено |
|------------|-----------|
| website (ссылка), name, enabled; опц. transport / toolsSummary / authEnvKeys (имена) | Секреты в полях; MCP = `string[]` без website |

Typed model (Архитектор фиксирует):

```ts
type ReleaseAgent = {
  id: string;
  role: string;
  systemPrompt: string; // tab Инструкция only
  skills: { id: string; filename: string; /* blob/path server-side */ }[];
  plugins: { id: string; filename: string }[];
  mcp: AgentMcpBinding[];
  modelConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    // NO timeout
  };
};
```

| Правило | Деталь |
|---------|--------|
| Width | Resizable OK; persist `cf.mesh.inspector.width` |
| Scout | Info/сбор — не patches; **нет** content-type MultiButton (C-150) |
| Тренер | Proposals skills/plugins/MCP + HITL; **search/add plugin** path (C-148) |
| Esc / close | Закрывает drawer |
| Footer | Save OK; **Reset-to-template на User brief — DELETE (C-146)**; agent Save≠user reset |

**C-137 `rules[]` as separate inspector section — superseded:** rules живут **внутри** system prompt (tab Инструкция), не отдельным UI-блоком.

## Nodes (минимум на схеме)

| Type | Назначение |
|------|------------|
| User (не агент) | Accordion brief (без reset/hint — C-146) |
| Agent cards | Scout, Аналитик, Тренер (пайплайн), Разборщик, Copywriter/Script **per type**, Designer **или** module-specific role (+ design.md chip где релевантно), Publisher |

**Naming (C-105):** Разборщик ≠ Аналитик ≠ Тренер ≠ Scout.

### `custom-reels` labels — **C-151**

| Было (generic) | Стало на схеме + inspector |
|----------------|----------------------------|
| Designer / Дизайнер | **Монтажёр рилсов** |
| Copywriter | **Сценарист** |
| chip | не `design.md` slide-kit; опц. chip монтажа / timeline OK |

Router/Queue/HITL без chat — не как «агент команды» в ряду (wave2).

## Per content-type (C-53 intent) + **pipeline audit C-152**

Пайплайн **этого** moduleId (entry с module top nav). **Без** MultiButton switcher на экране — один pipeline = текущий module scope. Смена типа = другой module workspace → снова «Команда выпуска: {ModuleName}».

Канон порядка выпуска (C-106 intent): копирайтер/сценарист **этого** content-type → Designer **или** Монтажёр → …; линия B: Scout → Аналитик → Тренер + dashed к агентам A.

**C-152:** каждый `moduleId` — **свой** graph/labels/IO (нет copy-paste `carousel-engine` нод на reels/graphics/…). Архитектор: матрица модулей в spec; Frontend не шарит один `DEFAULT_PIPELINE` без per-module overrides.

## Entry / RBAC

- Entry: module top nav **«Команда выпуска»** (C-136)
- OWNER only; ADMIN не видит/не открывает (S3)
- Title: **`Команда выпуска: {ModuleName}`** (C-147)

## Edges (static SVG)

| Ребро | Label |
|-------|--------|
| Solid A/B handoffs | Короткие RU (напр. «тезисы», «хуки», «слайды») |
| Dashed Trainer→A | **Нет** mid-label; animation dashflow OK |

**C-129 HARD** на static: label bbox solid **не** пересекает card bbox @1440; dashed без текста.

## Agent card art

Premium Dark Luxury; human/role cue OK; Trainer barbell (C-125) retained. Убрать clutter tags «N задач» / «разбор» chips.

## Checklist (C-138…C-143 + C-145…**C-152**)

- [ ] **Нет** MultiButton / MeshPipelineSwitcher на release-team pages
- [ ] **Нет** ReactFlow / xyflow infinite canvas / FlowAgentNode path
- [ ] Static HTML/CSS/SVG dual-lane; gap-28/32; 0 overlap @1440
- [ ] Solid short labels; dashed Trainer→release **без** mid-text
- [ ] **S49:** User **без** basic brief field; **no** drawer; **no** brief glue anywhere (live + generate + handoff) (**C-155** + **S49 DELETE**)
- [ ] Pan: LMB + finger drag (**C-141**)
- [ ] Arrow ports = vertical **center** of cards (**C-142**)
- [ ] Designer (carousel): design.md chip; **custom-reels**: Монтажёр рилсов + Сценарист (**C-151**)
- [ ] Drawer: Skills/Plugins = **file upload**; MCP = website + props (**C-148/C-149**); Trainer search/add plugin
- [ ] Scout: settings текущего pipeline **без** content-type MultiButton (**C-150**)
- [ ] Top bar: **`Команда выпуска: {ModuleName}`** + subtitle only — **нет** copy-TZ (**C-143/C-147**)
- [ ] Per-module pipelines ≠ copy-paste (**C-152**)
- [ ] Клиент **S37** + **S39** + новые клики upload/MCP/Scout (Архитектор → client-scenarios)
