# Guards — C-57 MenuVertical + no selection counter

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | `ModuleSelectorGrid` без «Ничего не выбрано» / «1 выбран» | **PASS** | source scan: нет строк счётчика |
| G2 | `components/ui/menu-vertical.tsx` существует; default `text-sm`, children `size="sm"` → `text-[13px]`; нет `text-4xl` | **PASS** | `menu-vertical.tsx` |
| G3 | `SidebarNavigation` рендерит `MenuVertical`; Studio children `size="sm"`; Холст `ownerOnly` | **PASS** | `SidebarNavigation.tsx` |

## Executable checks

```powershell
Select-String -Path "components\studio\ModuleSelectorGrid.tsx" -Pattern "Ничего не выбрано|1 выбран"
# expect: no matches
Test-Path "components\ui\menu-vertical.tsx"
Select-String -Path "components\shell\SidebarNavigation.tsx" -Pattern "MenuVertical"
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-57**.

## Fixer?

**Нет.**
