# Architect spec — C-53

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Одинаковый workspace на всех модулях Студии: тумблер Опубликовано/Черновики и «Разбор» (каскад C-51) не только у `carousel-engine`. На `/admin/mesh` — **семь отдельных пайплайнов** по видам контента, не один граф Router → 1..N.

## Depends

- **C-52 Done** (те же workspace files).
- Trainer A — factory-parity grade; skills `content-factory-ui` § all-modules, `xyflow-agent-mesh` § C-53, `content-pipeline-agents` § Razbor C-53.
- Product tiles уже в Launchpad (C-45): `custom-reels`, `custom-clips-to-reels`, `custom-info-video`.
- **Порядок волны:** C-52 → **C-53** → C-54.

## In scope

### 1. Workspace flags (все `moduleId`)

В `StudioModuleWorkspace` сейчас:

- `showDraftsButton={isCarouselEngine}`
- `showRazborButton={isCarouselEngine}`
- `onRazborClick` / `RazborModal` только если carousel
- `openDraftsNonce` / `onSelectDraft` gated

**Сделать:** флаги и Razbor **включены для всех** модулей workspace (`/studio/[moduleId]`, CORE + product custom).

- Тумблер Опубликовано/Черновики слева на каждом модуле.
- Пустые черновики OK: reuse `useCarouselDraftsStore` / `DraftsPanel` без нового store и без новых агентов. Не плодить per-module draft schema.
- `RazborModal` монтировать всегда (не `isCarouselEngine ?`).
- Кнопка «Разбор» на карточках конкурентов везде; тот же C-51: Analyst welcome + «Начать разбор» → Analyst → Scriptwriter. **Не** новые агенты, **не** Designer.
- CapCut «Открыть в редакторе» остаётся `isReels` / `isCapCutModule` — **не** размазывать на graphics.

`feedLayout` / aspect (grid 3/5 только carousel) **не** обязательно унифицировать в этом тикете.

### 2. Razbor pipeline — reuse, не AI Bridge

`getRazborWelcome` / `startRazbor` / `runRazborCascade` уже принимают `postOverride`. Modal (`RazborModal`) уже вызывает `getRazborWelcome(post.id, post)`.

| Правило | Деталь |
|---------|--------|
| Lookup | Всегда передавать текущий `FeedPost` с карточки; не резолвить только `findCarouselCompetitor` |
| Fallback carousel-only | Оставить как last resort; не блокер, если override есть |
| Новые агенты / packs | **запрещены** |
| API `POST /api/studio/carousel-engine/razbor` | не расширять в этом тикете, если modal ходит в клиентский `razbor-pipeline.ts` |

Правая панель: reuse `RazborReelPlayer`. Для IMAGE / aesthetic-graphics — **без Play** (хелпер C-52 `shouldShowFeedPlay`). Видео — play+scrubber C-51, no autoplay.

**AI Bridge не звать**, пока FE передаёт `post`. Mid-flight: если welcome = null без carousel id — тогда эскалация к AI Bridge (ослабить `findCarouselCompetitor`), не в стартовом chain.

### 3. Mesh — 7 пайплайнов

Файлы: `app/admin/mesh/page.tsx`, `components/mesh/AgentMeshCanvas.tsx`, `lib/mesh-seed.ts` (+ switcher UI).

Канон id (как Launchpad / `mergeStudioModules`):

| Студия | Mesh pipeline id |
|--------|------------------|
| карусели | `carousel-engine` |
| картинки | `aesthetic-graphics` |
| мульт | `cartoon-reels` |
| HeyGen | `heygen-reels` |
| рилс | `custom-reels` |
| нарезки | `custom-clips-to-reels` |
| инфо-видео | `custom-info-video` |

UX: вкладки/сегмент **вида контента** (`data-testid="mesh-pipeline-switcher"`, активный `data-pipeline-id`). Пользователь видит **свой** ряд: Researcher → (Hook/Script по типу) → Designer/Renderer **этого** модуля → Queue → HITL → Publisher → Analyst.

- `RouterNode` — **внутри** выбранного пайплайна, не маршрутизатор на все 7 сразу.
- Ноды reuse (`AgentNode`, `HITLNode`, `QueueNode`, `PulseEdge`).
- Seed: `createMeshSeed(pipelineId)` — отдельный graph per id (позиции/labels могут отличаться: graphics без Hook Writer OK; video — Hook+Script).
- Смена вкладки → `useNodesState`/`useEdgesState` на seed этого id (не мешать графы).
- RBAC OWNER page **не менять** (ADMIN redirect C-02 / S3).
- Подписи **новых** контролов переключателя — **RU** (названия модулей как на Студии). KPI TopBar EN → **C-54** (path lock: C-53 может не трогать строки `Active Jobs` / `[+ Add Pipeline Module]`, либо оставить как есть).

**WebGL не нужен.** Motion: существующий `PulseEdge` на рёбрах каждого пайплайна + лёгкий enter при смене вкладки.

## Out of scope

- Flicker/Play/shares → C-52 (уже должно быть)
- Полный RU chrome сайдбара / Schedule / Analytics header → **C-54**
- Новые LLM-агенты, Designer в Razbor, draft upsert из modal
- BullMQ live / SSE / Prisma mesh persistence
- C-48 copy плиток
- Prod publish

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Workspace flags + Razbor mount | **Frontend** | `StudioModuleWorkspace`, carousel props, `RazborModal` reuse |
| Mesh per-type graphs | **Frontend** | skill `xyflow-agent-mesh` |
| PulseEdge + tab enter | **Motion** | `web-motion-engine`; не WebGL |
| Razbor messages | — | reuse C-51; **AI Bridge не в chain** |
| Backend | — | нет |

## Contracts

### Workspace

```
showDraftsButton = true  // all modules
showRazborButton = true  // competitor cards
<RazborModal /> always mounted when workspace known
```

### Mesh

```
MESH_PIPELINE_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
  "custom-reels",
  "custom-clips-to-reels",
  "custom-info-video",
]
```

Один visible graph = один id. Запрещён единственный seed «Dynamic Router routes: carousel, heygen, cartoon» как **единственный** вид Canvas.

### Regression

- Smoke C-31 `showRazborButton={isCarouselEngine}` **устаревает** — Tester правит (Razbor не только carousel).
- S3: ADMIN по-прежнему без Холста; OWNER видит переключатель 7 пайплайнов.

## Acceptance criteria (язык Клиента)

1. На ≥2 модулях кроме каруселей слева есть Опубликовано/Черновики (S8).
2. На карточках конкурентов этих модулей есть «Разбор»; открытие → приветствие аналитика + «Начать разбор» (те же агенты, что в каруселях).
3. OWNER на `/admin/mesh` переключает пайплайны карусели / картинки / мульт / HeyGen / рилс / нарезки / инфо-видео — **разные** ряды агентов, не один universal graph (S3).
4. ADMIN по-прежнему не видит Холст.

## Risks

- Overlap `StudioModuleWorkspace` с C-52 — строго после C-52.
- Overlap `app/admin/mesh/page.tsx` с C-54 (заголовок RU) — C-53 не обязан переводить TopBar; C-54 закроет EN leftovers.
- Пустой DraftsPanel на non-carousel — ожидаемо; не строить fake drafts.
- `findCarouselCompetitor` без override сломает custom ids — FE обязан передавать `post`.

## Mid-flight escalation

- Welcome null на graphics → AI Bridge: `find*` по `getFeedForModule(moduleId)` — тогда вставить AI Bridge в chain, **не** новые агенты.
- Нужен persist графа на сервер — новый Backend-тикет.
- WebGL/R3F — **не** эскалировать; xyflow достаточен.
