# Decisions — C-31

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | `N/A` (no git HEAD at spec) | Spec 2026-09-20 |
| **after_sha** | | После закрытия |

## Product / tech decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CapCut allowlist | `cartoon-reels`, `heygen-reels` only | Product rule 3 |
| Non-allowlist edit URL | `notFound()` | Hard gate; no silent CapCut |
| Carousel draft CTA | No CapCut navigation; Drafts / Razbor only | Product |
| Reels competitor | → CapCut with `ref` competitor id | Product |
| Carousel competitor | Разбор only (C-30) | Product |
| custom-* modules | CapCut off | Avoid accidental editor |
| Reels card aspect | `9/16` | Reels-appropriate |
| Reels layout | Vertical list (not mandatory 3×7) | Ticket allows either |
| Inspect HITL | Unchanged | Ticket notes |
| Ours card on reels | No forced CapCut | Competitor-driven entry; draft empty still opens CapCut |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec+chain+decisions | status → specced |

## Rollback plan

1. Restore universal CapCut navigation from C-28; remove gate helper.
2. `status.md` → `rolled_back`.
3. Keep ticket folder.
4. Localhost sync.
