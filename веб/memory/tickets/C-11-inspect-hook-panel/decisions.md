# Decisions — C-11

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | _(after C-10 FE)_ | Старт C-11 |
| **after_sha** | | После закрытия |

## ADR

### ADR-11.1 — No store ownership

**Decision:** C-11 only consumes `lib/inspect-store.ts` actions from C-10.  
**Why:** path lock; serial FE without merge conflicts on store.

### ADR-11.2 — Hook swap = Client S2

**Decision:** `selectHook` must change ACTIVE chip + displayed Hook Score in the same paint.  
**Why:** Client Hard REJECT S2.

### ADR-11.3 — HeyGen UI-only

**Decision:** Persona selects are local state via store; no `HEYGEN_API_KEY`, no network.  
**Why:** Sprint 4 UI-first; API = later sprints / AI Bridge.

### ADR-11.4 — Script editor control

**Decision:** Prefer controlled `<textarea>` + derived counters; optional static highlight legend without full rich-text kit.  
**Why:** less deps; a11y; Armenian font via CSS variable.

## Role log

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Architect | Spec+chain C-11: ControlPanel + 4 children; no left deck / toolbar / store edits |
| 2026-09-18 | Architect | Serial after C-10 FE |

## Rollback plan

1. Restore stub `InspectControlPanel.tsx`; delete C-11 child components.
2. `status.md` → `rolled_back`.
3. Папку тикета не удалять.
