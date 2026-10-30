# C-s51-apify-cost — Apify Instagram Scraper spend RCA

**Date:** 2026-10-14  
**Actor:** `apify/instagram-scraper` (`run-sync-get-dataset-items`)  
**Secrets:** never logged / not in this file.

## 1. Call graph (before fix)

| Layer | Path | What fires Apify? |
|-------|------|-------------------|
| Client | `StudioModuleWorkspace` `useEffect([fetchFeed])` | Every module mount → `GET /api/studio/:id/feed` (no client TTL skip) |
| Client | Topic search | Another GET (`competitors` mode) |
| Client | Window focus | **No** focus listener on feed (good) |
| API | `app/api/studio/[moduleId]/feed/route.ts` | `resolveStudioFeed` unless `?fast=1` |
| Live | `fetchCarouselLiveFeed` / `fetchCustomReelsLiveFeed` | Both call `fetchApifyCompetitorPosts` |
| Scraper | `fetchApifyDatasetRaw` | **2×** `runApifyOnce` (`resultsType: posts` + `reels`), each `resultsLimit: 50` |

AI Bridge / Razbor open / agent-start: **do not** call Apify (grep confirmed — feed route only).

## 2. Run-sync counts (plausible scenarios)

Assumptions: server process cold (empty in-memory cache), same niche hashtag, `resultsLimit=50`.

| Event | Client GETs | Apify run-sync POSTs | Max billed items |
|-------|-------------|----------------------|------------------|
| Page load carousel | 1 (Strict Mode often **2** aborted/raced) | **2** (posts+reels); Strict Mode race → up to **4** before dedupe | 100–200 |
| Module switch → reels | +1 | **0** if raw cache warm; else **2** again | 0–100 |
| Manual refresh / remount after TTL | +1 | **2** | 100 |
| Topic change (new hashtag) | +1 | **2** (new cache key) | 100 |
| Carousel + reels both cold (parallel tabs) | 2 | **4** without in-flight share; **2** with shared raw key + in-flight | 100–200 |

**Strict Mode:** React 18 double-mounts effects in dev → two overlapping FETs; without in-flight dedupe both miss TTL and both pay.

**Dev HMR / `next dev` restart:** clears process memory → every reload = cold miss.

## 3. resultsLimit

- Constant `APIFY_IG_RESULTS_LIMIT = 50` (≤50 canon).
- UI target ~12 posts, but each miss still bills up to **50 posts + 50 reels = 100 results**.
- One raw dataset is filtered per module (carousel vs VIDEO) — correct reuse design; cost is on the **raw** miss, not on filter.

## 4. Pricing order of magnitude (public)

Source: [apify/instagram-scraper pricing](https://apify.com/apify/instagram-scraper/pricing) (PPE — pay per result; platform CU not charged separately for this actor).

| Plan | ≈ $/1000 results |
|------|------------------|
| Free | **$2.70** |
| Starter | **$2.30** |
| Scale | **$1.90** |
| Business | **$1.50** |

Cost per full miss (100 results): ≈ **$0.23–$0.27**.

## 5. Why ~$5 in ~2 days is plausible

Worked example (Free $2.70/1k):

- $5 ÷ $0.0027 per result ≈ **~1850 results**.
- At 100 results/miss → **~18–19 full scrapes**.
- Or ~9–10 scrapes if Strict Mode / dual-module doubled some days.

Typical local/dev pattern over 2 days:

- 8–15 Studio reloads (HMR / Strict Mode) × 2 runs  
- carousel ↔ reels switches while cache cold  
- a few topic searches  

→ easily **15–25** paid full scrapes ≈ **$4–$7** on Free/Starter. User subjectively “scraped once”; system scraped on every cold mount.

## 6. Monthly estimate — ops intent «10 top carousels + 10 reels daily»

### Disciplined (after S51)

Assumptions:

- **1 niche refresh/day** → 1 cache miss → 2 run-sync (posts+reels).
- Prefer displaying top **10** of each type from the same raw (limit still ≤50 for quality headroom).
- Client 30 min TTL + server Apify raw 30 min + in-flight dedupe + `maxRunsPerHour` default 24.
- Carousel + reels share raw cache → **no second paid fetch** same day if within TTL / same process.

| Metric | Value |
|--------|-------|
| Results/day (worst bill at limit 50×2) | ≤100 |
| Results/month | ≤3000 |
| $ @ Free $2.70/1k | **≈ $8.1** |
| $ @ Starter $2.30/1k | **≈ $6.9** |
| $ if later capped to 10+10 results/day | **≈ $1.4–$1.6** |

**User-facing band (disciplined):** roughly **$2–$10 / month** depending on plan and whether `resultsLimit` stays at 50 or is lowered toward 10–15.

### Undisciplined (pre-S51 spam)

| Metric | Value |
|--------|-------|
| Runs/day | 20–100+ (TTL 10m remounts, Strict Mode, dual module) |
| Results/month | 60k–300k+ |
| $ | **easily $50–$500+** band; **~$5 / 2 days** sits at the low end of spam |

## 7. Fixes shipped (this ticket)

1. **Server Apify raw TTL 30 min** (`APIFY_RAW_CACHE_TTL_MS`) — Graph feed TTL stays 10 min.  
2. **In-flight dedupe** (`getOrCreateInFlight`) — Strict Mode / parallel modules share one Promise.  
3. **HIT/MISS logs** without token.  
4. **`tryConsumeApifyRunSlot`** — default **24** run-sync/hour (`APIFY_IG_MAX_RUNS_PER_HOUR`).  
5. **Client TTL 30 min** — `shouldSkipFeedNetworkFetch`: no refetch on remount when live cache fresh; **no** focus refetch added.  
6. Topic search still forces network (intentional).

## 8. Recommendations

1. Keep **one raw scrape / niche / day** in prod ops; raise TTL to 6–24h if “top of niche” is enough.  
2. Optionally lower `APIFY_IG_RESULTS_LIMIT` to **15–20** once UI quality OK (still ≤50).  
3. Prefer **one process** or Redis shared cache in multi-instance deploy (in-memory does not share across workers).  
4. Dev: set `USE_FEED_FIXTURES=1` or unset scraper key when iterating UI.  
5. Watch Apify console “results” not “runs only” — each run-sync bills items.  
6. Never wire Apify into AI Bridge tools / Razbor bootstrap.
