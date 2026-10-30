# Guards — C-feed-plaque-metrics-s48

Wave: `W-2026-10-14-razbor-live-boards` · Scenario: **S48.B** (feed plaque + metrics)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Top-left plaque `feed-username-plaque` ≈1.5× S47 (`text-[18px]` stack). |
| G2 | Followers `feed-followers-count` via `formatFollowersRu` (`Nk` / `Nк`). |
| G3 | Engagement `feed-engagement-row` ≈2× (`text-[18px]`) with views·likes·comments·shares·saves. |
| G4 | `FeedPost.followers?` typed; fixtures seed when missing. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
# Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK
```

Live Client: **S48.B** Playwright @1440 `/studio/carousel-engine`.

## Class of defect

Tiny plaque/metrics; no followers; missing shares/saves; Inter on plaque.
