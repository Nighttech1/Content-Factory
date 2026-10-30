# Architect spec — C-08

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Добавить кастомные типы нод Agent Mesh и статический seed-граф пайплайна на холсте C-07. Это DEV_PLAN **3.2** / ARCHITECTURE Screen 1 (узлы Researcher…Analyst). Edges остаются default до **C-09** (`PulseEdge`).

## In scope

- Создать `components/mesh/nodes/*`:
  - `AgentNode` — имя агента, пиксельный/placeholder аватар, статусная плашка, счётчик задач.
  - `RouterNode` — Dynamic Router → modules 1..N (визуально; без живого SDK).
  - `QueueNode` — mock метрики очереди (active / waiting / delayed) — **не** live BullMQ.
  - `HITLNode` — «ожидание апрува админом».
- Создать `lib/mesh-seed.ts`:
  - Статический граф узлов + edges (default edge type до C-09).
  - Порядок пайплайна (обязательный):  
    **Researcher → Hook → Script → Router → Queue → Designer → HITL → Publisher → Analyst**
  - Типы: Agent × (Researcher, Hook, Script, Designer, Publisher, Analyst); Router; Queue; HITL.
- Вшить `nodeTypes` в `components/mesh/AgentMeshCanvas.tsx` и подключить seed (`nodes`/`edges` из `mesh-seed`).
- Dark Luxury / glass aesthetic; токены `--accent-blue` (cobalt), `--border-glass`, без purple-slop.
- Motion: hover / status badge micro-motion на нодах (`components/mesh/nodes/*` и при необходимости canvas); spring `{ damping: 25, stiffness: 300 }`; `useReducedMotion`.

## Out of scope

- `PulseEdge`, `edgeTypes`, `CanvasTopBar`, Add Module, mock TopBar KPI → **C-09**.
- Пересоздание shell ReactFlow / ломка OWNER gate на page → запрет (только wire `nodeTypes` + seed).
- Backend / BullMQ live / SSE / Prisma / Module SDK modal / plugin registry.
- Изменение `components/shell/**`, session store.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Nodes + seed + wire canvas | Frontend | `components/mesh/nodes/*`, `lib/mesh-seed.ts`, `components/mesh/AgentMeshCanvas.tsx` (nodeTypes + seed only) |
| Node micro-motion | Motion | `components/mesh/nodes/*` (+ canvas only если нужно для fit) |
| API / data | — | нет (mock props в seed) |
| AI bridge | — | нет |
| QA | Tester → Fixer | 4 node types visible; seed order; RBAC regress |
| Localhost | Deployer | `:3000` `/admin/mesh` |
| Приёмка | Client | видна цепочка агентов на canvas |

## Contracts

### `nodeTypes` keys (зафиксировать имена)

| key | Component | Seed instances |
|-----|-----------|----------------|
| `agent` | AgentNode | Researcher, Hook Writer, Script Writer, Designer, Publisher, Analyst |
| `router` | RouterNode | Dynamic Router |
| `queue` | QueueNode | BullMQ Queue (mock) |
| `hitl` | HITLNode | HITL Gate |

Имена ключей можно слегка уточнить в коде, но **четыре** типа обязательны; seed ids стабильны (`researcher`, `hook`, `script`, `router`, `queue`, `designer`, `hitl`, `publisher`, `analyst`).

### Seed edges

- Линейная цепочка по порядку Goal (9 nodes → 8 edges).
- `type` edges не задавать кастомный до C-09 (или задать placeholder `'default'`); C-09 заменит на `pulse`.

### Path lock

- Frontend: `components/mesh/nodes/**`, `lib/mesh-seed.ts`, `components/mesh/AgentMeshCanvas.tsx` (только nodeTypes + initial nodes/edges).
- **Не** править `app/admin/mesh/page.tsx` без необходимости (gate уже C-07).
- **Не** создавать `PulseEdge` / `CanvasTopBar` в C-08.
- После C-07 Done; **до** C-09 FE. Не параллелить с C-07/C-09 FE.

### Data

- Все статусы / task counts / queue numbers — **mock** в seed или props нод. Нет fetch, нет Redis.

## Acceptance criteria (язык Клиента)

1. На `/admin/mesh` (OWNER) видны кастомные ноды четырёх видов, не дефолтные серые прямоугольники xyflow.
2. Цепочка слева направо (или читаемый pipeline-layout): Researcher → Hook → Script → Router → Queue → Designer → HITL → Publisher → Analyst.
3. Glass / Dark Luxury; статусы и счётчики читаемы.
4. ADMIN по-прежнему не видит mesh (регресс).

## Risks

- Конфликт merge на `AgentMeshCanvas.tsx` с C-09 → строго после C-08 FE завершён.
- Слишком тяжёлые ноды → держать presentational; аватары — placeholder/референс static, не remote fetch без cache.
- C-09 сменит `edgeTypes` — seed edges должны допускать `type: 'pulse'` без смены node ids.

## Mid-flight escalation

Если нужен live BullMQ / SSE или Plugin Hub modal: **стоп** → Оркестратор → Архитектор.
