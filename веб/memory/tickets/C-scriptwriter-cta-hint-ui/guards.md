# Guards — C-scriptwriter-cta-hint-ui

Wave: `W-2026-10-13-scriptwriter-swipe-cta` · Scenario: **S46.A** (Create «?» cheat sheet)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `ScriptwriterCtaHint.tsx` exports component with `data-testid="create-scriptwriter-cta-hint"` + panel `create-scriptwriter-cta-hint-panel`. |
| G2 | Panel lists CTA rows **1–4** RU (вопрос→комментарии; ещё подобного→подписка; живые встречи→TG; лайк+сохранить). |
| G3 | `CreateCarouselModal.tsx` mounts `<ScriptwriterCtaHint />` only when `activeStep === "scriptwriter"` (chrome `create-scriptwriter-chat-chrome`). |
| G4 | Hint is **not** primary chrome on Designer / Publication steps. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts
# Expect: SMOKE_W_2026_10_13_SCRIPTWRITER_SWIPE_CTA_OK
rg -n "ScriptwriterCtaHint|create-scriptwriter-cta-hint" components/studio/workspace/
```

Live Client: **S46.A** — Playwright @1440 → Create → Scriptwriter → click «?» → CTA 1–4 visible on snapshot.

## Class of defect

Missing «?» on Scriptwriter; empty panel; hint on Designer/Publication as primary; EN-only cheat sheet.
