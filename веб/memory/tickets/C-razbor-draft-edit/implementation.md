# C-razbor-draft-edit — Frontend implementation

**Role:** Frontend · Wave S52 · `2026-10-16-design-razbor-quality`  
**Spec:** `architect-spec.md` · shell_freeze AppShell

## What changed

| Lock | Behavior |
|------|----------|
| **D-rb-1** | Open Черновики → `previewDraft` hydrates `draft`; RIGHT defaults to **ours** with that draft’s slides (`oursSlides` = draft \|\| previewDraft). |
| **D-rb-2** | `isRazborDraftEditMode(previewDraft)` → **no** `razbor-start-btn`; composer empty-state no longer says «Нажмите Начать разбор»; start on Scriptwriter with chat ready. |
| **D-rb-3** | `handleComposerSend` builds `buildRazborDraftCarouselContext` + system overlay; passes `carouselJson` to `postStudioAgentChat`. Route safety-net injects JSON for `surface=razbor` if overlay missing. |
| **D-rb-4** | `RazborCompetitorPickChrome`: **Выбрать** + empty **square** top-right on Competitors side; picker lists `competitorPosts` from workspace. |
| **D-rb-5** | `draftIdRef` + preserve `draft.id` / `createdAt` / title / source on Designer redraw before `upsertDraft` (API already upserts `where: { id }`). |

## Files

- `components/studio/workspace/RazborModal.tsx`
- `components/studio/workspace/RazborCompetitorPickChrome.tsx` (new)
- `components/studio/StudioModuleWorkspace.tsx` (`competitorPosts={competitors}`)
- `lib/studio/razbor-draft-context.ts` (new)
- `app/api/studio/agent-chat/route.ts` (small razbor carouselJson inject)
- `memory/tickets/C-razbor-draft-edit/decisions.md`
- `memory/tickets/C-razbor-draft-edit/implementation.md`

## Out of scope / notes

- AppShell / left nav untouched (`shell_freeze`).
- Fresh competitor Razbor still shows «Начать разбор» + live Haiku.
- Backend drafts API already upsert-by-id; FE keeps stable id on redraw.
- Tester: guards in `guards.md` after green (open fixture draft → no start btn; RIGHT has draft URLs; two upserts → one row).

## How to verify (manual)

1. Studio carousel → Ours → Черновики → open a draft.
2. RIGHT = that carousel (ours toggle active); no «Начать разбор».
3. Chat Scriptwriter/Designer — reply uses draft context.
4. Competitors → «Выбрать» / empty square → pick another post → comparison slides update.
5. Redraw / save → same draft id in Черновики (count not +1).
