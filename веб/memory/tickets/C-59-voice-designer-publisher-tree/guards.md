# Guards — C-59 Voice + carousel Designer + publisher + schedule tree

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-51 «Designer вне Razbor» сужен: **non-carousel** = Analyst+Scriptwriter; **carousel-engine** = +Designer + publisher pane.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | `RAZBOR_AGENTS` = analyst+scriptwriter; `RAZBOR_CAROUSEL_AGENTS` + designer+publisher; `razborAgentsForModule` | **PASS** | `carousel-draft-types.ts` |
| G2 | `runRazborDesigner` + `buildDesignerMessages`; cascade C-51 без draft | **PASS** | `razbor-pipeline.ts` |
| G3 | `GenerationDrawer` использует `AgentChatComposer`; SpeechRecognition только там | **PASS** | grep `SpeechRecognition` в `components/studio` |
| G4 | `RazborPublisherPane` без textarea / composer; datetime HITL | **PASS** | `RazborPublisherPane.tsx` |
| G5 | `/schedule` rail: `animated-file-tree` `TreeView` | **PASS** | `ScheduleModuleRail.tsx` |
| G6 | **C-62 supersede:** сценарист CTA = `razbor-send-designer` (не `razbor-send-publisher`) | **PASS** | `RazborModal.tsx` |

## Executable checks

```powershell
Select-String -Path "lib\studio\carousel-draft-types.ts" -Pattern "RAZBOR_CAROUSEL_AGENTS|razborAgentsForModule"
Select-String -Path "components\studio\GenerationDrawer.tsx" -Pattern "AgentChatComposer"
Select-String -Path "components\studio\workspace\RazborPublisherPane.tsx" -Pattern "textarea|AgentChatComposer"
# expect: no chat matches
Select-String -Path "components\schedule\ScheduleModuleRail.tsx" -Pattern "animated-file-tree"
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-59**. C-51 row already notes carousel supersede.

## Fixer?

**Нет.**
