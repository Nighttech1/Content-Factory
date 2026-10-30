# Done — C-s8-06-import-fe (**API only**)

**Дата:** 2026-10-15  
**Роль:** Backend  
**Wave:** W-2026-10-15-sprint8-postgres

## What changed (this Backend step)

| Method | Path |
|--------|------|
| POST | `/api/studio/migrate-local` |

### Body
`{ drafts?, boards?, schedule?, designLibrary?, designActiveId? }`

### Behavior
- Idempotent upsert by stable ids
- Boards: `data:` → upload to storage → URL refs; `blob:` skipped
- Returns per-bucket `{ upserted, skipped, errors }` + `migratedAt` + `storeMode`
- Does **not** import chrome keys (sidebar width, schedule popup pos, etc.)

### Code
- `lib/db/migrate-local.ts`
- `app/api/studio/migrate-local/route.ts`
- Smoke helper: `scripts/smoke-sprint8-api.ts`

## Not in this step
Frontend-minimal store wire (`carousel-drafts-store`, `boards-store`, `schedule/storage`, `design-library`) — separate chain step 8.

## Smoke
Second migrate upserted same ids without dup storms.
