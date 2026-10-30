# Architect spec — C-28

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

На странице модуля `/studio/[moduleId]` собрать **content workspace**: сверху идея; слева вертикальная карусель наших постов; рядом — карусель конкурентов; по идее конкуренты обновляются + появляется пустой draft-блок; клик по draft → CapCut-like редактор (premium shell), с проводкой Generate/SSE где уместно.

## In scope

### Module workspace layout (`/studio/[moduleId]`)

1. **Top:** idea/topic input (+ optional presets) — перенос смысла с бывшего `FloatingCommandBar` (можно вынести `ModuleIdeaBar` / reuse parts of FloatingCommandBar).
2. **Left column:** vertical scroll/carousel **ours** — карточки опубликованных (mock) постов этого `moduleId` + метрики (likes/views/reach — mock numbers).
3. **Next column:** vertical carousel **competitors** — analyst-selected mock posts + metrics.
4. **On idea submit / debounced change:** refetch feed with `?topic=`; competitor list обновляется; **ниже idea** появляется **empty draft block** (кликабельный empty state «New draft»).
5. **Click draft block** → открыть редактор (см. ниже).

### Mock API (Backend)

- `GET /api/studio/[moduleId]/feed?topic=`
- Response JSON:

```ts
type FeedPost = {
  id: string;
  source: "ours" | "competitor";
  title: string;
  thumbUrl?: string;       // optional placeholder
  metrics: { likes: number; views: number; comments?: number };
  topicTags?: string[];
};

type FeedResponse = {
  ours: FeedPost[];
  competitors: FeedPost[];
};
```

- Реализация: **in-memory / fixture mock** — без live IG, без новых Prisma моделей, без migrate.
- Фильтрация competitors по `topic` (case-insensitive substring / tag match на fixture); пустой topic → default set.
- Unknown `moduleId`: 404 или empty arrays + 200 (выбрать 404 для unknown canonical; custom → empty OK) — зафиксировать в decisions.

### CapCut-like editor

- **Preferred route:** `/studio/[moduleId]/edit/[draftId]` full-page premium dark workspace.
  - Alternative acceptable: full-screen modal with same chrome — если route тормозит; в decisions зафиксировать один вариант (**рекомендация Architect: route** для deep-link и Client scenarios).
- UI must feel like **video/timeline editor**, not HITL form:
  - Preview canvas (center)
  - Timeline scrubber (bottom)
  - Layers / clips panel (left or right)
  - Top bar: back to workspace, module label, Generate / status
- **Reuse:** inspect HITL pieces (`ReelsPlayer`, approve patterns, draft fields) **только как данные/логика**, не как layout формы. Wire existing `startGenerate` / SSE (`/api/modules/[moduleId]/generate`, `/api/jobs/[id]/stream`) from editor or idea bar — drawer/steps могут жить рядом, но primary chrome = CapCut shell.
- `draftId`: client-generated (`draft-{uuid}`) или `new` → store creates id; mock persistence in zustand OK for wave.

### Generate / SSE

- Generate доступен с module workspace (idea bar) и/или editor top bar.
- Не публиковать в соцсети без HITL.
- Не ломать существующие generate/regenerate/render routes.

## Out of scope

- Live competitor scraping / real IG Graph API.
- DDL, Prisma migrate, Redis wipe, generatedMedia delete.
- Замена global font (C-26) и базовых routes/sidebar (C-27) — **предпосылки**.
- Полноценный Remotion timeline engine / real multi-track NLE — **shell + mock scrubber** достаточно для приёмки волны.
- Prod deploy.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| API mock | Backend | `app/api/studio/[moduleId]/feed/route.ts` + fixtures |
| UI workspace + editor | Frontend | module page layout, carousels, idea, draft block, editor route/shell |
| Motion | Motion | carousel scroll affordance, editor chrome enter, scrubber polish |
| AI / SSE | Frontend (+ existing module API) | Reuse store `startGenerate` / job stream; AI Bridge **не** обязателен если промпты не меняются |
| AI Bridge | — | Только если понадобится новый prompt contract mid-flight |

## Contracts

### Feed API

| Item | Value |
|------|-------|
| Method | `GET` |
| Path | `/api/studio/[moduleId]/feed` |
| Query | `topic` optional string |
| 200 body | `{ ours: FeedPost[], competitors: FeedPost[] }` |
| Side effects | none (read-only mock) |
| Auth | same as other studio APIs (localhost open OK) |

### Client fetch

- Module page: on mount fetch without topic; on topic commit refetch with topic.
- Draft empty block visible after first non-empty topic commit (or after successful feed with topic) — product: «on idea → … + empty draft below».

### Editor route

| Path | Meaning |
|------|---------|
| `/studio/[moduleId]/edit/[draftId]` | CapCut-like shell |

Keep `/studio/inspect/[id]` for existing HITL preview flow (может остаться secondary entry после generate).

## Acceptance criteria (язык Клиента)

1. На странице модуля сверху есть поле идеи; на launch его нет (C-27).
2. Видны две вертикальные ленты: наши посты и конкуренты (mock с метриками).
3. После ввода/отправки идеи лента конкурентов меняется под тему; под идеей появляется пустой блок черновика.
4. Клик по черновику открывает редактор «как CapCut» (таймлайн + превью + слои), а не простую форму.
5. Generate/SSE можно запустить с workspace/editor без падения (mock pipeline OK).
6. Guard: feed API returns shape; topic updates competitors; draft visible; editor opens. Safety: no DB wipe.

## Risks

- **Scope creep NLE:** держать shell; не строить полный video engine в этой волне.
- **C-27 dependency:** workspace page must exist; если C-27 только shell — C-28 наполняет тот же `page.tsx`.
- **E2E drift:** client scenarios S1 (Generate on launch) → перенос на `/studio/[moduleId]`; Tester обновляет scenarios/guards.
- **Overlap paths:** Backend feed route vs Frontend page — sequential in chain; не параллелить одни и те же files.
- Data safety: fixtures only; no `prisma migrate reset`.

## Mid-flight escalation

Если Editor как modal vs route спорят с Client scenarios: стоп → Architect (default **route**). Если нужны реальные competitor данные — новый тикет, не расширять C-28.
