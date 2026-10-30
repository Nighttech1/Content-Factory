# Guards — C-67 Schedule UX

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-07 |
|---|-------|---------|---------------------|
| G1 | `ScheduleModuleRail` folders `defaultOpen={false}` | **PASS** | `ScheduleModuleRail.tsx` |
| G2 | No `stripDays` in ScheduleCalendar | **PASS** | grep empty in `components/schedule` |
| G3 | Month arrows beside title | **PASS** | `schedule-month-prev` / `monthLabel` / `schedule-month-next` |
| G4 | Label wrap classes on rail | **PASS** | `whitespace-normal break-words text-wrap` |

## Executable checks

```powershell
npx tsx scripts/smoke-c63-c67-ux-wave.ts
# expect: SMOKE_C67_OK
# also: npx tsx scripts/smoke-c54-schedule-ru.ts (baseline schedule)
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-67**.

## Fixer?

**Нет.**
