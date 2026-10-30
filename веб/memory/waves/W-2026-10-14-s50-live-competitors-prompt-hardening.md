# S50 — Live competitors + prompt hardening (AI Bridge + Backend)

**Date:** 2026-10-14  
**Roles:** AI Bridge + Backend  
**Trainer:** `memory/trainer/2026-10-14-s50-client-ui-live-grade.md`

## Root cause — competitors showed MOCKS again

Three compounding paths painted **fixture / picsum** competitors as if they were the real feed:

1. **Server soft-fail merge** (`fetchCarouselLiveFeed`): when Apify returned empty/failed (or Graph fallback empty), code **re-seeded `fixture.competitors`** even with `IG_SCRAPER_API_KEY` set — silent mock success.
2. **Client cold paint + 8s abort** (`feed-client-cache`): `bootstrapFeed` always started from fixtures; `FEED_FETCH_TIMEOUT_MS = 8000` aborted before Apify `run-sync` (often ≫8s). Soft-fail kept painted mocks.
3. **localStorage cache** (`cf.studio.feed.cache.v1:carousel-engine`): prior mock responses re-applied on module open via `readFeedCache`.

`?fast=1` also returned full fixtures (C-142 helper) — gated for carousel when scraper configured.

## Fixes

| Area | Change |
|------|--------|
| `ig-scraper-config` | `allowFeedFixtures()` ← `USE_FEED_FIXTURES=1` |
| `ig-live-feed` | When scraper ON and fixtures flag off → **never** competitor fixtures (empty OK) |
| `feed/route` fast path | Same gate for carousel-engine |
| `feed-client-cache` | Bootstrap competitors **empty** for carousel/reels; timeout **120s**; strip stale mock competitor cache |
| `ig-apify-scraper` | Always attach `slideUrls` for CAROUSEL/IMAGE (cover fallback) |
| Prompts | S50 bars: visual_prompt required, incomplete CTA FAIL, Razbor must-consume, Razbor ≥2+2 concrete trainer tasks |
| Smoke | `scripts/smoke-s50-competitors-live-vs-mock.ts` |

## Env (names only)

| Key | Role |
|-----|------|
| `IG_SCRAPER_API_KEY` | Live Apify competitors |
| `USE_FEED_FIXTURES=1` | Explicitly allow mock competitor fixtures (CI/offline) |

## Prompt gaps closed

| Agent | Gap | Closed |
|-------|-----|--------|
| Scriptwriter | Flat hook already locked; missing **visual_prompt**; incomplete CTA; ignore Razbor | Required visual_prompt every slide; incomplete CTA FAIL; must-consume Razbor insights |
| Designer | Draw without visual_prompt; purple/black slop | Gate: STOP without visual_prompt; brandbook 3:5 / no purple-slop |
| Razbor | Vague «улучши» trainer tasks | ≥2 Scriptwriter + ≥2 Designer numbered concrete tasks; CTA 1–4 map |

## Verify

```bash
npx tsx scripts/smoke-s50-competitors-live-vs-mock.ts --direct
npx tsx scripts/smoke-s50-competitors-live-vs-mock.ts --url http://127.0.0.1:3000
```

Expect with scraper key: `competitors live>0` **or** empty WARN — **not** `mock>0` as sole mode.

## Smoke evidence (2026-10-14)

`npx tsx scripts/smoke-s50-competitors-live-vs-mock.ts --direct`:

- `scraperKey=SET`, `USE_FEED_FIXTURES` unset
- Apify `run-sync` → **HTTP 403** (posts+reels) → empty dataset
- **competitors: total=0 live=0 mock=0** → `VERDICT: WARN` (empty, not mock) ✅ S50 policy
- Previously this path re-filled picsum fixtures → Client saw «mocks again»

**Action for live cards:** refresh/fix `IG_SCRAPER_API_KEY` (403 = token rejected). Until then empty competitors is correct; do **not** set `USE_FEED_FIXTURES=1` for Client acceptance.
