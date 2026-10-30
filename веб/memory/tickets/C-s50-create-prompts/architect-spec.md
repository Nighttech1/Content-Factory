# C-s50-create-prompts — Architect spec

**Priority:** P0 · Wave S50 · this pass = **UI only**; prompts → AI Bridge next

## Goal (UI)

Create modal visual parity with Razbor except start on Scriptwriter; source toggle higher; preview ≈1.5× again.

## Locks (UI)

| ID | Lock |
|----|------|
| D-create-parity | AgentPeopleIconTabs chrome (Razbor look); default step = scriptwriter |
| D-toggle-high | Competitors/Ours toggle near top of preview column (not flush on slides) |
| D-preview-15 | Create preview frame ≈ **29rem** (1.5× of S48 19.5rem) |

## Paths (UI)

- `components/studio/workspace/CreateCarouselModal.tsx`
- `components/studio/workspace/CreateCarouselPreview.tsx`
- `components/studio/workspace/CreateCarouselStepSegment.tsx` (may wrap or replace with people tabs)
- `components/studio/workspace/RazborCarouselToggle.tsx` (reuse)

## Acceptance (Client S50.C UI)

1. Open Create → Scriptwriter active; people-tab chrome like Razbor.
2. Toggle sits higher above carousel.
3. Preview visually ~1.5× larger than S48 baseline.
