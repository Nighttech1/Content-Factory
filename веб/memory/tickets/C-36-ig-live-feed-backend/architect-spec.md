# Architect spec — C-36

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Backend: для модуля **`carousel-engine`** отдавать **живой** Instagram feed (наши карусели `mosarmclub` + карусели конкурентов) через **Graph API + Business Discovery**, с метриками и `slideUrls` (children). При отсутствии токена / ошибке API — soft-fail на fixtures + `sourceMode: "mock"`. Без HTML scrape. Без Prisma в этой волне.

## Depends

- **C-35** AI Bridge pack/spec done (agent contract for live metrics / handles).
- Existing: `lib/studio/feed-types.ts`, `lib/studio/feed-fixtures.ts`, `GET /api/studio/[moduleId]/feed`, `lib/analytics/adapters/instagram-graph.ts` (insights pattern / token read).

## In scope

### 1. Type contract extension (`feed-types.ts`)

```ts
export type FeedSourceMode = "live" | "mock";

export type FeedPost = {
  id: string;
  source: "ours" | "competitor";
  title: string;
  thumbUrl?: string;
  metrics: { likes: number; views: number; comments?: number };
  topicTags?: string[];
  /** Wave live-ig */
  sourceMode: FeedSourceMode;
  externalId?: string;       // IG media id
  permalink?: string;
  username?: string;
  mediaType?: string;        // e.g. CAROUSEL_ALBUM | IMAGE | VIDEO
  slideUrls?: string[];      // children image/video preview URLs for carousels
};

export type FeedResponse = {
  ours: FeedPost[];
  competitors: FeedPost[];
  sourceMode: FeedSourceMode; // aggregate: "live" if any side live; prefer top-level + per-post
};
```

**Invariant:** every `FeedPost` always has `sourceMode`. Fixtures updated to `"mock"`. Top-level `FeedResponse.sourceMode` mirrors resolver outcome (`live` only when at least ours or competitors successfully loaded live; partial: see Decisions).

### 2. Config (env only — document in `.env.example`)

| Key | Purpose |
|-----|---------|
| `INSTAGRAM_ACCESS_TOKEN` / `INSTAGRAM_GRAPH_TOKEN` / `IG_ACCESS_TOKEN` | existing token (any one) |
| `IG_USER_ID` | Instagram Business/Creator user id for **ours** media listing |
| `IG_OURS_USERNAME` | default `mosarmclub` |
| `IG_COMPETITOR_USERNAMES` | comma-separated; product owner fills real handles |

Seed guidance in `.env.example` comments: 2–3 placeholder Armenian-club-niche handles **or** leave empty (empty competitors + live ours = OK).

### 3. Live feed module (new)

Suggested paths (Backend may adjust names, keep layer clear):

- `lib/studio/ig-feed-config.ts` — read env, parse usernames, `isIgFeedConfigured()`
- `lib/studio/ig-feed-cache.ts` — module singleton Map, TTL **5–15 min** (pick **10 min** default)
- `lib/studio/ig-live-feed.ts` — Graph + Business Discovery fetch → `FeedPost[]`
- Wire: `resolveFeed` **or** new `resolveStudioFeed` used by route

**Resolver rules**

| Condition | Behaviour |
|-----------|-----------|
| `moduleId !== "carousel-engine"` | unchanged fixtures / empty custom (no live) |
| `carousel-engine` + configured (`token` + `IG_USER_ID`) | attempt live ours; competitors if usernames non-empty |
| Live success | `sourceMode: "live"` on posts + response |
| Any IG error / missing token | `console.warn` (no token value) + fixture fallback for **that side**; response may be `mock` or partial per Decisions |

**Do not** require BullMQ / Redis for this wave — on-demand pull + in-memory cache.

### 4. Graph API usage (official only)

**Ours** (authenticated user media):

- `GET /{IG_USER_ID}/media` with fields e.g.  
  `id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count,timestamp,children{media_url,media_type,thumbnail_url}`
- Filter prefer `CAROUSEL_ALBUM` (still allow IMAGE if needed for grid density — Decision: prefer carousels first, fill with IMAGE if &lt; N).
- Map `like_count` → `metrics.likes`; `comments_count` → `comments`; `views`: use insights if cheap/cached **or** `0` / reach best-effort — **Decision D2** in `decisions.md`.
- `thumbUrl` = `thumbnail_url` \|\| `media_url`; `slideUrls` from children.

**Competitors** — Business Discovery:

- `GET /{IG_USER_ID}?fields=business_discovery.username({username}){media{...}}`  
  (same media subfields as feasible under BD permissions)
- One request per competitor username (or batched if API allows); respect rate limits via cache.

Reuse token-read helper pattern from `instagram-graph.ts` (extract shared `readIgToken()` to `lib/analytics/adapters/ig-token.ts` **or** duplicate minimal private helper — prefer small shared util, no behaviour change to analytics cron required).

### 5. API route

`GET /api/studio/[moduleId]/feed`:

- Call extended resolver.
- Never return access_token in JSON.
- Keep 404 / custom empty behaviour.

### 6. Soft-fail

- HTTP non-OK, missing permissions, BD user not found → warn + fixtures for that side.
- Partial: live ours + mock competitors (or vice versa) allowed; set per-post `sourceMode`; top-level `sourceMode: "live"` if **any** post live, else `"mock"`.

### 7. Smoke

- `scripts/smoke-c36-ig-feed.ts` (or similar): types/fixtures always; live path skipped unless env configured (CI-safe).

## Out of scope

- UI badge / Razbor slide wiring — **C-37**.
- Agent markdown (done in C-35).
- Prisma schema / migrate / Redis persistence of feed.
- HTML scraping, Puppeteer IG login.
- Writing to social publish APIs.
- Changing analytics cron beyond optional shared token util.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Types + resolver + Graph client + cache + route + env.example | Backend | skills: `backend`; mirror IG adapter soft-fail |
| BullMQ | — | **not** required |
| AI Bridge | — | already C-35 |
| Frontend | — | C-37 |

## Acceptance criteria (Client language)

1. С токеном + `IG_USER_ID`: `/api/studio/carousel-engine/feed` отдаёт посты `mosarmclub` с реальными превью/цифрами и `sourceMode: "live"` (ours).
2. С заполненным `IG_COMPETITOR_USERNAMES` и правами BD: competitors непустые, реальные media + metrics.
3. Без токена: прежний mock UX JSON + `sourceMode: "mock"`, Studio не 500.
4. Повторный запрос в пределах TTL не долбит Graph на каждый reload (cache hit).
5. В ответе API нет секретов; `.env.example` содержит новые ключи-плейсхолдеры.
6. Другие moduleId feed — без регрессии.

## Risks

| Risk | Mitigation |
|------|------------|
| Token missing / expired | Soft-fail fixtures + warn |
| Business Discovery not enabled / wrong account type | Empty competitors + warn; ours may still live |
| Rate limits | 10 min TTL cache; limit competitor count (document max ~5) |
| `views` not on media object | D2: likes/comments primary; views from insights best-effort or 0 |
| Media URL expiry | Accept short-lived CDN URLs; cache TTL ≤ 15 min |
| Prisma temptation | **Escalate avoid** — env + memory only this wave |

## Escalate?

- Prisma **not** required. If product later wants history of competitor snapshots → new ticket.
