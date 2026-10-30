# Decisions — C-29

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | `N/A` (workspace without git HEAD at spec time) | Spec 2026-09-20 |
| **after_sha** | | После закрытия |

## Product / tech decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope module | Only `carousel-engine` for grid+Drafts | Ticket path; reels polish in C-31 |
| Grid | CSS `grid-cols-3`, target 7 visible rows / 21 cards | Product rule 1 |
| Aspect | `3/5` via card prop | Product; keep reels free until C-31 |
| Thumb CDN | Primary `picsum.photos/seed/{id}/600/1000` | Stable, no API key |
| Unsplash | Optional secondary URLs with fixed ids | Allowed by ticket |
| Drafts CTA | Stub panel, empty list | Wire store in C-30 |
| CapCut from Drafts | Forbidden | C-31 / product rule 3 |
| Feed API shape | Unchanged C-28 | Compatibility |
| DB | No Prisma / migrate / wipe | Safety |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec+chain+decisions | status → specced |
| 2026-09-20 | Backend | carousel ≥21+21 picsum thumbs + smoke-c29 | chain Backend Done |
| 2026-09-20 | Frontend | grid 3-col + aspect 3/5 + Drafts stub | chain Frontend Done |
| 2026-09-20 | Motion | light stagger + reduced motion on grid cards | chain Motion Done |

## Rollback plan

1. Revert fixture expansions + UI grid/Drafts props.
2. `status.md` → `rolled_back`; wave row update.
3. Папку тикета **не удалять**.
4. Localhost sync per `docs/AGENT_SYNC_TO_APP.md`.
