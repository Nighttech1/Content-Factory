# Guards — C-razbor-live-haiku-boards

Wave: `W-2026-10-14-razbor-live-boards` · Scenario: **S48.D** (Razbor chrome + live analyze + Boards)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Preview ≈1.5× (`max-w-[19.5rem]`); no post title in chrome; eyebrow only. |
| G2 | Handoff = `HandoffRoundButton` via PromptBox `trailingActions` (`prompt-box-trailing-actions`). |
| G3 | Competitors\|Доски MultiButton (`competitors-boards-switch`); Boards upload → Razbor. |
| G4 | POST `/api/studio/razbor/analyze` + `postRazborAnalyze`; models Razbor/Scriptwriter=`anthropic/claude-haiku-4.5`, Designer=`openai/gpt-5.4-image-2`. |
| G5 | Soft-fail mock only if `AGGREGATOR_API_KEY` missing (see `smoke-razbor-live-analyze.ts`). |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
# Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK

npx tsx scripts/smoke-razbor-live-analyze.ts
# Expect: SMOKE_RAZBOR_LIVE_OK or SMOKE_RAZBOR_LIVE_SOFT_FAIL_MOCK_OK
```

Live Client: **S48.D** — open Razbor, handoff inside input, Boards toggle, start разбор.

## Class of defect

Handoff outside input; post title header; no Boards; silent mock after start when key present; wrong models.
