# Guards — C-54 Schedule 21st + RU chrome

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-46 English `Studio Launchpad` — **superseded**. RU «Студия» = **PASS**.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | `/schedule` `schedule-page` + calendar + module rail + ready posts | **PASS** | Live: calendar, rail, 14 ready posts; h1 «Расписание»; no Publishing placeholder |
| G2 | Persist `cf.schedule.v1`; corrupt JSON → empty | **PASS** | `parseScheduleFile`; live click day → localStorage slots + label «15 октября 2026 г. в 12:00» |
| G3 | Sidebar Студия / Холст / Расписание (no Canvas/Schedule EN) | **PASS** | `SidebarNavigation` + live nav |
| G4 | No «Studio Launchpad» / «Target Render Channels» | **PASS** | `/studio` h1 Студия, «Каналы рендера»; smoke + live |
| G5 | Mesh TopBar / settings / analytics RU inventory | **PASS** | Активные задачи, Добавить модуль пайплайна, Настройки, Самообучающаяся диагностика |
| G6 | Slot ≠ social publish | **PASS** | Copy: «без публикации в соцсети»; no publish API |
| G7 | anti-slop | **PASS** | wave UI scan OK |

## Executable checks

```powershell
$env:BASE_URL="http://127.0.0.1:3000"
npx tsx scripts/smoke-c54-schedule-ru.ts
# expect SMOKE_C54_SCHEDULE_OK / RU_CHROME_OK / SMOKE_C54_OK
```

Reload `/schedule` after assigning a slot: `localStorage['cf.schedule.v1']` keeps `{ version: 1, slots }`.

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-54**.

## Fixer?

**Да (2026-10-06).** Residual mesh node labels → RU в `lib/mesh-seed.ts` + chrome нод (`Очередь` / `Маршрут` / `Согласование`). Approve «Запланировано». Workspace titles уже «Наши» / «Конкуренты».
