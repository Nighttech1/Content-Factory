# Decisions — C-10



## Git anchors



| Anchor | SHA | When |

|--------|-----|------|

| **before_sha** | _(wave local)_ | Старт волны W-2026-09-18-sprint4 |

| **after_sha** | | После закрытия |



## ADR



### ADR-10.1 — DnD library



**Decision:** `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`.  

**Why:** нет DnD в `package.json`; dnd-kit — стандарт для React 19 / accessible sortable; HTML5 native хуже для horizontal bay + touch.  

**Reject:** HTML5 drag API as primary.



### ADR-10.2 — Mock vs API



**Decision:** UI-first mocks only (`lib/inspect-mock.ts` + Zustand). No Prisma / BullMQ / HeyGen / Remotion in Sprint 4.  

**Why:** DEV_PLAN Sprint 4 = Screen 3 shell; workers = Sprint 6+.



### ADR-10.3 — State location



**Decision:** single `lib/inspect-store.ts` created in C-10 with **complete** action surface; C-11/C-12 **do not edit** the store file — only call hooks.  

**Why:** avoid overlapping FE paths on shared store.



### ADR-10.4 — Right column stubs



**Decision:** C-10 ships placeholder `InspectControlPanel` + `HitlToolbar`; C-11/C-12 replace stub bodies in their owned files only.  

**Why:** shell layout stable before right-panel work.



### ADR-10.5 — Carousel UX



**Decision:** Preview mode toggle swaps main viewport (Reels vs focused carousel stage); thumbnail bay always visible for DnD (Stitch-aligned).  

**Why:** matches stitch strip + dual mode without losing reorder affordance.



## Role log



| When | Role | Decision |

|------|------|----------|

| 2026-09-18 | Orchestrator | Волна W-2026-09-18-sprint4; tickets C-10/C-11/C-12 |

| 2026-09-18 | Architect | Spec+chain C-10: route + left deck + full mock/store + stubs; dnd-kit deps |

| 2026-09-18 | Architect | Serial FE: C-10 → C-11 → C-12; path lock per overview |

| 2026-09-18 | Frontend | Viewport UX: toggle swaps main viewport (Reels 9:16 ↔ Carousel 4:5 stage); thumbnail bay always mounted under Reels and inside Carousel mode for DnD (ADR-10.5). Poster/slides use CSS gradients (no external image deps). |



## Rollback plan



1. `git checkout <before_sha> -- app/studio/inspect components/inspect lib/inspect-mock.ts lib/inspect-store.ts package.json package-lock.json` (или pnpm/yarn lock).

2. `status.md` → `rolled_back`; строка в `_index.md` если есть.

3. Папку `memory/tickets/C-10-inspect-media-deck/` **не удалять**.


