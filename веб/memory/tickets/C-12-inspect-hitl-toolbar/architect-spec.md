# Architect spec — C-12

> Заполняет **Архитектор** до любого кода. Depends on **C-10** store + **C-11** panel (serial).

## Goal

HITL тулбар: **перегенерация только выбранного слайда** + **Approve & Schedule** с подтверждением и датой. DEV_PLAN **4.4**. UI state must visibly change (Client Hard REJECT S2 на Approve).

## In scope

- Заменить stub `components/inspect/HitlToolbar.tsx`:
  - Secondary: `[🔄 Перегенерировать слайд #N]` — N = 1-based index of `selectedSlideId` in current order; calls `rerollSelectedSlide()`.
  - Visible effect: selected slide `version++` and/or new mock `imageUrl`/label tint/badge «v{n}» so snapshot differs; **не** reorder entire carousel; **не** restart pipeline.
  - Optional secondary stubs from Stitch («Edit Subtitles», «A/B») — decorative disabled OK; not required.
  - Primary CTA: `ReactiveButton` / branded — **Approve & Schedule Post** → `openApproveModal()`.
- `ApproveScheduleModal.tsx`:
  - Confirm copy + date (`<input type="datetime-local">` or date+time).
  - Confirm → `confirmApproveSchedule(iso)`; Cancel → `cancelApproveModal()`.
  - On success: `status` → `scheduled` (or `approved` then scheduled); show pill «Scheduled» / scheduledAt in toolbar or panel header area **without editing C-11 files** — put status chip inside HitlToolbar.
- Motion: CTA press / modal enter/exit; celebrate micro-feedback on approve; `useReducedMotion`.
- Consume store only — no mock/store file edits unless Fixer+escalation.

## Out of scope

- Real publish to Instagram/TikTok, BullMQ enqueue, Prisma status writes.
- Full carousel regenerate / Generate Draft restart.
- Editing `InspectControlPanel` / hook components / MediaDeck / page.
- Prompt editor «Правка промпта» from ARCHITECTURE list — backlog; not this ticket.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| HITL toolbar + modal | Frontend | paths ниже |
| CTA / modal motion | Motion | HitlToolbar, ApproveScheduleModal |
| QA | Tester → Fixer | reroll single slide; Approve UI change S2 |
| Localhost | Deployer | inspect demo |
| Приёмка | Client | Approve must change snapshot |

## Contracts

### Reroll

```
rerollSelectedSlide():
  - find slides[selectedSlideId]
  - version += 1
  - optionally rotate placeholder image / append "·reroll" to filename for visibility
  - do not change other slides' order or version
```

Button label: `Перегенерировать слайд #{displayIndex}` where `displayIndex = order+1`.

### Approve flow

```
openApproveModal() → approveModalOpen=true
confirmApproveSchedule(iso: string) →
  status = "scheduled"
  scheduledAt = iso
  approveModalOpen = false
cancelApproveModal() → approveModalOpen=false
```

UI after confirm (all inside C-12 paths):
- Primary button disabled or label → «Scheduled ✓»
- Status chip: Scheduled + datetime
- Modal closed

### S2 contract

Playwright: before Approve (Awaiting Sign-Off) vs after (Scheduled + datetime visible). Must differ.

## Acceptance criteria (язык Клиента)

1. Кнопка реролла показывает номер **выбранного** слайда; после клика этот слайд визуально обновлён, остальные на месте.
2. Approve открывает подтверждение с выбором даты.
3. После подтверждения статус инспектора становится «запланировано» — видно без обновления страницы.
4. Нет полного перезапуска пайплайна / пропажи всех слайдов.

## Risks

- Putting status only in C-11 header would force editing C-11 — **forbidden**; duplicate compact status in toolbar.
- Modal focus trap / Escape to cancel.

## Mid-flight escalation

If `rerollSelectedSlide` / approve actions missing in store → Architect/C-10 fix store, then resume C-12.
