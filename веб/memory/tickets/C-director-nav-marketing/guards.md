# Guards — C-director-nav-marketing

Wave: `W-2026-10-14-razbor-live-boards` · Scenario: **S48.A** (Директор nav)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Sidebar item **«Директор»** → `/marketing`, `data-testid` / `testId` `nav-director`. |
| G2 | Idle prefetch includes `/marketing`. |
| G3 | Studio Launchpad **no** Marketing / `studio-entry-marketing` button. |
| G4 | `/marketing` page exists and loads. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
# Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK
```

Live Client: **S48.A** Playwright @1440 — click Директор → `/marketing`.

## Class of defect

Missing Директор; dual Marketing entry on Studio; `/marketing` 404; no prefetch.
