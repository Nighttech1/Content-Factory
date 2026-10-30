# Architect spec — C-141 (pan + center ports + no Copy TZ)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Same mesh Frontend pass as **C-140**.  
> Supersedes C-138 requirement that top bar must include Copy TZ.

## Goal

Сделать static flowchart пригодным к обзору: pan drag, стрелки в центр карточек, убрать Copy TZ из top bar.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Pan** | Container translate via pointer events: **LMB** + **touch**. Implement click-vs-drag threshold (~4–6px) so agent/User clicks still fire. Cursor `grab`/`grabbing`. Wheel/overflow optional secondary — primary = drag pan. |
| **D2 No ReactFlow** | Pan is **transform on static shell** — do **not** reintroduce `@xyflow/react` infinite canvas. |
| **D3 Ports** | Horizontal in/out ports: `top: 50%` / `translateY(-50%)` (or equivalent). `drawConnections` line endpoints use **mid-Y** of card bounding box (fix prior top-10 / header baseline). Feedback/top ports: keep semantics but horizontal lanes must be center. |
| **D4 Copy TZ** | **DELETE** button + toast path from `CanvasTopBar`. Props like `copyTzText` may be removed. Top bar = **title + subtitle only**. No «Загрузить ТЗ» either. |
| **D5 Path** | Same FE pass as **C-140** on mesh files. |
| **D6 reduceMotion** | Pan still works; no decorative motion required. Motion role optional for grab affordance. |

## In scope

- `components/mesh/v2/ReleaseTeamFlowchart.tsx` — pan wrapper, `Port`, `drawConnections`
- `components/mesh/CanvasTopBar.tsx` — strip Copy TZ
- Related CSS / testids (`mesh-copy-tz` must disappear)
- Optional: `web-motion-engine` pan cursor polish

## Out of scope

- Returning MultiButton / MeshPipelineSwitcher
- MiniMap / pinch-zoom playground
- Settings (C-143/C-144)
- Polza audit (C-145)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Pan + ports + top bar | **Frontend** | `xyflow-agent-mesh` |
| Pan feel | **Motion** optional | `web-motion-engine` |
| QA | Tester → Client S39 | pan + center lines + no copy button |

## Acceptance (язык Клиента)

1. Drag пустого места схемы LMB/finger → схема едет; клик по агенту всё ещё открывает drawer.
2. Горизонтальные стрелки входят/выходят из **середины** высоты карточек @1440.
3. В top bar **нет** «Скопировать ТЗ» / «Загрузить ТЗ» — только заголовок и подзаголовок.
4. Нет ReactFlow.

## Risks

- Accordion expand changes card height → must redraw connections (already ResizeObserver — keep).
- Removing Copy TZ breaks old S37 step — Client uses **S37+S39** updated scenarios.
- Do not conflict with C-140 User textarea hit-testing inside pan surface.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
