# Architect spec — C-07

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Поднять оболочку Superadmin Agent Mesh на `/admin/mesh`: бесконечный холст `@xyflow/react` с тёмной точечной сеткой, Controls и MiniMap. Это DEV_PLAN **3.1** / ARCHITECTURE Screen 1 — фундамент Sprint 3. Кастомные ноды и seed — **C-08**; PulseEdge / TopBar — **C-09**.

## In scope

- Создать `components/mesh/AgentMeshCanvas.tsx` (client component):
  - `ReactFlow` + `Background` (`BackgroundVariant.Dots`) на тёмном canvas (`--bg-canvas` / Dark Luxury).
  - `Controls` (zoom / pan) + `MiniMap`.
  - Full-bleed под AppShell (высота viewport минус shell; без placeholder-заголовка как основной UI).
  - Пустой / минимальный `nodes`/`edges` (или пустые массивы) — **без** кастомных `nodeTypes` / seed graph (это C-08).
  - Default edges допустимы до C-09.
- Обновить `app/admin/mesh/page.tsx`:
  - **Сохранить** OWNER gate: `ADMIN` → `router.replace("/studio")` (контракт C-02 / Hard REJECT S3).
  - При `OWNER` — монтировать `AgentMeshCanvas` вместо placeholder-текста.
- Импорт CSS xyflow: `@xyflow/react/dist/style.css` (в canvas или page — один раз, без дубля).
- Зависимость `@xyflow/react` уже в `package.json` — не менять major без эскалации.
- Motion (лёгкий): вход холста / soft fade или без cinema-шума; не анимировать edges (C-09). Spring preset как в Sprint 1–2: `{ damping: 25, stiffness: 300 }` где применимо. `useReducedMotion` уважать.

## Out of scope

- Кастомные ноды `AgentNode` / `RouterNode` / `QueueNode` / `HITLNode` → **C-08**.
- `lib/mesh-seed.ts`, seed pipeline graph → **C-08**.
- `PulseEdge`, `CanvasTopBar`, Add Module, mock KPI → **C-09**.
- Backend / BullMQ live / SSE / Prisma / Module SDK / Plugin Hub modal.
- Изменение RBAC-модели (`lib/session-store.ts`, Sidebar) — только **не ломать** существующий gate на page.
- Studio / Inspector / Analytics.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Canvas shell + page mount | Frontend | `components/mesh/AgentMeshCanvas.tsx`, `app/admin/mesh/page.tsx`, xyflow CSS |
| Soft entrance (optional) | Motion | только `AgentMeshCanvas.tsx` (не page RBAC) |
| API / data | — | нет |
| AI bridge | — | нет |
| QA | Tester → Fixer | ReactFlow mount OWNER; ADMIN redirect; anti-slop |
| Localhost | Deployer | `:3000` `/admin/mesh` |
| Приёмка | Client | S3 RBAC + видимый холст у OWNER |

## Contracts

### RBAC (не менять семантику)

- `useSessionStore.role === "ADMIN"` → redirect `/studio` (существующий `useEffect` + early return).
- Canvas link в Sidebar остаётся `ownerOnly` (C-02) — **не трогать** `components/shell/**` в этом тикете.

### UI / xyflow

- `BackgroundVariant.Dots`, тёмный фон согласован с `--bg-canvas`.
- Zoom, pan, MiniMap присутствуют.
- Path lock Frontend: `components/mesh/AgentMeshCanvas.tsx`, `app/admin/mesh/page.tsx` (+ CSS import).
- **Не** создавать `components/mesh/nodes/**`, `edges/**`, `CanvasTopBar`, `lib/mesh-seed.ts` в C-07.

### Wave order (обязательный)

1. Frontend C-07 → Motion C-07 → (Tester…Client C-07 **или** отложить полный QA до конца FE-цепочки — Оркестратор решает; overlapping paths запрещены)
2. Frontend C-08 → Motion C-08 (после Done FE+Motion C-07)
3. Frontend C-09 → Motion C-09
4. Tester / Fixer / Deployer / Client по тикетам; финальный визуальный gate mesh — после C-09.

**Запрет:** параллельный Frontend C-07 / C-08 / C-09 на `AgentMeshCanvas.tsx` / `page.tsx` / seed.

## Acceptance criteria (язык Клиента)

1. Под OWNER на `http://127.0.0.1:3000/admin/mesh` виден бесконечный тёмный холст с точками, можно зумить и панорамировать; есть мини-карта.
2. Под ADMIN тот же URL уводит в Studio; пункта Canvas в сайдбаре у ADMIN нет (регресс C-02).
3. Нет текстового placeholder «Sprint 3 — placeholder» как основного содержимого у OWNER.

## Risks

- Next.js App Router: ReactFlow только в client component; CSS import обязателен иначе «сломанный» layout.
- Full-bleed внутри AppShell — следить, чтобы не появился горизонтальный скролл.
- Поздняя подстановка `nodeTypes` в C-08 — canvas API должен допускать пропсы/`nodeTypes` без ломки shell.

## Mid-flight escalation

Если нужен Backend/SSE, смена RBAC или отказ от `@xyflow/react`: **стоп** → Оркестратор → Архитектор обновляет spec + chain.
