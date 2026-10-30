# Guards — C-47 Module card height

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-05 |
|---|-------|---------|---------------------|
| G1 | Card `GlassCard` floor `min-h-[252px]` (не 168) | **PASS** | `ModuleSelectorGrid.tsx` ~114 |
| G2 | Dashed Add-slot `min-h-[252px]` | **PASS** | `data-testid="module-add"` button ~159 |
| G3 | Description: есть `text-pretty`; нет `line-clamp-2` / `line-clamp-1` на description | **PASS** | `text-pretty text-xs leading-snug`; clamp отсутствует в grid |
| G4 | Path lock: правки только в `ModuleSelectorGrid.tsx` для этого контракта | **PASS** | нет 168px / line-clamp в этом файле |
| G5 | anti-slop wave | **PASS** | `python plugins/frontend/anti_slop_scan.py .` → OK |

## Executable checks

```powershell
Select-String -Path "components/studio/ModuleSelectorGrid.tsx" -Pattern "min-h-\[252px\]"  # ≥2 hits (card + add)
Select-String -Path "components/studio/ModuleSelectorGrid.tsx" -Pattern "min-h-\[168px\]"  # empty
Select-String -Path "components/studio/ModuleSelectorGrid.tsx" -Pattern "line-clamp-[12]"  # empty
Select-String -Path "components/studio/ModuleSelectorGrid.tsx" -Pattern "text-pretty"      # must match
python plugins/frontend/anti_slop_scan.py .
```

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-47**.

## Fixer?

**Нет** — CSS/copy fit соответствует spec.
