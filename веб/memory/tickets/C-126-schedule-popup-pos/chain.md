# Chain — C-126 (schedule popupPos)

> **Path lock #4** — после mesh, до analytics. Не overlap `ScheduleCalendar` с другими FE.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/schedule/ScheduleCalendar.tsx` (± `lib/schedule/popup-pos.ts`) | [x] | `cf.schedule.popup.pos`; restore; no reset on slot |
| 2 | Motion | — | [ ] | optional |
| 3 | Backend | — | [ ] | не нужен |
| 4 | Tester | `guards.md` | [x] | static PASS; drag/slot/F5 → Client S35 |
| 5 | Fixer | _(если красное)_ | [ ] | |
| 6 | Deployer | localhost | [ ] | |
| 7 | Client | S35 schedule | [ ] | Playwright |

**Wave order:** … → C-124+C-125 → **C-126** → C-127→C-128 → …
