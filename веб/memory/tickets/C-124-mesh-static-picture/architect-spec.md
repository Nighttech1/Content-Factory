# Architect spec — C-124 (mesh static pipeline picture)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **Связан с C-125** — один Frontend проход по тем же paths.

## Goal

`/admin/mesh` = обычный экран со **статичной картинкой** пайплайна команды, не интерактивная доска xyflow.

## Decision locks — render engine

| Lock | Decision |
|------|----------|
| **D1 Engine** | **Оставить `@xyflow/react` как render-only** fixed nodes/edges. **Не** переписывать на чистый CSS/SVG в этой волне (дороже; панель/клик/PulseEdge уже на xyflow). |
| **D2 Chrome ban** | Удалить / не рендерить: **MiniMap**, **Controls**, **Background Dots** (и любой Dot-grid «доски»). Canvas фон = solid Dark Luxury (`#08090A` / elevated), без playground chrome. |
| **D3 Interaction** | `nodesDraggable={false}`; **нет** `onConnect` / add-node / user edge edit. Pan/zoom — только fit/scale картинки опционально (как просмотр схемы), не «редактор». |
| **D4 Layout** | Фиксированные координаты из `lib/mesh-seed.ts` (dual-lane coords — **C-125**). Gaps достаточные на 1440; **0 overlap** bounding boxes; handoff labels (C-107) не клипаются блоками. |
| **D5 Panel** | Клик по агенту → **`AgentPropertiesPanel`** сохранить (width persist `cf.mesh.agent-panel.width`). Esc / overlay / empty click — close. |
| **D6 Keep** | MultiButton flush-left, title «Команда выпуска», OWNER RBAC, per content-type pipelines. |

## In scope — Frontend (+ Motion later)

Paths (shared with C-125 — **один проход**):

- `components/mesh/AgentMeshCanvas.tsx` — strip MiniMap/Controls/Dots; fitView; no playground
- `lib/mesh-seed.ts` — fixed positions / gaps (dual-lane structure → C-125)
- `components/mesh/nodes/AgentNode.tsx` — читаемость без overlap chrome
- `components/mesh/edges/PulseEdge.tsx` — dense readable arrows (+ dashed in C-125)
- `components/mesh/AgentPropertiesPanel.tsx` — keep click wire
- `components/mesh/CanvasTopBar.tsx` / `MeshPipelineSwitcher.tsx` — только если chrome мешает picture

## Out of scope

- Free canvas return / plugin-slot add
- C-125 role content (User node, dashed Trainer edges, barbell, Scout≠Trainer) — **в том же FE pass**, но acceptance dual-lane = C-125
- Studio / Schedule / Analytics
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Canvas + seed layout | **Frontend** | `xyflow-agent-mesh` static picture |
| Dashed density / barbell polish | **Motion** | после FE mesh pass (wave) |
| Backend | — | не нужен |

## Acceptance (язык Клиента) — C-124 slice

1. На `/admin/mesh` нет MiniMap / Controls / Dot-grid playground.
2. Схема выглядит как **картинка**: ноды не перекрываются; линии/labels читаемы @1440.
3. Клик по агенту открывает properties panel; Esc закрывает.
4. Полный S33 (dual-lane / Trainer / dashed) — совместно с **C-125**; Hard REJECT overlap / free playground.

## Risks

- Перенос layout в dual-lane (C-125) может сдвинуть coords — делать **одним** FE commit/pass на mesh.
- Не ломать MultiButton / panel width persist.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain (особенно если FE хочет уйти в pure SVG — нужен новый lock).
