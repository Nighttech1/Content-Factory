# Guards — C-61 Workspace blink / Create / nested scroll

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-52/C-58 header opacity pulse на title/count — **superseded**. Hint = dot/`feed-refetching`, не fade title.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | Нет `// Рабочая страница` в workspace chrome | **PASS** | `StudioModuleWorkspace.tsx` |
| G2 | Title/count `opacity-100`; нет infinite opacity pulse на шапке | **PASS** | `VerticalPostCarousel.tsx` header |
| G3 | `workspace-create-btn` (GlowButton «Создать») | **PASS** | `StudioModuleWorkspace.tsx` |
| G4 | Competitors: populated → только `competitorsLoading` (не `feedLoading \|\| …`) | **PASS** | ternary empty vs populated |
| G5 | `handleCompetitorsTopicSearch` = `useCallback` | **PASS** | `StudioModuleWorkspace.tsx` |

## Executable checks

```powershell
Select-String -Path "components\studio\StudioModuleWorkspace.tsx" -Pattern "Рабочая страница"
# expect: no matches
Select-String -Path "components\studio\StudioModuleWorkspace.tsx" -Pattern 'workspace-create-btn|handleCompetitorsTopicSearch = useCallback'
Select-String -Path "components\studio\workspace\VerticalPostCarousel.tsx" -Pattern "opacity-100|never animate title"
# header title/count must stay opacity-100; skeletons may pulse
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-61**.

## Fixer?

**Нет.**
