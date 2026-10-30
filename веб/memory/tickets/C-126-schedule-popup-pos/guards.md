# Guards — C-126

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Key `cf.schedule.popup.pos`; read/write helper | `lib/schedule/popup-pos.ts` |
| static | Hydrate on mount; persist on drag pointerup; openEditor uses saved pos | `components/schedule/ScheduleCalendar.tsx` |
| localhost | Drag popup → switch slot → same x/y; F5 → same; fresh LS → default center | Playwright S35 |

## Localhost asserts (Playwright / Client)

1. `navigate` → `http://127.0.0.1:8787/schedule`
2. Open slot → `[data-testid="schedule-slot-popup"]` visible
3. Drag via `[data-testid="schedule-slot-popup-drag"]` to known coords
4. `localStorage.getItem('cf.schedule.popup.pos')` → JSON `{x,y}` matches
5. Open another slot → popup same viewport position (not re-anchored to cell)
6. `reload` → position preserved
7. Clear key → first open uses default (center-ish)

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | popup-pos helper + SCHEDULE_POPUP_POS_KEY | PASS |
| G2 | writeSchedulePopupPos on pointerup | PASS |
| G3 | read on mount + openEditor | PASS |
| G4 | schedule-slot-popup testids | PASS |
| G5 | Playwright drag/slot/reload | pending Client |

## Mirror in Client skill

`| C-126 | schedule popup jumps on slot/F5 | cf.schedule.popup.pos persist | memory/tickets/C-126-schedule-popup-pos/guards.md |`
