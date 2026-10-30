# Decisions — C-33

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | `N/A` (no git HEAD at spec) | Spec 2026-09-20 |
| **after_sha** | | После закрытия |

## Product / tech decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Logo path | `public/brand/vernatun-logo.svg` | Ticket |
| DESIGN source | Copy stitch `atelier_synth/DESIGN.md` → `docs/DESIGN.md` | Symlink fragile on Windows |
| Loader | `lib/brand/loadBrandKit.ts` | Shared module for UI + agents |
| API | `GET /api/brand-kit` | Ticket; JSON BrandKit |
| Page | Upgrade existing `/brand-kit` | Already in sidebar |
| Razbor | Designer/draft factory consumes brand pack | Ticket |
| Secrets | None in brand payload | Safety |
| DB | No brand tables this wave | Safety / scope |
| Shell tokens | Do not wholesale rewrite `globals.css` | Avoid C-02 regression |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec+chain+decisions | status → specced |
| 2026-09-20 | Backend | DESIGN copy, logo SVG, loadBrandKit, API, razbor wire, smoke | Done |
| 2026-09-20 | Frontend | `/brand-kit` logo + DESIGN + palette | Done |
| 2026-09-20 | Motion | skipped | FE enough |

## Rollback plan

1. Revert brand-kit page to placeholder; remove API/lib/brand; restore pipeline mock slides without brand pack; keep or delete `docs/DESIGN.md` + logo as needed.
2. `status.md` → `rolled_back`.
3. Keep ticket folder.
4. Localhost sync.
