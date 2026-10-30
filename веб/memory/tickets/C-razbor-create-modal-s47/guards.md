# Guards — C-razbor-create-modal-s47

Wave: `W-2026-10-14-carousel-ui-marketing` · Scenario: **S47.B/C** (Razbor + Create modal UX)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Modal scroll lock (`use-modal-scroll-lock` / `stopModalWheel`) — background feed does not scroll. |
| G2 | No banner «Карусель конкурента». |
| G3 | Short Analyst welcome; composer placeholder **«Сообщение»**; `hideTools`. |
| G4 | Handoff = `HandoffRoundButton` (arrow + next-agent logo), not text-only. |
| G5 | Razbor top = `AgentPeopleIconTabs` (4 people); Create retains `CreateCarouselStepSegment` + avatars (**D-icons-1**). |
| G6 | Preview index **`N/M`** Century Gothic (`razbor-slide-index` / `create-carousel-slide-index`). |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-carousel-ui-marketing.ts
# Expect: SMOKE_W_2026_10_14_CAROUSEL_UI_MARKETING_OK
```

Live Client: **S47.B/C** Playwright @1440 open Разбор / Создать карусель.

## Class of defect

Tools chrome returns; text-only handoff; wheel scrolls studio behind modal; missing people icons / N/M; long welcome / wrong placeholder.
