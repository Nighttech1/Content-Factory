# Decisions — C-30

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | `N/A` (no git HEAD at spec) | Spec 2026-09-20 |
| **after_sha** | | После закрытия |

## Product / tech decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entry | «Разбор» on competitor cards, carousel-engine only | Product rule 2 |
| Layout | Modal: Left agents / Right enlarged carousel | Ticket |
| Agents min set | Analyst, Scriptwriter, Designer (Renderer may merge into Designer) | Ticket «at minimum» |
| Analyst | Auto-run on modal open | Product |
| Cascade start | Explicit Scriptwriter user action | Product |
| Pipeline | Deterministic mock in `razbor-pipeline.ts` | No key required; Mock LLM OK |
| Live LLM | Optional enhancement if key present; must degrade to mock | Acceptance not blocked |
| Drafts persistence | Client zustand (`carousel-drafts-store`) session memory | No DB; safety |
| Drafts API | Thin `POST /api/studio/carousel-engine/razbor` (`action: analyze\|script`) for smoke; primary UX = client `razbor-pipeline` + zustand | Backend chose thin API + client mock |
| Publish | Always `unpublished`; no social push | HITL / safety |
| CapCut | Never from Razbor or carousel Drafts | Product rule 3 / C-31 |
| GenerationDrawer | Do not reuse global generate drawer state for Razbor | Avoid S1 regression |
| Brand slides | Mock URLs + logo placeholder asset | No Remotion render required |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec+chain+decisions | status → specced |
| 2026-09-20 | Backend | pipeline + types + POST razbor API + smoke-c30 | Done |
| 2026-09-20 | Frontend | RazborModal + DraftsPanel + wire cards | Done |
| 2026-09-20 | Motion | modal spring + bubble reveal + slide swap | Done |

## Rollback plan

1. Remove Razbor modal, pipeline module, drafts store wiring; restore C-29 Drafts stub.
2. `status.md` → `rolled_back`.
3. Keep ticket folder.
4. Localhost sync.
