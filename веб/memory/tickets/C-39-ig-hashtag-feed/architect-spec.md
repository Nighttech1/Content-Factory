# Architect spec — C-39

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Competitor side of Studio `carousel-engine` feed discovers posts via official Instagram Graph **Hashtag Search** + **`/{hashtag-id}/top_media`** (optional `recent_media` fallback), driven by `?topic=`. Empty topic → niche default hashtags. Ours feed unchanged (`/{IG_USER_ID}/media`). Soft-fail → fixtures. No HTML scrape.

## Depends

- **C-38** specced (contract + defaults). Prefer C-38 pack merged first; Backend may implement shared util in parallel **only if** contract in C-38 `architect-spec` / decisions is treated as source of truth.
- Existing: `lib/studio/ig-live-feed.ts`, `ig-feed-config.ts`, `ig-feed-cache.ts`, `GET /api/studio/[moduleId]/feed`.

## In scope

### 1. Topic → hashtags util (deterministic)

New shared module e.g. `lib/studio/topic-hashtags.ts` (name flexible):

| Input | Output |
|-------|--------|
| `topic?: string` | `{ topic, hashtags, source: "deterministic_mapper", emptyTopic }` |

Rules (locked with C-38):

1. Empty/whitespace topic → parse `IG_DEFAULT_HASHTAGS` or hardcoded: `armenianclub`, `yerevan`, `armenianfood`, `guestnight`.
2. Non-empty → alias/slug mapper + niche anchors; dedupe; stable order; return ≤5, **query at most 3**.
3. No LLM required.

### 2. Hashtag Graph path

Official endpoints only (v21.0 or current project Graph version):

1. `GET /ig_hashtag_search?user_id={IG_USER_ID}&q={tag}` → hashtag id  
2. `GET /{hashtag-id}/top_media?user_id={IG_USER_ID}&fields=...`  
3. If top_media empty/error for a tag → optional `recent_media` same `user_id` + fields  
4. **`user_id` always = `IG_USER_ID`** (same as ours) — required by Hashtag API

Fields: reuse existing media field set where possible (`id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count,timestamp,children{...}`).

### 3. Selection / ranking

1. Prefer `CAROUSEL_ALBUM`; then backfill `IMAGE`; skip `VIDEO` (same spirit as current `selectPreferredMedia`).
2. Rank by `like_count` descending when available.
3. Cap **~12** competitor posts total across all queried hashtags.
4. Dedupe by media `id`.

### 4. Wire into feed

- `fetchCarouselLiveFeed(topic?)` / competitors branch: **primary** = hashtag discovery.
- Pass `topic` from route query into competitors fetch (already on feed route — ensure live path uses it for hashtags, not only fixture `matchesTopic`).
- Ours: unchanged `/{IG_USER_ID}/media`.

### 5. Optional BD fallback

If hashtag path yields **zero** live posts **and** `IG_COMPETITOR_USERNAMES` non-empty → existing Business Discovery path as **fallback only**.

If neither yields posts → soft-fail fixtures (existing).

Document in `.env.example`:

```
# IG_DEFAULT_HASHTAGS=armenianclub,yerevan,armenianfood,guestnight
# IG_COMPETITOR_USERNAMES=   # OPTIONAL fallback only (Business Discovery); not primary
```

Deprecate comments that imply usernames are required for competitors.

### 6. Cache

- Extend `igFeedCacheKeyCompetitors` (or new key helper) to include **normalized topic + sorted hashtag set** (+ igUserId).
- TTL remain ~10 min (`IG_FEED_CACHE_TTL_MS`).
- Ours cache key unchanged.

### 7. Rate limits (hard)

| Limit | Value |
|-------|-------|
| Hashtags queried per request | max **3** |
| Competitor posts returned | max **~12** |
| Soft-fail | never 500 on missing/expired token; fixtures + `sourceMode: mock` |

### 8. Config surface (`ig-feed-config.ts`)

Extend config type optionally:

- `defaultHashtags: string[]`
- `competitorUsernames` remains but documented fallback

`isIgFeedConfigured()` unchanged: token + `IG_USER_ID`.

## Out of scope

- Researcher pack copy → **C-38**.
- Studio UI empty-topic / copy → **C-40** (Backend must already return niche competitors for empty topic so UI works).
- HTML scraping, unofficial parsers.
- Changing Prisma / Redis volumes.
- Insights / views (keep views=0 per C-36 D2).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Hashtag fetch + mapper + cache + env | **Backend** | Primary implementer |
| Agent docs | AI Bridge (C-38) | Already contracted |
| UI | Frontend (C-40) | Consumes feed |

## Contracts

### `GET /api/studio/carousel-engine/feed?topic=`

| Case | Competitors behaviour |
|------|------------------------|
| No token / bad config | Fixtures; `sourceMode` mock/aggregate as today |
| Token OK, topic empty | Hashtag defaults → top_media → ≤12 posts |
| Token OK, topic set | Mapper hashtags (≤3 queried) → top_media |
| Hashtag empty + usernames set | BD fallback |
| Hashtag empty + no usernames | Fixtures competitors |

Response shape: existing `FeedResponse` (`ours`, `competitors`, `sourceMode`). Competitor posts keep `source: "competitor"`, live fields (`externalId`, `permalink`, `username` — for hashtag posts use hashtag or media owner if API returns; if owner unavailable use `#tag` or `"hashtag:{tag}"` display handle — **decide in decisions.md** at implement time; prefer real username if Graph returns it).

### Invariants

1. No scrape.
2. Hashtag calls always pass `user_id=IG_USER_ID`.
3. Primary ≠ `IG_COMPETITOR_USERNAMES`.
4. Cache key includes topic + hashtags.
5. Data safety: no DB reset, no token logging.

## Acceptance criteria (язык Клиента)

1. С токеном: правая колонка (после C-40) показывает **реальные** топовые посты по хэштегам темы, без ручных ников.
2. Без темы: используются дефолтные нишевые хэштеги (env или hardcoded).
3. Без токена: mock/fixtures, не 500.
4. Ours по-прежнему с нашего `IG_USER_ID` media.
5. В `.env.example` есть `IG_DEFAULT_HASHTAGS`; `IG_COMPETITOR_USERNAMES` помечен optional fallback.
6. Guard: unit/smoke mapper + soft-fail; optional live smoke if token in env (do not fail CI without token).

## Risks

- **Hashtag API permissions:** token must allow hashtag search; soft-fail if denied.
- **Rate / app limits:** max 3 tags/request; cache 10m.
- **BD fallback confusion:** logs/comments must say fallback.
- **Username on hashtag media:** Graph may not return owner; UI must tolerate `#tag` placeholder.
- **Fixture topic filter vs live:** live uses hashtags; fixtures may still `matchesTopic` on soft-fail — OK.

## Mid-flight escalation

If Meta deprecates hashtag endpoints: стоп → Architect. If product demands >3 hashtags/request: new decision (quota). Do not add scrape «temporarily».
