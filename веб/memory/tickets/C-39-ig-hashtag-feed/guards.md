# Guards — C-39 IG Hashtag top_media competitor feed

Date: 2026-09-21  
Role: Tester  
Result: **GREEN**

Executable smoke:
```bash
npx tsx scripts/smoke-c39-ig-hashtag-feed.ts
```

Observed this run:
```
SMOKE_C39_MAPPER_OK
SMOKE_C39_SOFT_FAIL_OK
SMOKE_C39_LIVE_SKIP (set token + IG_USER_ID for live hashtag feed)
SMOKE_C39_OK
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Mapper empty topic → niche defaults (`emptyTopic: true`) | GREEN | `mapTopicToHashtags("")` + `IG_NICHE_DEFAULT_HASHTAGS`; env override via `IG_DEFAULT_HASHTAGS` |
| G2 | Mapper non-empty → aliases + niche anchors; ≤5 tags; Graph query ≤3 | GREEN | guest/food/unknown cases; `hashtagsForGraphQuery` ≤ `TOPIC_HASHTAGS_QUERY_MAX` |
| G3 | Cache key = igUserId + normalized topic + sorted hashtags (stable) | GREEN | `igFeedCacheKeyCompetitors` keyA === keyB |
| G4 | `ig-live-feed`: primary = `ig_hashtag_search` + `top_media` (+ optional `recent_media`); wires `mapTopicToHashtags` | GREEN | source asserts + `fetchCompetitorsByHashtags` before BD |
| G5 | BD / `IG_COMPETITOR_USERNAMES` = **fallback only** when hashtag path yields 0 | GREEN | `fetchAllCompetitors` returns hashtag posts first; BD only via `fetchCompetitorsBdFallback` |
| G6 | Soft-fail without token: mock feed, competitors present (empty + with topic), no 500 | GREEN | forced env wipe → `sourceMode: "mock"` |
| G7 | `.env.example` has `IG_DEFAULT_HASHTAGS`; competitor usernames marked OPTIONAL fallback | GREEN | lines with defaults + «OPTIONAL fallback only» |
| G8 | No scrape client; no secrets in response JSON | GREEN | no cheerio/puppeteer IG; no `access_token` in feed JSON |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| 1. With token: competitors via hashtag top_media by topic | SKIP / env-gated — `SMOKE_C39_LIVE_SKIP` this run |
| 2. Empty topic → niche default hashtags (env or hardcoded) | GREEN (mapper + config) |
| 3. Without token: mock/fixtures, not 500 | GREEN |
| 4. Ours unchanged (`IG_USER_ID` media path) | GREEN (competitors branch only; ours path untouched in review) |
| 5. `.env.example` `IG_DEFAULT_HASHTAGS`; usernames optional fallback | GREEN |
| 6. Guard: mapper + soft-fail smoke; live optional | GREEN (`scripts/smoke-c39-ig-hashtag-feed.ts`) |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md` → **C-39**.

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
- No social publish.
- Tokens only via env; never logged or returned in JSON.
- Live Graph optional — CI must not fail without token.
