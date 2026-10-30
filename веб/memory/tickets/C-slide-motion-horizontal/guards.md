# Guards — C-slide-motion-horizontal

Wave: `W-2026-10-14-razbor-live-boards` · Scenario: **S48.C** (L/R motion)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `data-motion="s48-horizontal"` on feed / Razbor / Create preview. |
| G2 | Slide change uses horizontal `x` travel (+ light opacity), not opacity-only flash. |
| G3 | `prefers-reduced-motion` cuts travel. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
# Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK
```

Live Client: L/R visible horizontal travel.

## Class of defect

Opacity-only swap; black gap; no reduced-motion cut.
