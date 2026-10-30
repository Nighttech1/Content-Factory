# Decisions — C-12

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(after C-11 FE)_ | Старт C-12 |
| **after_sha** | | После закрытия |

## ADR

### ADR-12.1 — Granular reroll only

**Decision:** `rerollSelectedSlide` bumps `version` (+ optional visual asset tweak) for **one** slide.  
**Why:** DEV_PLAN 4.4; no full pipeline restart.

### ADR-12.2 — Approve is local UI state

**Decision:** `status`/`scheduledAt` in Zustand mock only; no social publish / BullMQ.  
**Why:** Sprint 4 UI-first; HITL gate still demonstrated for Client S2.

### ADR-12.3 — Status chip lives in toolbar

**Decision:** Post-approve status UI rendered inside `HitlToolbar`, not by editing C-11 job header.  
**Why:** path ownership; avoid overlapping `InspectControlPanel.tsx`.

### ADR-12.4 — Modal ownership

**Decision:** `ApproveScheduleModal` colocated under `components/inspect/`, owned solely by C-12.  
**Why:** clear FE boundary.

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Architect | Spec+chain C-12: HitlToolbar + ApproveScheduleModal; serial after C-11 |
| 2026-09-18 | Architect | S2 Approve must change snapshot; status chip in toolbar |

## Rollback plan

1. Restore stub `HitlToolbar.tsx`; delete `ApproveScheduleModal.tsx`.
2. `status.md` → `rolled_back`.
3. Папку тикета не удалять.
