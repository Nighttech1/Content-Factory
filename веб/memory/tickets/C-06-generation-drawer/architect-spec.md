# Architect spec — C-06

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → обновить этот файл + `chain.md`.

## Goal

Slide-over **GenerationDrawer** с mock pipeline шагов агентов и progress-bar; собрать Launchpad на `app/studio/page.tsx` (grid + command bar + drawer). Закрыть Hard REJECT S1: Generate Draft открывает drawer, шаги меняются на UI без reload. DEV_PLAN **2.3** / Client scenario S1. **Без** реального SSE.

## In scope

- Расширить `lib/studio-store.ts` (после C-04/C-05; **extend only**):
  - `drawerOpen` / `setDrawerOpen` / `closeDrawer`
  - `agentSteps` / current step status text
  - `progress` (0–100 или step index)
  - `runMockPipeline` / дописать тело `startGenerate`: open drawer + sequential timers
- Mock sequence (~1–2 s каждый), UI labels (DEV_PLAN 2.3):

| Phase key | Agent | Status copy (пример) |
|-----------|-------|----------------------|
| `researching` | The Researcher | «Анализ 40 источников...» |
| `hooking` | The Hook Writer | «Отбор лучшего хука (3 из 10)...» |
| `scripting` | The Script Writer | «Сборка таймлайна...» |
| `designing` | The Designer | «Рендеринг визуала...» |
| `done` | — | завершено / 100% |

- `components/studio/GenerationDrawer.tsx`:
  - slide-over справа (framer-motion)
  - живой список шагов + progress с импульсом
  - закрытие (overlay / close button) → `drawerOpen = false` (не сбрасывать topic/module без нужды)
- Motion: slide-over enter/exit + progress pulse (`GenerationDrawer.tsx`).
- **Compose** `app/studio/page.tsx`:
  - смонтировать `ModuleSelectorGrid` + `FloatingCommandBar` + `GenerationDrawer`
  - убрать/сжать Sprint 1 «Design primitives» demo так, чтобы Launchpad читался как Screen 2 (не dashboard из трёх несвязанных демо)
  - сохранить AppShell wrap из layout (не трогать shell)

## Out of scope

- EventSource / SSE skill / BullMQ workers / real LLM.
- Backend / AI Bridge / Prisma jobs.
- Inspector HITL, mesh RBAC changes.
- Параллельная правка store вместе с C-04/C-05 FE.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Drawer + store runner + page compose | Frontend | `GenerationDrawer.tsx`, extend `studio-store`, `app/studio/page.tsx` |
| Slide + progress motion | Motion | `GenerationDrawer.tsx` |
| API / SSE | — | нет (mock only) |
| AI bridge | — | нет |
| QA | Tester → Fixer | **S1 hard gate**; guards.md |
| Localhost | Deployer | `/studio` полный Launchpad |
| Приёмка | Client | S1: Generate → drawer + steps change |

## Contracts

### Store extend (C-06)

```ts
drawerOpen: boolean
agentSteps: Array<{ id: string; label: string; statusText: string; state: 'pending' | 'active' | 'done' }>
progress: number // 0–100
startGenerate: () => void  // open + run mock (единый entry с C-05)
closeDrawer: () => void
// timers: clear on unmount / re-entry; prevent double-run overlap (ignore or reset)
```

### Mock runner

- Клиентский `setTimeout` / async chain; **не** fetch к API.
- ~1000–2000 ms на шаг; UI обновляется через zustand → re-render.
- Повторный Generate во время run: сброс и новый прогон **или** ignore — выбрать одно в FE и зафиксировать в `decisions.md` (рекомендация: **reset + restart**).

### Path lock Frontend

- `components/studio/GenerationDrawer.tsx`
- `lib/studio-store.ts` (drawer, steps, progress, mock runner body)
- `app/studio/page.tsx` (compose all three)
- **Не** переписывать C-04 grid / C-05 bar кроме минимального import на page; не трогать `components/shell/**`, mesh, analytics.

### Visual / Motion

- Dark Luxury slide-over; progress pulse; spring согласован.
- skill `content-factory-ui` + `web-motion-engine`.

## Acceptance criteria (язык Клиента)

1. На `http://127.0.0.1:3000/studio` видны сетка модулей, командная строка и (по Generate) drawer.
2. **S1:** клик Generate Draft → drawer открывается справа; статусы агентов сменяются researching → hooking → scripting → designing → done без перезагрузки страницы.
3. Progress-bar пульсирует / заполняется по шагам.
4. Нет реального SSE; нет обращения к HeyGen/LLM за этим mock.
5. Hard REJECT если Generate не открывает drawer или шаги не меняются.

## Risks

- Compose page ломает shell/RBAC — править только содержимое studio page.
- Гонки таймеров при двойном Generate — нужен reset/guard в store.
- C-05 stub `startGenerate` перезаписан несовместимо — сохранять единый API.

## Mid-flight escalation

Требование настоящего SSE/job id → новая волна (Sprint 7 skill `sse-job-stream`); этот тикет остаётся mock-only.
