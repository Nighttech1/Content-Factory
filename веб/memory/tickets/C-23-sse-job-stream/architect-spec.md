# Architect spec — C-23

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Заменить клиентскую симуляцию прогресса генерации (`runSimulatedPipeline` в `lib/studio-store.ts`) живым **Server-Sent Events** потоком: после Generate Draft drawer шагает по агентам и progress только от событий SSE (`useJobStream(jobId)`), без агрессивного polling. Localhost без Redis/BullMQ остаётся демо-рабочим через **mock stream**. Контракт: `.cursor/skills/sse-job-stream/SKILL.md`, DEV_PLAN **7.1**.

## In scope

- `GET /api/jobs/[id]/stream` → `Content-Type: text/event-stream`.
- Payload каждого события (JSON в `data:`): `{ status, agent, message, progress }`.
- Создание / выдача `jobId` при старте generate (расширить ответ `POST /api/modules/[moduleId]/generate` **или** отдельный лёгкий create-job; предпочтение — **вернуть `jobId` из generate**, чтобы не ломать существующий mock draft flow).
- Клиентский хук `useJobStream(jobId)`: `EventSource`, reconnect с `Last-Event-ID` (заголовок / query), cleanup при unmount / смене job.
- Проводка: `lib/studio-store.ts` + `components/studio/GenerationDrawer.tsx` — шаги/`data-step-state`/progress из SSE, не из локальных таймеров.
- **Mock stream** при отсутствии Redis/BullMQ: детерминированная последовательность Researcher → Hook Writer → Script Writer → Designer (сообщения как DEV_PLAN §2.3), progress 0→100.
- Сохранить рабочий mock `POST …/generate` (C-20/C-22): draft + assets по-прежнему возвращаются; SSE только для live log UI.

## Out of scope

- Настоящий BullMQ worker pipeline / Remotion / HeyGen GPU (достаточно mock emitter).
- WebSockets, long-polling fallback как основной канал (допустим только тихий fallback если EventSource недоступен — не обязателен в этом тикете).
- Prisma DDL / новые миграции ContentJob (если нужна запись — только in-memory / ephemeral map на `globalThis`; **без** `migrate reset`).
- Публикация в соцсети, HITL Approve changes.
- Motion polish (C-24), E2E font/RBAC guards (C-25).
- Смена палитры / DESIGN.md.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| API SSE + jobId | **Backend** | Route stream, mock emitter, optional job registry on `globalThis`; wire generate → `jobId` |
| Hook + store + drawer | **Frontend** | `useJobStream`, заменить `runSimulatedPipeline` на SSE-driven steps; не трогать module registry |
| Motion | — | не в chain C-23 |
| AI Bridge | — | не менять промпты/workers |
| QA | Tester → Fixer | EventSource ≥1 progress; `data-step-state` без reload |
| Localhost | Deployer | `/studio` Generate → live steps |
| Приёмка | Client | S1 + live log |

## Contracts

### SSE endpoint

- **Method/path:** `GET /api/jobs/[id]/stream`
- **Response headers:** `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive` (где применимо в Next route).
- **Event shape (JSON):**

```ts
type JobStreamEvent = {
  status: "queued" | "running" | "completed" | "failed";
  agent: "researcher" | "hook_writer" | "script_writer" | "designer" | "system";
  message: string;   // human RU, tone DEV_PLAN §2.3
  progress: number;  // 0..100 integer
};
```

- **SSE framing:** каждый кадр с `id:` (monotonic) + `data: <json>\n\n`. Reconnect: клиент шлёт `Last-Event-ID`; сервер досылает с следующего id (mock: можно replay remaining steps).
- **Unknown jobId:** `404` JSON `{ ok: false, error: "job_not_found" }` **или** SSE с одним `failed` событием — выбрать одно в реализации и зафиксировать в `decisions.md` Backend; предпочтение Architect: **404 до открытия stream**.

### Generate ↔ jobId

- `POST /api/modules/[moduleId]/generate` остаётся mock-first; в успешный JSON добавить:

```json
{ "ok": true, "moduleId": "…", "jobId": "<id>", "draft": { … } }
```

- `jobId` создаётся **до или вместе** с generate; mock stream для этого id регистрируется сразу (иначе drawer откроет EventSource на пустоту).
- Параллельно generate может завершиться раньше/позже stream: UI показывает steps от SSE; draft/success по-прежнему от ответа generate (как сейчас). Не блокировать generate на полном SSE complete, если mock stream идёт асинхронно — согласовать: **mock stream длится ~несколько секунд**, generate может завершиться в том же окне; при `completed` SSE → progress 100 и все steps `done`.

### Client hook

```ts
useJobStream(jobId: string | null): {
  status, agent, message, progress, connected, error
}
```

- `jobId == null` → не открывать EventSource.
- Пока SSE connected — **не** polling `/api/jobs/...` чаще потока.
- TanStack Query: опционально для cache/status; EventSource — source of truth для progress (skill).

### UI mapping (store → drawer)

| agent | step id (existing drawer) | sample message |
|-------|---------------------------|----------------|
| researcher | researcher (или текущий id в store) | «Анализ 40 источников...» |
| hook_writer | hook | «Отбор лучшего хука (3 из 10)...» |
| script_writer | script | «Сборка таймлайна...» |
| designer | designer | «Рендеринг визуала...» |

Сохранить существующие `data-testid="agent-step"`, `data-step-id`, `data-step-state` (`pending` | `active` | `done` | `error`).

## Files to touch (expected)

| Path | Owner | Action |
|------|-------|--------|
| `app/api/jobs/[id]/stream/route.ts` | Backend | **new** SSE route |
| `lib/jobs/` (stream registry / mock emitter) | Backend | **new** ephemeral job+events; no Redis required |
| `app/api/modules/[moduleId]/generate/route.ts` | Backend | return `jobId`; register mock job |
| `hooks/useJobStream.ts` (или `lib/use-job-stream.ts`) | Frontend | **new** EventSource + Last-Event-ID |
| `lib/studio-store.ts` | Frontend | drop/gate `runSimulatedPipeline`; drive steps from hook/SSE |
| `components/studio/GenerationDrawer.tsx` | Frontend | consume SSE-backed store (minimal if store owns state) |
| `memory/tickets/C-23-sse-job-stream/guards.md` | Tester | **new** |

## Acceptance criteria (язык Клиента)

1. На `/studio` выбираю модуль, ввожу тему, жму **Generate Draft** — drawer открывается как раньше (сценарий **S1** не ломается).
2. Шаги агентов и полоска progress **меняются без перезагрузки страницы**, по живым событиям с сервера (не только «тикнули таймеры в браузере»).
3. В DevTools / Network виден запрос `…/api/jobs/<id>/stream` типа event-stream; приходит ≥1 событие с `progress` / `message`.
4. Без Redis на машине демо всё равно идёт: шаги доходят до Designer / 100%.
5. Generate по-прежнему отдаёт mock-черновик (модули M1–M4 и custom после C-22); нет массового polling.

## Risks

- Гонка: generate JSON vs SSE complete — UI может мигнуть success до последнего step; Backend/Frontend: при `generateStatus=success` форсировать steps done **или** дождаться SSE `completed` с коротким timeout.
- Next.js App Router + streaming: нужен Node runtime, не edge; не буферизовать весь ответ.
- HMR / dual instances: job registry на `globalThis` (урок C-22).
- Утечка EventSource при быстром повторном Generate — обязательный close.

## Safety

- **Запрещено:** `prisma migrate reset`, DROP DB, wipe Postgres/Redis volumes, удаление `generatedMedia`.
- Секреты только `.env`; в memory/guards не писать ключи.
- Не публиковать в соцсети.
- Mock-only jobs — ephemeral memory OK; не требовать Redis для localhost.

## Mid-flight escalation

Если контракт события / путь jobId не стыкуется с drawer: **стоп** → Оркестратор → Архитектор правит spec + chain → продолжение. Фиксер не меняет endpoint shape втихую.
