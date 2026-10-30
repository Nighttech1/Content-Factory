# Status — C-123 (studio no register)

**Role:** Frontend  
**State:** done (FE)

## Done

1. `components/studio/ModuleSelectorGrid.tsx`:
   - Removed dashed Add tile `[+ Добавить модуль]` (`data-testid="module-add"`)
   - Removed `registerOpen` state + `RegisterModuleModal` mount
   - Removed unused imports: `RegisterModuleModal`, `useState`, `appendCustomModule`
2. Grep: no other Launchpad callers of `RegisterModuleModal` (file kept on disk; API untouched)
3. Chain Frontend checkbox marked `[x]`

## Out of scope (untouched)

Sidebar / mesh / schedule. `RegisterModuleModal.tsx` + register API kept. No commit.
