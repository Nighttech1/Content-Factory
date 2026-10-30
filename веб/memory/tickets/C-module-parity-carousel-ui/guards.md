# Guards — C-module-parity-carousel-ui

Wave: `W-2026-10-14-razbor-live-boards` · Scenario: **S48.E** (module parity)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Shared `FeedPostCard` / `VerticalPostCarousel` — no module-specific plaque forks. |
| G2 | Same plaque/metrics/«Разбор» chrome on ≥2 non-carousel modules. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
# Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK
```

Live Client: open `custom-reels` (+ graphics) — same feed chrome.

## Class of defect

Pre-S47/S48 chrome on non-carousel modules; forked FeedPostCard clones.
