# Guards — C-36 Live Instagram feed backend

Date: 2026-09-20  
Role: Tester  
Result: **GREEN**

Executable smoke:
```bash
npx tsx scripts/smoke-c36-ig-feed.ts
```

Optional HTTP (localhost):
```bash
curl -s http://127.0.0.1:3000/api/studio/carousel-engine/feed
curl -s http://127.0.0.1:3000/api/studio/heygen-reels/feed
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Mock path smoke always passes (CI-safe; live skipped without token) | GREEN | `SMOKE_C36_MOCK_OK` + `SMOKE_C36_OK` (`SMOKE_C36_LIVE_SKIP` when unconfigured) |
| G2 | Without token: `resolveStudioFeed("carousel-engine")` → `sourceMode: "mock"`, valid FeedResponse shape | GREEN | smoke forced env wipe; HTTP GET `200` + top-level `sourceMode:"mock"` |
| G3 | Other modules (heygen-reels / aesthetic / cartoon) stay fixtures mock — live only carousel-engine | GREEN | smoke `other modules stay mock`; HTTP heygen `200` + all posts `sourceMode:"mock"` |
| G4 | Secret scan: no `access_token` / token values in JSON; `.env.example` placeholders only | GREEN | `assertNoSecrets`; curl body no `access_token`; ripgrep no `EAA`/`IGQ` in studio lib / smoke / `.env.example` |
| G5 | Types: `FeedResponse` + every `FeedPost` require `sourceMode`; fixtures default `"mock"` | GREEN | `lib/studio/feed-types.ts`; `feed-fixtures.ts` `withSourceMode` / `emptyFeed` |
| G6 | In-memory cache module TTL = 10 min | GREEN | `IG_FEED_CACHE_TTL_MS === 10 * 60 * 1000` in `lib/studio/ig-feed-cache.ts` + smoke assert |
| G7 | Route wires `resolveStudioFeed`; no Prisma in feed route | GREEN | `app/api/studio/[moduleId]/feed/route.ts` |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| 1. With token + `IG_USER_ID`: live ours (`sourceMode: "live"`) | SKIP / env-gated — smoke runs live only when `isIgFeedConfigured()`; this run: `SMOKE_C36_LIVE_SKIP` |
| 2. Competitors via `IG_COMPETITOR_USERNAMES` + BD | SKIP / env-gated (same) |
| 3. Without token: mock JSON + `sourceMode: "mock"`, no 500 | GREEN (resolver + HTTP 200) |
| 4. Cache TTL ~10 min (no Graph hammer every reload) | GREEN (module + smoke TTL assert; live cache hit asserted when configured) |
| 5. No secrets in API; `.env.example` placeholders | GREEN |
| 6. Other moduleId feeds no regression | GREEN (heygen-reels HTTP + smoke core modules) |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md` → **C-36**.

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
- No social publish.
- Tokens only via env; never logged or returned in JSON.
