# Guards — C-46 Studio header cleanup

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-05 |
|---|-------|---------|---------------------|
| G1 | `app/studio/page.tsx` содержит `Studio Launchpad` + supporting sentence про выбор модуля | **PASS** | h1 + «Выберите модуль — откроется рабочая страница канала.» |
| G2 | В `app/studio/page.tsx` нет `SPEED PROTOCOL` / `Բարև` / `Engine Standby` / `Mock pipeline` | **PASS** | Select-String пусто по запрещённым строкам |
| G3 | `ModuleSelectorGrid` всё ещё монтируется на странице (регрессия сетки) | **PASS** | `import` + `<ModuleSelectorGrid />` в page.tsx |
| G4 | Localhost `/studio` HTTP 200, HTML содержит Studio Launchpad, без SPEED / Standby / Mock pipeline | **PASS** | `127.0.0.1:3000/studio` → 200; Launchpad=True; SPEED/Standby=False |
| G5 | anti-slop wave | **PASS** | `python plugins/frontend/anti_slop_scan.py .` → OK |

**Примечание:** `Բարև` в HTML shell sidebar (`SidebarNavigation`) — **out of scope** C-46 (path lock: только `page.tsx`).

## Executable checks

```powershell
# G1–G3 disk
Select-String -Path "app/studio/page.tsx" -Pattern "Studio Launchpad"   # must match
Select-String -Path "app/studio/page.tsx" -Pattern "ModuleSelectorGrid" # must match
Select-String -Path "app/studio/page.tsx" -Pattern "SPEED PROTOCOL|Engine Standby|Mock pipeline|Բարև"  # must be empty

# G4 live
Invoke-WebRequest http://127.0.0.1:3000/studio -UseBasicParsing | % StatusCode  # 200

# G5
python plugins/frontend/anti_slop_scan.py .
```

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-46**.

## Fixer?

**Нет** — acceptance на диске и live header chrome зелёные.
