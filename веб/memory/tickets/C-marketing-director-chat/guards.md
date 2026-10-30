# Guards — C-marketing-director-chat

Wave: `W-2026-10-14-carousel-ui-marketing` · Scenario: **S47.D** (Marketing Director)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Route `/marketing` + `MarketingDirectorClient` with projects rail (`marketing-projects-rail`). |
| G2 | Welcome center (`marketing-welcome`) → after first message composer sinks (`marketing-composer-sink`). |
| G3 | Composer = `AIInput`, placeholder «Сообщение», Century Gothic / `--font-ui`. |
| G4 | Live model `anthropic/claude-haiku-4.5` via aggregator (`MARKETING_DIRECTOR_MODEL`). |
| G5 | Tools wired: `app_search` + `app_graphql` (not mock-only). |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-carousel-ui-marketing.ts
# Expect: SMOKE_W_2026_10_14_CAROUSEL_UI_MARKETING_OK
```

Live verify (Backend): see `verify-haiku.md` — `POST /api/marketing/chat` → `source:live`.

Live Client: **S47.D** Playwright @1440 `/marketing` send short message.

## Class of defect

No projects rail; Inter-only; AIInput missing; sink never happens; mock-only chat without Haiku/tools.
