# Decisions — C-51 (AI Bridge)

| Date | Role | Decision | Rationale |
|------|------|----------|-----------|
| 2026-10-05 | AI Bridge | Cascade = Analyst → Scriptwriter only; no `designerMessages` / `draft` on `runRazborCascade` | Spec C-51; Designer + «Готовая карусель» out of Razbor path |
| 2026-10-05 | AI Bridge | Open = `getRazborWelcome` / `buildAnalystWelcomeMessages` only; analysis via `startRazbor` after CTA | No auto-start on mount |
| 2026-10-05 | AI Bridge | Script contract `RazborScript` { roles, plot, text, location }; chat via `applyScriptwriterChatRevision` | Full script; no designer handoff |
| 2026-10-05 | AI Bridge | Removed `buildDesignerMessages`; kept `buildBrandedSlides` / `buildCarouselDraft` as non-cascade helpers | Brand Kit / other entrances; razbor must not upsertDraft |
| 2026-10-05 | AI Bridge | `RAZBOR_AGENTS` / `RazborAgentId` = analyst + scriptwriter only | FE wires tabs from this list |
| 2026-10-05 | AI Bridge | Pipeline ready for FE — RazborModal still needs welcome CTA + remove designer/upsertDraft | Chain: FE shell → this pipeline done |
| 2026-10-05 | Frontend | Open = `getRazborWelcome` + `razbor-welcome` / `razbor-start-btn`; no analysis `useEffect` | Spec C-51 start UX |
| 2026-10-05 | Frontend | Tabs = `RAZBOR_AGENTS` (Analyst + Scriptwriter); removed Designer + «Готовая карусель» + `upsertDraft` | Spec chrome |
| 2026-10-05 | Frontend | Extract `RazborReelPlayer.tsx` — round Play + CapCut-lite scrubber; no autoplay | Right panel; Motion may polish springs |
| 2026-10-05 | Frontend | Script pane: `ScriptFieldsCard` roles/plot/text/location + `applyScriptwriterChatRevision` | Full script + chat |
| 2026-10-05 | Frontend | 21st=unavailable (quota 2/day); reuse FeedPostCard play id=4586 + CapCut/ReelsPlayer scrub patterns | Fallback policy |

## FE API (client)

```ts
getRazborWelcome(id, post?)          // open: slides + welcomeMessages
startRazbor(id, post?)               // CTA «Начать разбор» → analystMessages
runRazborCascade / runRazborScript   // Scriptwriter leg → script + scriptwriterMessages
applyScriptwriterChatRevision(post, note, current?)  // chat edits
buildCompetitorSlides / RAZBOR_AGENTS
```

Do **not** call `upsertDraft` / `cascade.draft` / `cascade.designerMessages` from RazborModal.
