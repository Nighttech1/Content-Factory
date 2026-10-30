# Guards — C-carousel-publish

Wave: `W-2026-10-12-carousel-studio-handoff` · Scenario: **S41** (publication)

## G1 — Publication pane (no Publisher agent)

- Step label **Публикация** (not «Публицист»).
- Component: `components/studio/workspace/CreateCarouselPublicationPane.tsx`
- Testids: `create-publication-pane`, `create-publish-button`, `create-publication-platform`.
- No agent chat / PromptBox on publication step in Create.
- Pattern may mirror RazborPublisherPane visually, but **must not** edit `RazborModal.tsx` or break Razbor publisher chat contract.

**Static:** CreateCarouselModal renders `CreateCarouselPublicationPane` when `activeStep === "publication"`; no publisher agent pane.  
**Live S41:** segment → Публикация → datetime + platform + «Опубликовать».

## G2 — `publishCreateCarousel` writes draft + schedule

- Helper: `lib/studio/create-carousel-publish.ts` → `publishCreateCarousel`.
- On success:
  1. `useCarouselDraftsStore.getState().upsertDraft(...)` with `status: "unpublished"` (Черновики / Ours).
  2. `upsertSlot` + `writeScheduleToStorage` (слот на `/schedule`).
- HITL only — **no** silent Instagram / social publish.
- CTA label: **Опубликовать** (`create-publish-button`).
- Success copy / testid: `create-publication-ok` («…Черновиках…Расписании»).

**Static:** helper upserts draft + schedule slot.  
**Live S41:** after Опубликовать → draft card visible + schedule slot for same postId.

## G3 — Chrome / agents invariants still hold on publish path

- No bottom handoff/tools; segment still Сценарист|Дизайнер|Публикация.
- Markdown bubble + no-picsum Create path unchanged (see sibling ticket guards).

## Class of defect

Regression = Publisher agent/chat returned in Create, «Опубликовать» without draft or schedule write, or auto social publish.
