# Guards — C-12

| Guard type | What | Where |
|------------|------|-------|
| test | HitlToolbar + ApproveScheduleModal exist | `scripts/sprint4-guards.mjs` |
| test | HitlToolbar calls `rerollSelectedSlide` + `openApproveModal` | `scripts/sprint4-guards.mjs` |
| test | ApproveScheduleModal calls `confirmApproveSchedule` (Client S2: Approve must change UI) | `scripts/sprint4-guards.mjs` |
| test | Toolbar surfaces Scheduled status after approve | `scripts/sprint4-guards.mjs` |

## Mirror in Client skill

| C-12 | reroll/approve not wired / no Scheduled UI | sprint4-guards | `scripts/sprint4-guards.mjs` |
