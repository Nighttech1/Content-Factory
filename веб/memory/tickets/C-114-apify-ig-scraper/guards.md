# Guards — C-114…C-117 (W-2026-10-09-ig-scraper-live)

**Date:** 2026-10-09  
**Smoke:** `npx tsx scripts/smoke-c114-apify-ig-scraper.ts`  
**Tester:** soft-fail path PASS (earlier); **live Apify feeds PASS** after key + Deployer restart (G-live-1…8)

## Executable checks

| # | Check | How | Result |
|---|--------|-----|--------|
| G1 | Mapper + type split + popularity sort | Smoke `MAPPER_OK` | **PASS** |
| G2 | Cache key shape (raw + module) | Smoke `CACHE_KEYS_OK` | **PASS** |
| G3 | `.env.example` documents `IG_SCRAPER_*` | Smoke `ENV_EXAMPLE_OK` | **PASS** |
| G4 | Config reads token without logging value | Smoke `CONFIG_OK len=…` (no secret in stdout) | **PASS** |
| G5 | Soft-fail when Apify auth fails | Smoke `LIVE_AUTH=fail` still exits 0 + `SMOKE_C114_OK` | **PASS** |
| G6 | Smoke exit code | process exit 0 | **PASS** |
| G7 | `GET /api/studio/carousel-engine/feed` | HTTP 200; JSON `{ ours[], competitors[] }` | **PASS** (200) |
| G8 | `GET /api/studio/custom-reels/feed` | HTTP 200; JSON `{ ours[], competitors[] }` | **PASS** (200) |
| G9 | No token leakage in feed bodies | No `IG_SCRAPER_API_KEY` / Bearer / apify token / long `token` field | **PASS** |
| G10 | Soft-fail feed behaviour (LIVE_AUTH=fail) | Carousel competitors = `mock` (CAROUSEL_ALBUM only); reels competitors empty; no 500 | **PASS** |
| G11 | Module mix lock (sample) | Carousel: no VIDEO competitors; reels: no CAROUSEL/IMAGE | **PASS** |
| G12 | Metrics on competitor cards (mock sample) | likes/comments/views present on carousel sample | **PASS** |

## Smoke stdout (this run)

```
MAPPER_OK
CACHE_KEYS_OK
ENV_EXAMPLE_OK
CONFIG_OK len=92 base=https://api.apify.com
LIVE_AUTH=fail
SMOKE_C114_OK
```

Exit: **0**

## Feed HTTP (localhost)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `http://127.0.0.1:3000/api/studio/carousel-engine/feed` | **200** | `oursN=22` `compN=22` `sourceMode=mock` `mediaTypes=[CAROUSEL_ALBUM]` |
| `http://127.0.0.1:3000/api/studio/custom-reels/feed` | **200** | `oursN=0` `compN=0` (empty competitors on soft-fail) |

## Live pass (after valid Apify key + Restart) — 2026-10-09 ~18:54 MSK

**Deployer:** killed :3000, `npm run dev` → Ready in 5.2s (Environments: `.env`). DB/Redis/media untouched.

**HTTP (long timeout ≤300s; cold Apify ~11s carousel, ~0.6s reels cached):**

| # | Check | Result |
|---|--------|--------|
| G-live-1 | `GET /api/studio/carousel-engine/feed` HTTP 200 | **PASS** |
| G-live-2 | carousel `sourceMode=live`, competitors ≥1 (N=21), ours=22 | **PASS** |
| G-live-3 | carousel mediaType only `CAROUSEL_ALBUM` / `IMAGE` (13+8); **no VIDEO** | **PASS** |
| G-live-4 | carousel competitor `metrics.likes` present; unique likes ≥2 (19 distinct); not mock-only fixture | **PASS** (top likes e.g. 122 / 119 / 100) |
| G-live-5 | `GET /api/studio/custom-reels/feed` HTTP 200 | **PASS** |
| G-live-6 | reels `sourceMode=live`, competitors ≥1 VIDEO (N=27) | **PASS** |
| G-live-7 | reels `metrics.views` and/or `likes` present | **PASS** (top e.g. likes=3337 views=283428) |
| G-live-8 | Feed bodies contain **no** `apify_api` / `IG_SCRAPER` substrings | **PASS** |

Sample metrics only (no URLs/tokens): carousel top likes `122,119,100,97,72`; reels top `likes/views` `3337/283428`, `992/8353`, `662/7235`.

## Not verified this run

- Client Playwright S-scenarios / badge chrome (Client role) — optional after live green.

## Verdict for wave close

Engineering guards for **soft-fail / mock path**: **green** (G1–G12).  
**Live competitor path:** **green** (G-live-1…G-live-8) after valid Apify key + Deployer restart.
