# Decisions — C-15

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(after C-14)_ | Старт FE C-15 |
| **after_sha** | | После закрытия |

## ADR

### ADR-15.1 — Insights are mock feed only

**Decision:** Render `AnalyticsSnapshot.insights` from C-13 mock; no LLM / worker.  
**Why:** DEV_PLAN 5.6 deferred; UI wave = mocks.  
**Reject:** calling OpenAI/Anthropic or inventing backend routes.

### ADR-15.2 — Published table is optional polish

**Decision:** Insights feed is acceptance-critical; published table may be light/stub without Hard REJECT.  
**Why:** Ticket notes + wave scope; Stitch table is secondary density.

### ADR-15.3 — Tone via existing NeonBadge

**Decision:** Map insight tones to existing `NeonBadge` tones / CSS tokens; no new design-system color scale this wave.  
**Why:** reuse Dark Luxury; avoid green-token bikeshed (`green` → gold/success chip).

### ADR-15.4 — No mock file edits

**Decision:** If copy/data insufficient, escalate — C-13 owns mock.  
**Why:** path lock across serial FE.

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Architect | C-15 = InsightsFeed + optional PublishedPostsTable; after C-14 |
| 2026-09-18 | Architect | Live Analyst → next wave 5.6 |

## Rollback plan

1. Restore stubs for InsightsFeed / PublishedPostsTable from C-13 stub state.
2. `status.md` → `rolled_back`.
3. Папку тикета **не удалять**.
