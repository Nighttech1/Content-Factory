# Guards — C-50 Settings Reels page size

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-05 |
|---|-------|---------|---------------------|
| G1 | `lib/settings/reels-display.ts` exists: key `cf.reels.pageSize`, default 12, clamp 4–48 | **PASS** | `REELS_PAGE_SIZE_STORAGE_KEY`, `DEFAULT_REELS_PAGE_SIZE=12`, `clampReelsPageSize` |
| G2 | Invalid / missing → 12; out-of-range clamped | **PASS** | `C50_CLAMP_OK`: null/abc→12, 2→4, 100→48, 12→12 |
| G3 | `/settings` блок «Рилсы» + `settings-reels-panel` / `settings-reels-page-size` | **PASS** | `app/settings/page.tsx`; live HTML `settings-reels=True` |
| G4 | Workspace slices both columns: `ours.slice(0, reelsPageSize)` + competitors | **PASS** | `StudioModuleWorkspace` hydrate `readReelsPageSizeFromStorage` + dual slice |
| G5 | Localhost `/settings` HTTP 200 | **PASS** | `127.0.0.1:3000/settings` → 200 |
| G6 | anti-slop wave | **PASS** | `python plugins/frontend/anti_slop_scan.py .` → OK |

## Executable checks

```powershell
# G1 disk
Test-Path "lib\settings\reels-display.ts"  # True
Select-String -Path "lib\settings\reels-display.ts" -Pattern "cf.reels.pageSize|DEFAULT_REELS_PAGE_SIZE|MIN_REELS_PAGE_SIZE|MAX_REELS_PAGE_SIZE"

# G3 UI
Select-String -Path "app\settings\page.tsx" -Pattern "settings-reels-panel|settings-reels-page-size|Рилсы"

# G4 wire
Select-String -Path "components\studio\StudioModuleWorkspace.tsx" -Pattern "slice\(0, reelsPageSize\)|readReelsPageSizeFromStorage"

# G2 clamp (tsx)
npx tsx -e "import { clampReelsPageSize, DEFAULT_REELS_PAGE_SIZE } from './lib/settings/reels-display.ts'; /* assert null→12, 2→4, 100→48 */"

# G5 live
Invoke-WebRequest http://127.0.0.1:3000/settings -UseBasicParsing | % StatusCode  # 200

# G6
python plugins/frontend/anti_slop_scan.py .
```

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-50**.

## Fixer?

**Нет** — Settings + client slice контракт зелёный.
