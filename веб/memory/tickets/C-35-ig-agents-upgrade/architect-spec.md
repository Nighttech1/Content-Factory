# Architect spec — C-35

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Апгрейд **Researcher** и **Analyst** (агент-пак + skill) так, чтобы пайплайн Razbor / carousel discovery умел опираться на **реальные** Instagram-карусели (наши `mosarmclub` + конкуренты) и **реальные** метрики, когда feed приходит с `sourceMode: "live"`. Без реализации Graph API fetch (это C-36) и без UI (C-37).

## Depends

- Wave `W-2026-09-20-live-ig-carousels` opened.
- Existing packs: `agents/researcher.md`, `agents/analyst.md`, `workers/researcher/`, `workers/analyst/`, skill `content-pipeline-agents`.
- Feed contract extension lands in C-36; **C-35 фиксирует контракт агентов под будущие поля** (типы описать здесь; код типов — Backend в C-36).

## In scope

1. **Researcher pack upgrade**
   - Инструкции: при наличии live feed / competitor posts с `externalId` / `permalink` / `username` / `slideUrls` / metrics — использовать их как факты; не выдумывать URL; не предлагать HTML scrape.
   - Конфиг хендлов (документация в agent notes + skill): наш аккаунт через `IG_OURS_USERNAME` (default `mosarmclub`); конкуренты — `IG_COMPETITOR_USERNAMES` (comma-separated). Секреты токена **не** в agent files.
   - Выход JSON расширить опциональными полями для live context (см. Contracts), без ломки mock-пайплайна.

2. **Analyst pack upgrade (Razbor + analytics)**
   - При `sourceMode: "live"`: инсайты и Razbor Analyst copy **обязаны** цитировать фактические `likes` / `views` / `comments` / число слайдов (`slideUrls.length` или media children count), username, permalink если есть.
   - При `sourceMode: "mock"` или отсутствии метрик: допустим прежний deterministic template / canned algorithm copy (C-30 behaviour).
   - Версия промпта: bump `workers/analyst/VERSION.md` (+ researcher VERSION если появится / создать при отсутствии).
   - Запрет логировать / печатать access tokens.

3. **Skill `content-pipeline-agents`**
   - Секция Live Instagram discovery: Graph API + Business Discovery only; soft-fail → mock; порядок C-35 → C-36 → C-37.
   - Ссылка на env keys (имена, не значения).

4. **Razbor pipeline contract note** (для Backend/FE follow-up)
   - `buildAnalystMessages(post)` должен ветвиться по `post.sourceMode` / наличию live metrics (реализация текста — AI Bridge может поправить helper copy в `lib/studio/razbor-pipeline.ts` **только** deterministic string templates; не трогать fetch).

## Out of scope

- `GET /api/studio/.../feed` live resolver, Graph client, cache — **C-36**.
- Studio dual-column UI / badge — **C-37**.
- Prisma / Redis / BullMQ jobs for feed pull.
- Instagram HTML scraping / unofficial APIs.
- Publish to social networks / HITL bypass.
- Changing Hook Writer / Script Writer / Designer base prompts beyond Analyst→Script cascade input notes (optional one-liner in skill that Scriptwriter receives real metrics context — OK; full rewrite — out).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Agent markdown + worker prompts | AI Bridge | `agents/*`, `workers/researcher/*`, `workers/analyst/*` |
| Skill docs | AI Bridge | `content-pipeline-agents` |
| Razbor Analyst string templates | AI Bridge | `razbor-pipeline.ts` copy only if needed for live/mock branch |
| Types `FeedPost` extension | **not this ticket** | Spec contracts here; code in C-36 |

## Contracts

### Env handle config (documented; read in C-36)

| Key | Required | Default / notes |
|-----|----------|-----------------|
| `IG_OURS_USERNAME` | no | `mosarmclub` |
| `IG_COMPETITOR_USERNAMES` | no | comma-separated; empty → competitors list empty OK if ours live |
| Token keys (existing) | for live | `INSTAGRAM_ACCESS_TOKEN` \| `INSTAGRAM_GRAPH_TOKEN` \| `IG_ACCESS_TOKEN` — never in prompts/logs |

### Agent input context (logical; TS lands C-36)

```ts
/** Subset agents may receive from Razbor / feed */
type IgLiveAgentPostContext = {
  sourceMode: "live" | "mock";
  source: "ours" | "competitor";
  username?: string;
  externalId?: string;
  permalink?: string;
  mediaType?: "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO" | string;
  slideCount: number; // slideUrls?.length ?? 1
  metrics: { likes: number; views: number; comments?: number };
  title: string;
  topicTags?: string[];
};
```

### Researcher output (compat + optional live)

```ts
type ResearcherLiveFindings = {
  trends: string[];
  audience: string;
  sources: Array<{ label: string; url?: string; hypothesis?: boolean }>;
  briefForHookWriter: string;
  /** Present when live competitor/ours posts were in input */
  liveHandles?: { ours: string; competitors: string[] };
  observedPosts?: Array<{
    username?: string;
    permalink?: string;
    likes: number;
    views: number;
    slideCount: number;
  }>;
};
```

### Analyst / Razbor rules

| Mode | Copy rule |
|------|-----------|
| `live` | Must include real numbers from context; no invented likes/views; mention slide count from `slideUrls` when present |
| `mock` | Deterministic C-30 templates OK (picsum / fixture metrics) |

### Secrets

- Never interpolate tokens into prompts, VERSION notes, skill text, or `feedbackLogs`.

## Acceptance criteria (Client language)

1. В `agents/researcher.md` и `agents/analyst.md` явно описан режим live IG (хендлы, метрики, запрет scrape).
2. `workers/analyst/prompt.md` (+ VERSION) требует реальные цифры при live context.
3. Skill `content-pipeline-agents` документирует discovery через Graph/Business Discovery и env keys.
4. Mock-режим Razbor по-прежнему даёт осмысленный deterministic текст (регрессия C-30 не ломается на уровне промпт-контракта).
5. В изменённых файлах нет секретов / примеров реальных токенов.

## Risks

| Risk | Mitigation |
|------|------------|
| Agents hallucinate competitor URLs | Prompt: only use provided permalink; else «гипотеза» |
| Live metrics missing mid-cascade | Treat as mock copy branch |
| Token leaked into prompt pack | Explicit ban + Tester secret scan |

## Escalate?

- Prisma **not** needed. Prefer avoid.
