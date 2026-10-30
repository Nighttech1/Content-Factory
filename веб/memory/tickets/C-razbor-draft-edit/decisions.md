# C-razbor-draft-edit — decisions

| ID | Decision |
|----|----------|
| D-fe-1 | Draft-edit detected by `previewDraft?.id` (`isRazborDraftEditMode`), not only slides length — id alone is enough to hide start CTA. |
| D-fe-2 | On draft open: active tab = **Scriptwriter**, analyst = handed, scriptwriter/designer = done when slides exist — Create-parity chat without running live Haiku. |
| D-fe-3 | RIGHT preview uses `oursSlides = draft.slides \|\| previewDraft.slides` so first paint is never empty if hydrate races. |
| D-fe-4 | Comparison pick is session-local (`comparisonPost`); does not replace the opened draft’s `sourceCompetitorId` until user redraws. |
| D-fe-5 | Stable upsert key = existing `draft.id` via `draftIdRef`; `buildCarouselDraft` formula kept as fallback for fresh Razbor only. |
| 21st | `21st=reuse` — Выбрать/square chrome retokenized to Vernatun gold/glass (same CTA language as Razbor start buttons). Catalog search used; no new paid paste for tiny chrome. |
