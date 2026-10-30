# Done — C-s8-05-design-lib

**Дата:** 2026-10-15  
**Роль:** Backend  
**Wave:** W-2026-10-15-sprint8-postgres

## What changed

| Method | Path |
|--------|------|
| GET/POST | `/api/settings/design-slots` |
| GET/PATCH/DELETE | `/api/settings/design-slots/[id]` |
| POST | `/api/settings/design-slots/[id]/activate` |
| GET/POST/DELETE | `/api/settings/design-active` (extended) |

### Behavior
- Cap ≤10 → **409** `design_library_full`
- Activate atomically (one `isActive` per user) + JSON cache write
- `design-active` GET: **Postgres first**, fallback `data/local/design-active.json`
- POST sync writes Postgres active slot + optional JSON cache
- Does not log full markdown

### Code
- `lib/db/design-slots-repository.ts`
- Updated `app/api/settings/design-active/route.ts`

## Smoke
11th create hits cap; activate survives; dual-read path wired.
