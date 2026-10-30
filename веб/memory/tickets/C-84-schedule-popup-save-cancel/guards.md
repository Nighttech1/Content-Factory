# Guards — C-84 Schedule opaque popup

Тикет закрыт **только** если `/schedule` показывает один непрозрачный popup с Save/Cancel, drag сбрасывает редактор, rail без format-тегов.

| # | Guard | Verdict | Evidence |
|---|-------|---------|----------|
| G1 | Popup opaque (`bg-[var(--bg-elevated)]`) | **PASS** | `components/schedule/ScheduleCalendar.tsx` |
| G2 | Кнопки Save/Cancel (`schedule-slot-save` / `schedule-slot-cancel`) | **PASS** | ScheduleCalendar testids |
| G3 | Drag очищает editor (`if (dragging) setEditor(null)`) | **PASS** | ScheduleCalendar onDragState |
| G4 | `ScheduleModuleRail` без format-тегов (4:5 и т.п.) | **PASS** | grep empty `4:5` in rail |

## Executable checks

```powershell
npx tsx scripts/smoke-c82-c87-ux-wave5.ts
# expect: SMOKE_C82_C87_OK (C-84 asserts)
# baseline: npx tsx scripts/smoke-c54-schedule-ru.ts
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-84**.

## Fixer?

**Нет.**
