# Decisions — C-13

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(wave local)_ | Старт волны W-2026-09-18-sprint5 |
| **after_sha** | | После закрытия |

## ADR

### ADR-13.1 — Mock-first Analytics (UI wave)

**Decision:** Только `lib/analytics-mock.ts` (+ optional Zustand). Без Prisma / BullMQ / Instagram / YouTube / Analyst worker.  
**Why:** DEV_PLAN: «UI на моках раньше»; 5.4–5.6 отложены волной.  
**Reject:** wiring live APIs this wave.

### ADR-13.2 — Shared mock/store owned by C-13

**Decision:** C-13 создаёт полный seed + optional store; C-14/C-15 **не правят** `lib/analytics-mock.ts` / `lib/analytics-store.ts` — только consume.  
**Why:** path lock (как C-10 inspect-store).

### ADR-13.3 — Stubs for chart / insights / table

**Decision:** C-13 ships placeholder `RetentionChart`, `InsightsFeed`, `PublishedPostsTable`; C-14/C-15 fill own files only.  
**Why:** layout stable before chart/feed work.

### ADR-13.4 — KPI sparklines without chart lib

**Decision:** Inline SVG sparklines on KPI cards (Stitch pattern).  
**Why:** avoid pulling recharts into C-13; chart lib owned by C-14 for retention only.

### ADR-13.5 — recharts deferred to C-14

**Decision:** `recharts` **не** добавлять в C-13; см. ADR-14.1.  
**Why:** only RetentionChart needs it; keeps C-13 package surface minimal.

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Orchestrator | Волна W-2026-09-18-sprint5; tickets C-13/C-14/C-15 |
| 2026-09-18 | Architect | Spec+chain C-13: page shell + KPI + full mock/store + stubs |
| 2026-09-18 | Architect | Serial FE: C-13 → C-14 → C-15; path lock per overview |

## Rollback plan

1. `git checkout <before_sha> -- app/analytics components/analytics lib/analytics-mock.ts lib/analytics-store.ts` (если store создан).
2. `status.md` → `rolled_back`.
3. Папку `memory/tickets/C-13-analytics-kpi/` **не удалять**.
