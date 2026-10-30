# C-razbor-draft-edit — Architect spec

**Priority:** P0 · Wave S52 · `2026-10-16-design-razbor-quality`  
**Covers:** Trainer 2.1–2.4 · Client **S52.B**

## Goal

Opening an existing carousel draft is an **edit/discuss** session: RIGHT column shows that draft; «Начать разбор» is gone; Create-parity agents chat with **carousel context**; Competitors get **«Выбрать»** + empty comparison square; redraw **overwrites** the same draft id (no Черновики spam).

## Locks

| ID | Lock |
|----|------|
| **D-rb-1** | `previewDraft` on open → RIGHT = **that** draft carousel immediately (default side **ours** / draft, not empty competitor-only). |
| **D-rb-2** | Existing draft (previewDraft with slides or known id) → **hide** «Начать разбор» (`data-testid="razbor-start-btn"` absent). Fresh competitor analysis without draft may keep start CTA (S48 live Haiku). |
| **D-rb-3** | Create-parity agents (Scriptwriter / Designer / …) usable for discuss/edit; system/context inject includes **carousel JSON + slide URLs** (+ scenario). |
| **D-rb-4** | Competitors: **«Выбрать»** + empty **square top-right** → pick competitor screen for comparison. |
| **D-rb-5 Upsert key** | Primary: **`draft.id`**. API always `moduleId: "carousel-engine"`. Razbor formula **`draft-razbor-${post.id}`** (`buildCarouselDraft`) — **stable** across edit/redraw. Create: stable `draftIdRef`. Persist via `upsertDraft` → Prisma upsert `where: { id }` / `PATCH /api/studio/drafts/[id]`. Secondary: `sourceCompetitorId`, `competitorId`, `slides`, `scenario`, `status`, `brand`, `title`, timestamps. **Forbid** minting new id per iteration; **no** `sourcePostId`. |
| **shell_freeze** | No AppShell / left nav. Razbor modal **in scope**. |
| **no_pipeline_break** | Keep agent order Razbor→Scriptwriter→Designer→Draft; no new agents. |

## Paths

| Path | Owner |
|------|--------|
| `components/studio/workspace/RazborModal.tsx` | Frontend |
| `components/studio/workspace/RazborCarouselToggle.tsx` (or new sibling for Выбрать/square) | Frontend |
| `components/studio/StudioModuleWorkspace.tsx` | Frontend (`openDraftPreview` / `previewDraft` wire only) |
| Chat context / system builders used by Razbor Create-parity | AI Bridge |
| `lib/studio/razbor-pipeline.ts` (`buildCarouselDraft`) | Backend / shared — keep id formula |
| `lib/studio/carousel-drafts-store.ts` | Backend/Frontend wire |
| `lib/studio/sprint8-client.ts` | Backend client map |
| `lib/db/drafts-repository.ts` | Backend |
| `app/api/studio/drafts/route.ts` | Backend |
| `app/api/studio/drafts/[id]/route.ts` | Backend |

## UX detail

1. **Open from Черновики** (`onSelectDraft` → `openDraftPreview`) already sets `razborPreviewDraft` — keep that entry.  
2. On open with draft: `setDraft(previewDraft)`; force RIGHT to show draft slides; skip analyst welcome gate.  
3. Composer placeholder must not say «Нажмите Начать разбор» when draft-edit mode.  
4. «Выбрать» opens competitor picker (reuse feed post picker pattern if exists; else minimal modal). Empty square = selected comparison target (or empty state until pick).  

## Non-goals

- CapCut `/edit/[draftId]` for carousel (already non-path)  
- Changing live Haiku requirement for **new** «Начать разбор» flows  
- Settings Design (ticket 1)  

## Acceptance (Client S52.B)

1. Черновики → open draft → modal @1440.  
2. RIGHT preview = **that** draft carousel.  
3. **No** «Начать разбор»; chat works; LLM has carousel context.  
4. Competitors: **Выбрать** + top-right empty square for pick.  
5. Edit/redraw → **same** draft id in Черновики (count not +1 spam).

Hard REJECT: empty/wrong RIGHT; start CTA on existing draft; no Выбрать/square; duplicate drafts per iteration.

## Guards (Tester)

- Open with fixture `previewDraft` → assert no `razbor-start-btn`; RIGHT has draft slide URLs.  
- Two redraw upserts → assert single store/API row for `draft-razbor-*` / stable create id.  
- Guard file: `memory/tickets/C-razbor-draft-edit/guards.md` after green.
