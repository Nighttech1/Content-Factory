# Guards — C-carousel-chrome

Wave: `W-2026-10-12-carousel-studio-handoff` · Scenario: **S41** (chrome partial)

## G1 — No publisher agent / no bottom handoff·tools in Create

- `CreateCarouselModal.tsx` must **not** contain agent id/label `publisher` / «Публицист».
- Step union is only `"scriptwriter" | "designer" | "publication"`.
- Composer usage in Create: `hideTools` + `hideHandoff` (no bottom-right handoff CTA, no bottom-left tools).
- No `MultiButton` / `CompactMultiButton` as Create agent switcher.

**Static:** `rg -n "picsum|Публицист|publisher" components/studio/workspace/CreateCarouselModal.tsx` → no product matches (comments OK only if stating absence).  
**Static:** `rg -n "hideTools|hideHandoff" components/studio/workspace/CreateCarouselModal.tsx` → both present on `AgentChatComposer`.  
**Live S41:** open «Создать карусель» @1440 — no bottom «передать…», no tools chrome.

## G2 — Segment Сценарист | Дизайнер | Публикация

- Component: `components/studio/workspace/CreateCarouselStepSegment.tsx`
- Labels exact: **Сценарист**, **Дизайнер**, **Публикация** (not «Публицист»).
- Testids: `create-carousel-segment`, `create-step-scriptwriter`, `create-step-designer`, `create-step-publication`.
- Uses `components/ui/button.tsx` variants (gold/glass), not MultiButton.

**Static:** file exists; STEPS labels match.  
**Live S41:** segment visible in modal header.

## G3 — Button primitive present

- `components/ui/button.tsx` exists (cva + Slot / Vernatun tokens).

## Class of defect

Regression = bottom handoff/tools returned, «Публицист» segment label, or MultiButton switcher in Create.
