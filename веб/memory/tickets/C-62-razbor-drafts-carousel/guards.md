# Guards — C-62 Razbor handoff + drafts carousel

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-59 «сценарист → `razbor-send-publisher`» — **superseded**: сценарист → Designer.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | Сценарист CTA `razbor-send-designer`; нет `razbor-send-publisher` на scriptwriter | **PASS** | `RazborModal.tsx` |
| G2 | Дизайнер CTA `razbor-send-publisher-designer` | **PASS** | `RazborModal.tsx` |
| G3 | Chat pane class `cf-hide-scrollbar` | **PASS** | `RazborModal.tsx` + `globals.css` |
| G4 | DraftsPanel L/R: `draft-slide-prev` / `draft-slide-next` | **PASS** | `DraftsPanel.tsx` |

## Executable checks

```powershell
Select-String -Path "components\studio\workspace\RazborModal.tsx" -Pattern 'razbor-send-designer|razbor-send-publisher-designer|cf-hide-scrollbar'
Select-String -Path "components\studio\workspace\RazborModal.tsx" -Pattern 'data-testid="razbor-send-publisher"'
# expect: no bare send-publisher on scriptwriter
Select-String -Path "components\studio\workspace\DraftsPanel.tsx" -Pattern "draft-slide-prev|draft-slide-next"
Select-String -Path "app\globals.css" -Pattern "cf-hide-scrollbar"
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-62**. Update C-59: scriptwriter CTA = designer.

## Fixer?

**Нет.**
