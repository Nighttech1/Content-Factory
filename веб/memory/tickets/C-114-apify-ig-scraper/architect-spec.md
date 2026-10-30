# Architect spec — C-114 (wave W-2026-10-09-ig-scraper-live)

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.
>
> **ID lock:** тикеты волны = **C-114…C-117**. Не использовать C-107…C-110 (заняты UX-8 mesh/schedule).

## Goal

Колонка **«Конкуренты»** в Studio для `carousel-engine` и `custom-reels` заполняется ~50 публичными постами ниши через **Apify Instagram Scraper**, с разделением каруселей vs рилсов, сортировкой по популярности и реальными метриками. При успешном scrape — **без** демо-конкурентов в ответе. Soft-fail без 500.

## Wave ticket map

| ID | Scope |
|----|--------|
| **C-114** | Apify client: actor run, auth via env, fetch `resultsLimit: 50`, hashtag niche, cache, no secret logging |
| **C-115** | Map Apify items → `FeedPost`; type split CAROUSEL vs VIDEO; popularity sort |
| **C-116** | Wire `resolveStudioFeed` for `carousel-engine` + `custom-reels`; clear mock competitors when live OK |
| **C-117** | Frontend: badge + metrics chrome for live competitors (no browser Apify); dual-feed without mock merge |

Umbrella folder: `memory/tickets/C-114-apify-ig-scraper/` (этот spec + `chain.md` на всю волну).

## Depends

- Trainer grade: `memory/trainer/W-2026-10-09-ig-scraper-live-grade.md` (B+)
- Skills: `backend` § Live Instagram scraper, `content-pipeline-agents` path B, `content-factory-ui` § Live competitors
- Existing contracts: `lib/studio/feed-types.ts`, `ig-live-feed.ts` (`resolveStudioFeed`), `ig-feed-cache.ts`, `topic-hashtags.ts`, `GET /api/studio/[moduleId]/feed`
- Env names only: `IG_SCRAPER_API_KEY`, optional `IG_SCRAPER_BASE_URL`; niche via `IG_DEFAULT_HASHTAGS` / mapper

## Locked decisions

### D1 — Actor & transport

| Lock | Value |
|------|--------|
| Actor id | **`apify/instagram-scraper`** (API slug `apify~instagram-scraper`) |
| Endpoint (default) | `POST {base}/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items` |
| Default base | `https://api.apify.com` |
| Override | `IG_SCRAPER_BASE_URL` if set (full base **or** full actor run URL — Backend documents chosen rule in code comment; must not hardcode secrets) |
| Auth | Apify token from `IG_SCRAPER_API_KEY` (query `token=` **or** `Authorization: Bearer` — one style; never echo value) |
| `resultsLimit` | **50** |
| Mode | Hashtag posts via `directUrls` explore-tags + `resultsType: "posts"` |
| URL | `https://www.instagram.com/explore/tags/{bare}/` from topic mapper / defaults (primary tag; ≤3 spirit via mapper) |
| Note | Actor `search`+`searchType:hashtag` often returns `no_items` — **locked** to `directUrls` (same actor) |

Example input (illustrative — no secrets):

```json
{
  "directUrls": ["https://www.instagram.com/explore/tags/armenianclub/"],
  "resultsType": "posts",
  "resultsLimit": 50
}
```

Server-only. Browser / Client components **never** call Apify.

### D2 — Hashtag niche

Reuse `mapTopicToHashtags` / `hashtagsForGraphQuery` + `IG_DEFAULT_HASHTAGS` / `IG_NICHE_DEFAULT_HASHTAGS` (`armenianclub`, `yerevan`, `armenianfood`, `guestnight`). Empty topic → niche defaults. No LLM.

### D3 — Map Apify → `FeedPost`

| Apify field(s) | `FeedPost` |
|----------------|------------|
| `id` / `shortCode` | `externalId`; `id` = `ig-competitor-{externalId}` (stable) |
| `type` / `productType` / children | see D4 → `mediaType` |
| `caption` | `title` (first line, truncate ~120) |
| `displayUrl` / `thumbnailUrl` | `thumbUrl` |
| `videoUrl` (when video) | `mediaUrl` optional |
| `childPosts` / `images` URLs | `slideUrls` when multi |
| `likesCount` | `metrics.likes` |
| `commentsCount` | `metrics.comments` |
| `videoViewCount` \|\| `videoPlayCount` | `metrics.views` (else `0`) |
| `ownerUsername` | `username` |
| `url` / permalink | `permalink` |
| — | `source: "competitor"`, `sourceMode: "live"` |

**Popularity (sort key, desc):**  
`likes + comments + (views || plays || 0)`  
where views/plays come from the same Apify view/play fields used in metrics.

### D4 — Type map & module split

| Apify signal | `mediaType` | Goes to |
|--------------|-------------|---------|
| `type: "Sidecar"` **or** `childPosts.length > 1` | `CAROUSEL_ALBUM` | **`carousel-engine` competitors** |
| `type: "Video"` / Reel / Clips / `productType` reel-like | `VIDEO` | **`custom-reels` competitors** |
| `type: "Image"` (single, no multi children) | `IMAGE` | **optional backfill** for carousel-engine only if after Sidecar filter count is thin; **never** into custom-reels |

Hard rules:

- `carousel-engine` competitors = **only** carousels (+ optional IMAGE backfill). **No VIDEO/reels.**
- `custom-reels` competitors = **only** VIDEO/reels. **No Sidecar/IMAGE.**
- One Apify fetch (~50) may be shared/cached raw; filter **per module** after map.

### D5 — Wire & clear mock

Priority for **competitors**:

1. If `IG_SCRAPER_API_KEY` set → call Apify (cache-aware).
2. If after filter the module gets **≥1** live competitor → `competitors = that list only`. **Do not merge** fixture/mock competitors. Graph hashtag competitors **not** merged into the same list.
3. Soft-fail (no key / HTTP 4xx/5xx / timeout / empty dataset / empty after filter):
   - **`carousel-engine`:** keep today’s path — Graph competitors if configured, else **fixtures** (`sourceMode: "mock"` for those posts).
   - **`custom-reels`:** keep today’s path — **`emptyFeed()`** competitors (empty list), not carousel fixtures.
4. **Ours:** unchanged this wave — Graph when configured, else fixtures / empty. Partial live (live competitors + mock ours) allowed; aggregate `sourceMode` via `aggregateFeedSourceMode`.

`resolveStudioFeed` must special-case **`custom-reels`** (today `isCustomModuleId` → empty). Other `custom-*` modules stay empty.

Route stays `GET /api/studio/[moduleId]/feed?topic=` → `resolveStudioFeed`. Never 500 for missing scraper key.

### D6 — Cache

Reuse `lib/studio/ig-feed-cache.ts` (`getCached` / `setCached`, TTL `IG_FEED_CACHE_TTL_MS` = 10 min).

New key helper(s), e.g.:

- raw scrape: `apify:ig-scraper:h={sortedTags}:limit=50`
- per-module filtered: `apify:competitors:{moduleId}:t={topic}:h={tags}`

Do not put token in cache keys. Graph ours keys unchanged.

### D7 — Secrets & logging

- **Never** log, return, or write `IG_SCRAPER_API_KEY` (or Graph tokens) to responses, tickets, skills, console beyond `KEY_OK len/prefix` style probes.
- `.env.example`: placeholder names only.
- Optional probe: `scripts/probe-ig-scraper.ts` (status + sample field names; no key dump).

### D8 — Frontend (C-117)

- Consume existing `FeedResponse.sourceMode` → badge `feed-source-badge` («Онлайн · Instagram» / «Демо-данные»).
- Show `metrics.likes` / `comments` / `views` on competitor cards (already in `FeedPostCard` — verify live path).
- Same dual-feed chrome for `custom-reels` when feed non-empty.
- **Forbidden:** calling Apify from browser; Settings UI for Apify this wave; merging mock competitors client-side when API returned live.

## In scope

| # | Work | Ticket |
|---|------|--------|
| 1 | Config reader for scraper env; Apify client; hashtag search run; cache | C-114 |
| 2 | Mapper + popularity sort + module filters | C-115 |
| 3 | `resolveStudioFeed` / `ig-live-feed` wire for both modules; soft-fail | C-116 |
| 4 | Workspace badge/metrics parity; no mock merge | C-117 |
| 5 | Smoke + guards | Tester |
| 6 | `.env.example` placeholders | Backend |

## Out of scope

- Prisma / Redis persistence of scrape history
- Publishing to Instagram; HITL publish
- Changing Analytics / Mesh / UX-8 tickets
- HTML scrape in browser; Playwright-as-scraper
- AI Bridge pack rewrites (path B already documented)
- VPS/prod deploy (localhost only after Client)
- Replacing Graph **ours** path

## Layers / owners

| Layer | Role | Paths (indicative) |
|-------|------|---------------------|
| Scraper client + map + resolve + cache + env.example + smoke | **Backend** | `lib/studio/ig-apify-scraper.ts` (new), map util, `ig-live-feed.ts`, `ig-feed-cache.ts`, maybe thin `ig-scraper-config.ts`, `app/api/studio/[moduleId]/feed/route.ts` only if needed, `scripts/smoke-c114-*.ts` |
| Badge / metrics / custom-reels workspace consume | **Frontend** | `StudioModuleWorkspace`, feed cards — **no** new provider UI |
| Guards | **Tester** | `memory/tickets/C-114-apify-ig-scraper/guards.md` |
| Green repair | **Fixer** | surgical |
| Localhost | **Deployer** | no VPS |
| Acceptance | **Client** | scenarios below |

**Не звать:** Motion, AI Bridge, WebGL, Coder monolith.

## Path lock

1. Backend completes C-114→C-116 (same feed files — **sequential**, not parallel FE).
2. Frontend C-117 after feed contract stable.
3. Tester → Fixer → Deployer localhost → Client.
4. Do **not** parallelize Backend `ig-live-feed` / feed route with Frontend workspace edits.

## Acceptance criteria (Client language)

1. С заданным ключом scraper: в **Карусели** колонка «Конкуренты» показывает живые посты-карусели ниши (не демо-мок), бейдж «Онлайн», на карточках видны лайки / комменты / (просмотры если есть).
2. В модуле **Рилс** (`custom-reels`) «Конкуренты» — только видео/рилсы той же ниши, с реальными цифрами; без карусельных чужих постов.
3. Список конкурентов отсортирован «сначала самые популярные» (лайки+комменты+просмотры).
4. Без ключа или при ошибке scraper: Карусель снова на демо/Graph как раньше; Рилс — пустые конкуренты; приложение не падает (нет 500).
5. В ответах API и логах **нет** токена Apify; UI не знает имя Apify — только live/mock.

## Risks

| Risk | Mitigation |
|------|------------|
| Apify cost / slow sync run | Cache 10 min; `resultsLimit` 50; ≤3 hashtags |
| Actor schema drift (`type` values) | Defensive normalize Sidecar/Video/Image + childPosts |
| CDN URL expiry | TTL ≤ 10–15 min; accept short-lived thumbs |
| Key present but empty niche | Soft-fail per D5; warn without secret |
| Confusion with UX-8 C-107…C-110 | Wave + tickets only C-114+ |
| Mixing Graph + Apify competitors | D5: on Apify success, replace entirely |

## Escalate?

- If Apify actor id/product forces a different actor (`instagram-hashtag-scraper`) for hashtag posts — **stop**, update this spec + chain before coding. Default remains **`apify/instagram-scraper`**.
- Prisma snapshot history → new ticket, not this wave.
