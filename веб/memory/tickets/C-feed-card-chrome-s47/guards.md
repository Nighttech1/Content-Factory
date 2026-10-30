# Guards — C-feed-card-chrome-s47

Wave: `W-2026-10-14-carousel-ui-marketing` · Scenario: **S47.A** (feed card chrome)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | No workspace badge «Онлайн · Instagram» / «Демо-данные» on feed (`feed-source-badge` removed). |
| G2 | No «Конкуренты»/«Наши» **tags on card**; column titles may remain. |
| G3 | No bottom caption / post title under photo on card. |
| G4 | Top-left **black plaque** + white Century Gothic username (`feed-username-plaque`). |
| G5 | Bottom-center **on-photo** engagement row (`feed-engagement-row`): views · likes · comments · shares · saves, CG. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-carousel-ui-marketing.ts
# Expect: SMOKE_W_2026_10_14_CAROUSEL_UI_MARKETING_OK
```

Live Client: **S47.A** Playwright @1440 `/studio/carousel-engine`.

## Class of defect

Badge/tags/caption chrome return; metrics only under card; Inter on username/metrics; missing plaque.
