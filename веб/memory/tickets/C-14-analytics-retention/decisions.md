# Decisions — C-14

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(after C-13)_ | Старт FE C-14 |
| **after_sha** | | После закрытия |

## ADR

### ADR-14.1 — Chart library = recharts

**Decision:** Add **`recharts`** in C-14 (`package.json` + lock).  
**Why:** Not in deps today; React-friendly declarative API; fits LineChart + Tooltip + Legend; wave note prefers recharts.  
**Reject:** Chart.js, Nivo, Victory, hand-rolled SVG as primary (SVG fallback only if recharts blocked — escalate).

### ADR-14.2 — Consume-only mock/store

**Decision:** C-14 does not edit `lib/analytics-mock.ts` / `lib/analytics-store.ts`.  
**Why:** path ownership; C-13 owns shared data.

### ADR-14.3 — Series set

**Decision:** Three series only: HeyGen Reel, Editorial Carousel, Motion Toon (cartoon) — Stitch + DEV_PLAN 5.2.  
**Why:** Screen 4 comparative retention; no extra formats this wave.

### ADR-14.4 — Client-only chart

**Decision:** RetentionChart is a Client Component; recharts not imported from RSC page.  
**Why:** Next 15 App Router + browser chart APIs.

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Architect | recharts owned by C-14; KPI sparklines stay SVG (ADR-13.4) |
| 2026-09-18 | Architect | Serial after C-13; path = RetentionChart + package only |

## Rollback plan

1. Restore stub RetentionChart; `git checkout <before_sha> -- components/analytics/RetentionChart.tsx package.json` (+ lock).
2. Remove recharts if no other consumer.
3. Папку тикета **не удалять**.
