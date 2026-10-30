# Architect spec — C-27

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Превратить `/studio` в **launch (rocket)**: только карточки модулей (+ register). Убрать поле идеи с launch. Клик по модулю → отдельная страница `/studio/[moduleId]`. В sidebar пункт Studio раскрывается с дочерними ссылками на те же модули.

## In scope

### Routes

- Оставить `app/studio/page.tsx` как launch (сетка модулей, без topic input).
- Добавить `app/studio/[moduleId]/page.tsx` — **минимальный shell** в этом тикете (заголовок модуля + placeholder «workspace in C-28» OK), но маршрут обязан существовать и резолвить canonical ids.
- **Не трогать** `app/studio/inspect/[id]/page.tsx` (HITL inspect остаётся).
- Canonical `moduleId` (из `components/studio/modules.ts` / manifests):
  - `carousel-engine`
  - `aesthetic-graphics`
  - `cartoon-reels`
  - `heygen-reels`
- Custom modules: если id есть в store — тоже `/studio/{customId}`; неизвестный id → notFound / мягкий empty state (на усмотрение Frontend, зафиксировать в guard).

### Launch UX

- Убрать с `/studio` компонент `FloatingCommandBar` **целиком** (или оставить файл, но не рендерить на launch). Topic / Generate переезжают на module page в **C-28** — в C-27 Generate с launch не запускать.
- `GenerationDrawer` на launch: **убрать** вместе с command bar (генерация только с module workspace в C-28). Не ломать store API.
- `ModuleSelectorGrid`: карточки → `next/link` на `/studio/{id}`; selection в store опционально синхронизировать при клике (`setSelectedModuleId`), но навигация обязательна.
- Copy launch header: убрать «задайте тему» — только выбор модуля / канал.

### Sidebar

- `components/shell/SidebarNavigation.tsx`: Studio — expandable parent.
  - Parent: `/studio` (launch) или chevron-only expand; children = список модулей из тех же manifests (+ custom если просто).
  - Active state: `/studio` exact для launch; `/studio/carousel-engine` и т.д. подсвечивает child; `/studio/inspect/...` не ломает Studio parent (parent active если `pathname.startsWith("/studio")`).
- Лёгкий Motion: expand/collapse children (spring, `useReducedMotion`).

## Out of scope

- Dual carousels, competitor feed, draft block, CapCut editor → **C-28**.
- Смена шрифта → **C-26** (уже до/параллельно по волне: C-26 first).
- Удаление inspect / HITL / mesh RBAC.
- Live Instagram / DB schema / migrate reset.
- Полный Generate/SSE wiring на module page (C-28).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI / routing | Frontend | pages, ModuleSelectorGrid, Sidebar, strip FloatingCommandBar from launch |
| Motion | Motion | sidebar expand; optional card hover — после Frontend |
| API | — | нет в C-27 |
| AI bridge | — | нет |

## Contracts

### URL

| Path | Meaning |
|------|---------|
| `/studio` | Launch: module cards + register only |
| `/studio/[moduleId]` | Per-module workspace (shell in C-27; full UX in C-28) |
| `/studio/inspect/[id]` | Existing HITL inspect — unchanged |

### Navigation rules

- Module card click → client navigation to `/studio/{canonicalId}` (Link), не только store select.
- Launch **must not** render `data-testid="command-input"` / topic presets.
- Sidebar children hrefs match card hrefs 1:1 for core modules.

### Shared data source

- Labels/ids: `listManifests` / `STUDIO_MODULES` / `mergeStudioModules` — один источник для grid и sidebar (избежать drift).

## Acceptance criteria (язык Клиента)

1. На `/studio` нет поля «тема / идея» и нет FloatingCommandBar с Generate.
2. Клик по карточке модуля открывает свою страницу (URL меняется на `/studio/carousel-engine` и т.п.).
3. В левом меню Studio раскрывается; видны дочерние пункты тех же модулей; клик ведёт на те же URL.
4. `/studio/inspect/:id` по-прежнему открывается (регрессия запрещена).
5. Guard: launch без `command-input`; каждый core module имеет рабочий href; sidebar children присутствуют.

## Risks

- Старые E2E/smoke (`smoke-c25`, client S1) ждут `command-input` на `/studio` — Tester обновляет guards/сценарии: topic теперь на module page (C-28); до C-28 Generate на launch отсутствует — **ожидаемо**.
- Conflict `app/studio/inspect/[id]` vs `app/studio/[moduleId]`: Next.js static segment `inspect` wins — убедиться что `moduleId !== "inspect"` в валидации; не регистрировать модуль с id `inspect`.
- Custom modules в sidebar: не раздувать — core 4 обязательно; custom — nice-to-have если уже в `mergeStudioModules`.

## Mid-flight escalation

Если нужен named route вместо dynamic (`/studio/heygen` aliases): стоп → Architect; по умолчанию **только canonical ids**. Не начинать C-28 UI до зелёного C-27 routing.
