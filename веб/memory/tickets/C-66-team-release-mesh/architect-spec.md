# Architect spec — C-66

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Пункт меню и экран mesh: **«Команда выпуска»** вместо «Холст»; убрать debug chrome `// Только владелец · Сетка агентов`; агенты в **одну горизонтальную линию**; клик по агенту → **`AgentPropertiesPanel`** с name, description, skills[], completedJobs; расширить `AgentNodeData` в `mesh-seed`.

## Depends

- Wave `memory/waves/W-2026-10-07-ux-carousel-nav.md` — **wave 2**.
- C-58 view-only mesh **сохранить** (no drag/connect/add-module).
- Skills: `xyflow-agent-mesh`, `content-factory-ui` § RU chrome, `client-scenarios` S16.
- Path vs C-63: если C-63 уже сделал `dynamic` на `app/admin/mesh/page.tsx` — C-66 правит TopBar/canvas/panel **внутри** dynamic child, не откатывать dynamic.

## In scope

### 1. Nav label

Файл: `components/shell/SidebarNavigation.tsx`.

- Label пункта `/admin/mesh`: **«Команда выпуска»** (было «Холст»).
- RBAC `ownerOnly` **без регресса** — ADMIN по-прежнему не видит пункт (S3).
- testId `nav-mesh` / текущий — сохранить если есть.

### 2. Remove debug chrome

Файлы: `components/mesh/CanvasTopBar.tsx` и/или `app/admin/mesh/page.tsx` / shell copy.

- Удалить видимую строку **`// Только владелец · Сетка агентов`** (и любой `// …` debug subtitle mesh).
- Title экрана: **Команда выпуска**.

### 3. Horizontal agent line

Файл: `lib/mesh-seed.ts` (+ layout positions в seed graphs).

- Verify/fix: agent nodes **одна горизонтальная линия** (LR), не вертикальный стек «редактируй сам».
- C-58: `nodesDraggable={false}`, no connect — без изменений политики.

### 4. Extend `AgentNodeData`

Файл: `lib/mesh-seed.ts`.

Сейчас:

```ts
{ label, status, tasks, avatar }
```

**Добавить** (и заполнить в seed для agent nodes):

| Field | Meaning |
|-------|---------|
| `name` | отображаемое имя (можно = label; panel читает `name`) |
| `description` | краткий контракт шага |
| `skills` | `string[]` |
| `completedJobs` | number (или string count — зафиксировать number) |

Сохранить совместимость node UI: `label`/`status`/`tasks`/`avatar` не ломать AgentNode renderer без нужды.

### 5. `AgentPropertiesPanel`

Новый: `components/mesh/AgentPropertiesPanel.tsx` (имя по факту).

Wire в `AgentMeshCanvas.tsx`:

- `onNodeClick` → select agent → open panel.
- Показать: **name**, **description**, **skills[]**, **completedJobs**.
- Close: Esc / кнопка / клик пустого canvas сбрасывает selection.
- Не editor графа; не add-node.

## Out of scope

- Wave 1 carousel / nav loading → C-63–65
- Schedule → **C-67**
- Backend jobs API for real completedJobs (seed/mock OK)
- Plan file / VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Nav + seed + panel + canvas click | **Frontend** | xyflow-agent-mesh |
| Panel slide-in / reduced-motion | **Motion** | optional short |
| Backend / AI Bridge | — | **не звать** |

## Path ownership (this ticket)

```
components/shell/SidebarNavigation.tsx     # mesh label only
components/mesh/CanvasTopBar.tsx
components/mesh/AgentMeshCanvas.tsx
components/mesh/AgentPropertiesPanel.tsx   # NEW
lib/mesh-seed.ts
app/admin/mesh/page.tsx                    # title/chrome only; keep C-63 dynamic if present
```

**Не трогать:** `StudioModuleWorkspace`, feed/*, analytics/*, schedule/* (кроме если Shared MenuVertical types — only SidebarNavigation label).

## Contracts

```
Nav label === «Команда выпуска»; ADMIN still hidden
No "// Только владелец · Сетка агентов"
Agents laid out in one horizontal line (mesh-seed)
AgentNodeData includes name, description, skills[], completedJobs
onNodeClick → AgentPropertiesPanel with those fields
View-only C-58 unchanged
```

## Acceptance criteria (язык Клиента)

1. В меню OWNER видит «Команда выпуска»; ADMIN — нет (S3 + S16).
2. На экране нет `// Только владелец…`; заголовок «Команда выпуска».
3. Агенты в одну линию; клик открывает панель с именем, описанием, навыками, числом завершённых работ.
4. Esc/close закрывает панель; узлы не перетаскиваются.

## Risks

- Parallel C-63 on `app/admin/mesh/page.tsx` — согласовать: C-63 dynamic wrapper first или один Frontend.
- Renaming «Холст» в сценариях/скиллах Client — Tester обновляет asserts на «Команда выпуска».

## Mid-flight escalation

- Live completedJobs from BullMQ — новый Backend тикет; здесь seed.
