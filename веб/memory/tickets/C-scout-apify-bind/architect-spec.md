# C-scout-apify-bind — Backend

## Contract

### Scout snapshot SoT

- Module: `lib/studio/scout-snapshot-store.ts`
- Keyed by `moduleId` (+ optional topic norm)
- Fields: `{ competitors: FeedPost[], updatedAt: string, topic?: string, source: "scout" }`
- Persist: in-memory + durable file under `data/scout-snapshots/{moduleId}.json` (create dir; gitignore data/)
- Soft-fail read → empty competitors

### Scout run entrypoint

- `POST /api/studio/[moduleId]/scout/run`
- Body (optional): `{ topic?, minViews?, minLikes?, minVirality?, lookbackDays? }`
- Calls **only** existing `fetchApifyCompetitorPosts` + module filter + metric filters
- Writes snapshot; returns `{ ok, competitorsCount, updatedAt }`
- Soft-fail if no Apify key → 200 `{ ok:false, error:"scraper_not_configured" }` (no 500)
- Counters: reuse `tryConsumeApifyRunSlot` / S51 limits

### Feed GET — ZERO Apify

- `resolveStudioFeed` / `fetchCarouselLiveFeed` / `fetchCustomReelsLiveFeed`:
  - **Remove** `tryApifyCompetitors` calls
  - Competitors = `readScoutSnapshot(moduleId)` or fixture fallback policy (scraper ON → empty if no snapshot; scraper OFF → fixtures OK)
  - Ours: Graph unchanged (not Apify)
- `?fast=1` unchanged (fixtures/empty)

### Schedule

- Server does **not** need cron in this ticket if FE polls/triggers `POST .../scout/run` on interval when `autoRun`
- Optional: export `shouldRunAutoScout(lastRunAt, frequencyHours)` helper for FE/BE

## Out of scope

- Prisma migration
- Prod deploy
- Changing Apify actor / raising limit beyond S51

## Done when

- Smoke: `GET .../feed` does not call Apify (instrument or code assert no tryApify path)
- Smoke: `POST .../scout/run` writes snapshot; subsequent GET feed returns those competitors
