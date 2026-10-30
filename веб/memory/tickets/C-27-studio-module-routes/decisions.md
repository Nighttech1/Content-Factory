# Decisions — C-27

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route shape | `/studio/[moduleId]` dynamic | Matches ticket; one page file for all modules |
| Module ids | Canonical only (`carousel-engine`, …) | Align with SDK manifests / id-map |
| Reserved segment | `inspect` stays static route; reject as moduleId | Avoid collision |
| Launch command bar | Remove from `/studio` (do not delete file yet — C-28 may reuse pieces) | Product: idea only on module page |
| GenerationDrawer on launch | Remove from launch page | Generate lives on workspace (C-28) |
| C-27 module page depth | Thin shell OK | Full dual-carousel + editor = C-28 |
| Sidebar children source | Same as ModuleSelectorGrid manifests | Single source of truth |
| 21st id=24865 · element=Sidebar Nav Group · motion=yes | Chevron + nested Studio children in existing sidebar; Dark Luxury retoken; AnimatePresence springs (not Radix Collapsible) | Catalog pattern adapted, not installed as new package |
| Module page shell UI | Reuse GlassCard / NeonBadge | Thin C-27 placeholder; full workspace = C-28 |
| Unknown moduleId | Soft empty after custom hydrate; `inspect` → notFound() | Avoid colliding with HITL route; custom ids need store |
