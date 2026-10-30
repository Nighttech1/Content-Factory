# Architect spec — C-10

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Поднять **левую деку** Media Inspector на `/studio/inspect/:id`: split-shell (~55% left), toggle **9:16 Reels Player** ↔ **4:5 Carousel Deck** с DnD-перестановкой слайдов 01–08. Фундамент Sprint 4 (DEV_PLAN **4.1** / ARCHITECTURE Screen 3). Правая панель → **C-11**; HITL toolbar → **C-12**.

## In scope

- Создать маршрут `app/studio/inspect/[id]/page.tsx` (client-friendly page под существующий `AppShell`):
  - Читать `params.id` (демо: `demo`).
  - Монтировать `InspectorShell`.
- Создать `components/inspect/`:
  - `InspectorShell.tsx` — grid 12 cols: left `lg:col-span-7`, right `lg:col-span-5`; Dark Luxury tokens.
  - `InspectBreadcrumb.tsx` — STAGE 04 / HUMAN-IN-THE-LOOP (по Stitch).
  - `MediaDeck.tsx` + `PreviewModeToggle.tsx`.
  - `ReelsPlayer.tsx` — aspect 9:16, scrubber, Play/Pause, mock timecode (без реального `<video>` stream OK — poster + progress state).
  - `KaraokeCaptions.tsx` — bilingual overlay; Armenian glyphs via `font-[family-name:var(--font-hy)]` + `lang="hy"` (уже в `app/layout.tsx`).
  - `CarouselDeck.tsx` — горизонтальная лента 8 слайдов; **@dnd-kit** sortable reorder; click = select.
- Создать `lib/inspect-mock.ts` — полный seed draft (media + hooks + persona + HITL fields для C-11/C-12).
- Создать `lib/inspect-store.ts` — Zustand: **все** actions заранее (C-11/C-12 только consume):
  - Media: `setPreviewMode`, `togglePlay`, `setCurrentTime`, `reorderSlides`, `selectSlide`
  - Hook/script/persona: `selectHook`, `setScript`, `setPersonaField`
  - HITL: `rerollSelectedSlide`, `openApproveModal`, `confirmApproveSchedule`, `cancelApproveModal`
- Stub-файлы (минимальный placeholder GlassCard):
  - `InspectControlPanel.tsx` — «Control panel — C-11»
  - `HitlToolbar.tsx` — «HITL actions — C-12»
- Зависимости: добавить `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (сейчас **нет** в `package.json`).
- Motion: лёгкий entrance shell / mode crossfade; spring `{ damping: 25, stiffness: 300 }`; `useReducedMotion`.
- UI primitives: `GlassCard`, `NeonBadge`, `ReactiveButton` где уместно.

## Out of scope

- Virality / hook chips / script editor / HeyGen selects → **C-11**.
- Reroll slide UX / Approve & Schedule modal → **C-12** (actions в store уже есть, UI — нет).
- BullMQ, HeyGen API, Prisma, Remotion render, SSE, real media upload.
- Изменение `AppShell` / Sidebar / RBAC.
- Analytics / Mesh.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Route + left deck + mock/store + stubs | Frontend | paths ниже |
| Soft entrance / mode toggle | Motion | inspect components only |
| API | — | нет |
| QA | Tester → Fixer | route 200; mode toggle; DnD reorder; Armenian glyphs |
| Localhost | Deployer | `:3000/studio/inspect/demo` |
| Приёмка | Client | левая дека видна; полный S2 после C-11/C-12 |

## Contracts

### Mock / store shape (`InspectDraft`)

```ts
type PreviewMode = "reels_9_16" | "carousel_4_5";
type InspectStatus = "awaiting_signoff" | "approved" | "scheduled";

type KaraokeLine = {
  startSec: number;
  endSec: number;
  textHy: string;
  textRu: string;
  highlightHy?: string;
};

type CarouselSlide = {
  id: string;
  order: number;          // 0..7 visual index after sort
  badge: string;          // "01·HOOK", "08·CTA", …
  filename: string;
  imageUrl?: string;
  version: number;        // ++ on reroll (C-12 visible change)
};

type HookOption = {
  id: string;
  text: string;
  retentionHint: string;
  score: number;
};

type PersonaState = {
  avatarId: string;       // anna | gevorg | lilit | aram
  emotion: string;        // warm | energetic | documentary | soft
  voiceId: string;
  speechRate: string;     // slow | natural | fast
};

type InspectDraft = {
  id: string;
  jobLabel: string;       // e.g. #JOB-8842
  pipelineName: string;
  status: InspectStatus;
  scheduledAt: string | null;
  approveModalOpen: boolean;
  previewMode: PreviewMode;
  reels: {
    durationSec: number;
    currentTimeSec: number;
    playing: boolean;
    posterUrl: string;
    captions: KaraokeLine[];
  };
  slides: CarouselSlide[];
  selectedSlideId: string;
  viralityScore: number;
  hooks: HookOption[];
  activeHookId: string;
  script: string;
  persona: PersonaState;
};
```

Seed: 8 slides, ≥3 hooks, Armenian caption sample matching Stitch tone. `id` from route или fallback `demo`.

### UI

- Left ~55% (`lg:col-span-7`), right ~45% (`lg:col-span-5`).
- Mode toggle mutually exclusive; carousel strip может оставаться под плеером (как Stitch) **или** заменять viewport — выбрать один UX в FE, зафиксировать в `decisions.md` Role log; рекомендация Architect: **toggle заменяет главный viewport**, strip всегда видим снизу для DnD (Stitch-like).
- Karaoke: active word underline/accent; шрифт `--font-hy`.
- DnD: `@dnd-kit/core` + `@dnd-kit/sortable`; после drop обновить `slides[].order` и UI порядок.

### Wave order

1. **Frontend C-10** первым (обязательно).  
2. Motion C-10 → Tester…Client C-10 (или QA отложить до конца волны — решает Оркестратор).  
3. Затем Frontend C-11 → … → Frontend C-12.

**Запрет:** параллельный FE C-10/C-11/C-12 на одних и тех же файлах.

## Acceptance criteria (язык Клиента)

1. Открывается `http://127.0.0.1:3000/studio/inspect/demo` — виден split Inspector, не 404.
2. Переключатель **Video Reel (9:16)** / **Carousel Deck** меняет главный превью-блок.
3. В режиме Reels: Play/Pause и scrubber двигают время/прогресс; видны армянские субтитры (глифы не «квадратики»).
4. В карусели: 8 слайдов; перетаскивание меняет порядок; клик выделяет слайд (кольцо/ring).
5. Справа пока заглушки C-11/C-12 — допустимо для приёмки **только** C-10.

## Risks

- DnD внутри горизонтального scroll — нужен `TouchSensor`/`PointerSensor` activationConstraint.
- Armenian font: не подключать второй Google Font — только `--font-hy`.
- Stub right panel не должен ломать layout / вызывать horizontal scroll.

## Mid-flight escalation

Если нужен real video / HeyGen API / отказ от dnd-kit: **стоп** → Оркестратор → Архитектор.
