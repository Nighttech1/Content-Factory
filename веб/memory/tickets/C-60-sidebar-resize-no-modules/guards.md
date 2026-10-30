# Guards — C-60 Sidebar flat + resize

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-27/C-57 «Studio children в nav» — **superseded**. Отсутствие `nav-studio-children` = **PASS**.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | Нет `nav-studio-children` / `nav-studio-module` в сайдбаре | **PASS** | `SidebarNavigation.tsx` flat `nav-studio` |
| G2 | `data-testid="sidebar-resize-handle"` на правом крае aside | **PASS** | `sidebar-resize-handle.tsx` |
| G3 | Persist `localStorage` key `cf.sidebar.width`, clamp 200–360, default 256 | **PASS** | `lib/shell/sidebar-width.ts` |

## Executable checks

```powershell
Select-String -Path "components\shell\SidebarNavigation.tsx" -Pattern "nav-studio-children|nav-studio-module"
# expect: no matches
Select-String -Path "components\ui\sidebar-resize-handle.tsx" -Pattern 'data-testid="sidebar-resize-handle"'
Select-String -Path "lib\shell\sidebar-width.ts" -Pattern "cf.sidebar.width|MIN_SIDEBAR_WIDTH|MAX_SIDEBAR_WIDTH"
npx tsx scripts/smoke-c27-studio-routes.ts
# expect: SMOKE_C27_SIDEBAR_FLAT_RESIZE_OK + SMOKE_C27_OK
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-60**.

## Fixer?

**Нет.**
