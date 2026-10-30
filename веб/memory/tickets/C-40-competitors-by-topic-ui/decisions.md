# Decisions — C-40

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | N/A | Spec 2026-09-21 |
| **after_sha** | | После закрытия |

## Product / tech decisions (locked — wave)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Initial load | `GET /feed` without topic → show niche competitors | Empty topic = all niche |
| Topic commit | Refresh competitors via `?topic=` | Already partial; keep |
| Empty / clear topic | Must refetch niche competitors (fix early-return) | User goal |
| Manual competitor URLs | Never ask in UI | Product hard constraint |
| Graph from browser | Forbidden; only feed API | Security + rate |
| Motion | Not in default chain | Loading states enough |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-21 | Architect | spec+chain+decisions | status → specced |
| 2026-09-21 | Frontend | clear topic + niche copy + loading | status → frontend-done; Motion skip |

## Frontend notes

- Reused existing IdeaBar / Apply chrome (no new 21st brick); clear = sibling ghost button.
- `21st=reuse` · element=module-idea-clear · motion=no
- Mount still `fetchFeed(undefined, "full")` — right column not gated on topic.

## Rollback plan

1. Restore prior `handleTopicCommit` / copy.
2. `status.md` → `rolled_back`.
3. Keep ticket folder; localhost sync.
