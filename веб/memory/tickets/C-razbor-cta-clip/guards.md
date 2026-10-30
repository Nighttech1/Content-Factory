# Guards — C-razbor-cta-clip

Wave: `W-2026-10-14-razbor-live-boards` · Scenario: **S48.B** (Разбор CTA)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Footer `overflow-visible` + safe `pb` so **«Разбор»** never clipped. |
| G2 | CTA label **white** (`text-white`). |
| G3 | `data-testid="razbor-btn"` present on competitor cards. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
# Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK
```

Live Client: scroll to lower cards @1440 — «Разбор» fully visible.

## Class of defect

Clipped CTA; gray/non-white label; CTA only on hover.
