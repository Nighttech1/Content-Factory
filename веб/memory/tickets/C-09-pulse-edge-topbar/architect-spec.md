# Architect spec — C-09

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Завершить Sprint 3 UX Agent Mesh: анимированные `PulseEdge` (поток JSON между агентами) и `CanvasTopBar` с mock KPI + `[+ Add Pipeline Module]`. Это DEV_PLAN **3.3–3.4**. Без Backend / live BullMQ / SSE / SDK modal.

## In scope

- Создать `components/mesh/edges/PulseEdge.tsx`:
  - Bezier (или BaseEdge + getBezierPath) + animated cobalt gradient pulse (`--accent-blue` / `--accent-blue-bright`).
  - Имитация потока данных; уважать `useReducedMotion` (статичный edge без pulse).
- Создать `components/mesh/CanvasTopBar.tsx`:
  - Mock metrics: `Active Jobs: 4`, `Avg Latency: 180ms`, `GPU Cluster: Active` (или эквивалентные подписи).
  - Кнопка `[+ Add Pipeline Module]` — добавляет **mock** `AgentNode` в граф (локальный state на canvas); **без** Module SDK / plugin modal.
- Вшить в `components/mesh/AgentMeshCanvas.tsx`:
  - `edgeTypes: { pulse: PulseEdge }` (ключ согласовать с seed).
  - Обновить edges в `lib/mesh-seed.ts` → `type: 'pulse'` (или маппинг в canvas).
  - Смонтировать TopBar над/внутри full-bleed canvas.
- Motion: основная cinema-работа — pulse на edges + мягкий TopBar entrance / button feedback; spring `{ damping: 25, stiffness: 300 }`.

## Out of scope

- Live очереди BullMQ, SSE job stream, GPU telemetry API.
- Полноценный Plugin Hub / Module SDK picker (только mock add node).
- Новые типы нод сверх C-08 (Add Module → ещё один AgentNode с mock label).
- Backend / Prisma / AI Bridge.
- Ломка OWNER gate; изменение shell RBAC.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| PulseEdge + TopBar + wire | Frontend | `components/mesh/edges/PulseEdge.tsx`, `components/mesh/CanvasTopBar.tsx`, `AgentMeshCanvas.tsx`, `lib/mesh-seed.ts` (edge type) |
| Pulse + TopBar motion | Motion | edges + TopBar (+ canvas state wiring untouched structurally) |
| API / data | — | mock only |
| AI bridge | — | нет |
| QA | Tester → Fixer | pulse edges; TopBar metrics; Add Module adds node; RBAC ADMIN→studio |
| Localhost | Deployer | `:3000` `/admin/mesh` |
| Приёмка | Client | полный Screen 1 checklist skill xyflow-agent-mesh |

## Contracts

### edgeTypes

```ts
edgeTypes = { pulse: PulseEdge }
// seed edges: { id, source, target, type: 'pulse' }
```

### TopBar mock (фиксированные строки для guards)

| Metric | Mock value |
|--------|------------|
| Active Jobs | `4` |
| Avg Latency | `180ms` |
| GPU Cluster | `Active` |

### Add Module

- Click → append one mock AgentNode (id уникальный, label вроде `Custom Module` / `Plugin Slot`) + optional edge от последнего узла **или** free-floating — зафиксировать в FE: **free-floating** у свободной позиции (проще, без ломки seed chain); если FE выберет link к Analyst — допустимо, описать в decisions.
- Не открывать modal SDK.

### Path lock

- Frontend: `components/mesh/edges/PulseEdge.tsx`, `components/mesh/CanvasTopBar.tsx`, `components/mesh/AgentMeshCanvas.tsx`, `lib/mesh-seed.ts` (edge `type` only / minimal).
- Старт **после** Done Frontend+Motion C-08.
- **Не** параллелить с C-07/C-08 FE.

### Skill checklist (приёмка)

- [x] Dot-grid (C-07)
- [x] Zoom / pan / minimap (C-07)
- [ ] TopBar metrics (C-09)
- [ ] Add Pipeline Module (C-09)
- [ ] PulseEdge (C-09)

## Acceptance criteria (язык Клиента)

1. Соединения между агентами пульсируют cobalt-градиентом (без reduced-motion — спокойная линия).
2. Сверху холста видны Active Jobs / Avg Latency / GPU Cluster с mock-значениями.
3. `[+ Add Pipeline Module]` добавляет новую ноду на холст без сервера и без SDK-модалки.
4. Регресс: ADMIN → `/studio`; OWNER видит полный mesh.

## Risks

- CSS/`stroke` анимация vs GPU: предпочитать transform/opacity на edge path; не тяжёлый blur на весь canvas.
- Controlled nodes state: после Add Module canvas должен держать nodes в React state (seed = initial), иначе add не сработает.
- Конфликт с C-08 на canvas — только последовательный FE.

## Mid-flight escalation

Если требуют live metrics / SSE / Plugin Hub modal: **стоп** → Оркестратор → Архитектор (новый тикет, не раздувать C-09).
