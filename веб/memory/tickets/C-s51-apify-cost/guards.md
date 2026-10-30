# C-s51-apify-cost — guards

| ID | Guard | Status | Evidence |
|----|-------|--------|----------|
| G1 | Server Apify raw TTL ≥10 min (shipped 30 min) | GREEN | `APIFY_RAW_CACHE_TTL_MS` in `lib/studio/ig-feed-cache.ts` |
| G2 | In-flight dedupe for identical Apify raw key | GREEN | `getOrCreateInFlight` used in `fetchApifyDatasetRaw` |
| G3 | Client skips network when live cache fresh (TTL) | GREEN | `shouldSkipFeedNetworkFetch` + `StudioModuleWorkspace` mount effect |
| G4 | No window-focus feed refetch | GREEN | No `focus`/`visibilitychange` listener on feed fetch |
| G5 | maxRunsPerHour soft guard | GREEN | `tryConsumeApifyRunSlot` + `APIFY_IG_MAX_RUNS_PER_HOUR` in `.env.example` |
| G6 | resultsLimit ≤50 | GREEN | `APIFY_IG_RESULTS_LIMIT = 50` |
| G7 | No secrets in RCA / logs | GREEN | RCA + `[ig-apify]` logs use tag/type/HIT|MISS only |
| G8 | AI Bridge does not call Apify | GREEN | Grep: scraper only via feed route / `ig-apify-scraper` |

RCA: `memory/waves/W-2026-10-14-s51-apify-cost/apify-cost-rca.md`
