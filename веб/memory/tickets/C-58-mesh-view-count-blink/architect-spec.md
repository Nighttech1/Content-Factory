# Architect spec — C-58

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

`/admin/mesh` = **просмотр** команды (не конструктор). Шапка dual-feed: число постов **не** моргает «…» на рефетче.

## Depends

- **C-57 Done** (path lock волны).
- Skills: `xyflow-agent-mesh` § View-only C-58, `content-factory-ui` § dual-feed header C-58.
- C-08 «Добавить модуль / plugin slot» **superseded**.
- C-52: скелеты сетки уже SWR (`showSkeletons` только если пусто+loading). Этот тикет чинит **только шапку count**.
- C-53: семь пайплайнов + `MeshPipelineSwitcher` уже есть — **не** ломать ids.

## In scope

### 1. TopBar — без add, switcher сверху

Файлы: `components/mesh/CanvasTopBar.tsx`, `components/mesh/AgentMeshCanvas.tsx`.

| Сейчас | Нужно |
|--------|--------|
| `onAddModule` + кнопка `mesh-add-module` «Добавить модуль пайплайна» | **удалить** проп, кнопку, `onAddModule` callback и custom nodes |
| `extra` = switcher с `basis-full` **под** KPI | `MeshPipelineSwitcher` — **первая** визуальная зона шапки (сверху / первой строкой) |
| KPI RU | оставить |

Не «прятать» кнопку CSS. Удалить. `data-testid="mesh-add-module"` не должен существовать.

### 2. Canvas view-only + горизонтальный ряд

`AgentMeshCanvas.tsx` (`ReactFlow`):

| Prop / поведение | Значение |
|------------------|----------|
| `nodesDraggable` | `false` |
| Connect | **нет** `onConnect`; `nodesConnectable={false}`; edges не reconnect |
| Pan / zoom / MiniMap / Controls / `fitView` | **OK** |
| PulseEdge | оставить |

`lib/mesh-seed.ts`: сейчас Hook/Script на **разном Y** (80 / 280) при том же X — визуальный «стек». Выровнять **один Y** (как Researcher/Router, ~180) и шаг **X** слева направо (**LR**). `fitView` после смены пайплайна уже есть — сохранить, padding достаточный для горизонтального ряда.

`onNodesChange` можно оставить для selection; позиция мышью не должна меняться (`nodesDraggable={false}` достаточно). Не звать `addEdge`.

### 3. Счётчик фида без «…»

Файл: `components/studio/workspace/VerticalPostCarousel.tsx` строка шапки:

```tsx
{loading ? "…" : headerCount}
```

**Запрещено** подменять известный count на `"…"`.

| Состояние | UI числа |
|-----------|----------|
| Первая загрузка, постов ещё не было (`headerCount === 0` и `loading`) | `"…"` **или** `0` — только пока count ни разу не известен |
| Рефетч / search, карточки или прошлый count уже были | показывать **`headerCount` всегда** либо `lastCount` (ref), пока не придёт новый length |
| Скелеты сетки | без изменений C-52 |

Рекомендация: `useRef` `lastKnownCount`; обновлять когда `!loading` **или** `displayPosts.length > 0` / drafts length известен; в шапке рендерить `lastKnownCount ?? (loading ? "…" : headerCount)`.

Тихий refetch — уже opacity pulse в шапке (`feed-refetching`). Не трогать Razbor.

## Out of scope

- MenuVertical / Launchpad counter → C-57
- Designer/Publisher Razbor, schedule tree, mic → C-59
- Persist графа mesh, BullMQ live, Backend
- Возврат plugin-slot add (C-08)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| TopBar + ReactFlow flags + seed LR + header count | **Frontend** | `xyflow-agent-mesh` |
| PulseEdge / tab enter (уже есть) | **Motion** | не включать drag; reduced-motion на fitView duration 0 |
| Backend / AI Bridge | — | нет |

## Contracts

```
nodesDraggable=false
onConnect = undefined / no-op forbidden as UX
no mesh-add-module
MeshPipelineSwitcher first in topbar
seed nodes same baseline Y, increasing X
header: never "…" if lastKnownCount != null
```

C-08 smoke «add module opens plugin» **устаревает** — Tester FAIL если кнопки **нет** больше не считается регрессом C-08; **новый** guard: кнопки нет.

## Acceptance criteria (язык Клиента)

1. OWNER `/admin/mesh`: переключатель видов контента **сверху**; нет «Добавить модуль пайплайна» (S10).
2. Ноды **не** таскаются; рёбра **не** рисуются мышкой; можно pan/zoom; ряд **горизонтальный**.
3. ADMIN по-прежнему без Холста (S3).
4. В колонке конкурентов workspace при поиске/рефетче число в шапке **не** прыгает в «…» (S10). Карточки не схлопываются в скелеты (C-52).

## Risks

- `onNodesChange` + selection vs drag — проверить что `nodesDraggable={false}` реально блокирует.
- `VerticalPostCarousel` общий ours+competitors — last-known на **обеих** колонках, не только competitors.
- Не править Razbor в этом тикете.

## Mid-flight escalation

- Нужен persist позиций нод — Backend тикет; **не** в C-58.
- WebGL — **нет**.
