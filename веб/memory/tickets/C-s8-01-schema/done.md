# Done — C-s8-01-schema

**Дата:** 2026-10-15  
**Роль:** Backend  
**Wave:** W-2026-10-15-sprint8-postgres

## What changed

### `prisma/schema.prisma`
Additive models + enums (existing `User` / `ContentJob` / `PostAnalytics` untouched aside from reverse relations):

| Model / enum | Notes |
|--------------|--------|
| `Draft` + `DraftStatus` (`UNPUBLISHED`, `SCHEDULED`) | FK `userId`; optional `contentJobId`; indexes `[userId,moduleId]`, `[userId,updatedAt]` |
| `Board` | `slideUrls` Json (URL refs); `@@index([userId])` |
| `ScheduleSlot` + `ScheduleSlotStatus` (`DRAFT`, `SCHEDULED`) | optional `draftId` / `contentJobId`; `@@unique([userId,postId])`; `@@index([userId,startsAt])` |
| `DesignSlot` | `label`, `markdown`, optional `html`/`previewUrl`/`brandbook`; `isActive`, `sortOrder`; indexes on `userId` / `[userId,isActive]` |

**BoardItem:** not in architect field map — skipped (Board uses `slideUrls` Json).

### Migration
- **Name:** `20261015170000_sprint8_sot`
- **Path:** `prisma/migrations/20261015170000_sprint8_sot/migration.sql`
- **DDL:** CREATE TYPE / CREATE TABLE / indexes / FKs only — **no DROP** of tables/columns

### Seed
- Existing `prisma/seed.ts` already upserts `user_seed_admin_c16` via `ensureSeedFixtures` — no seed code change required for FK readiness.

## Commands run

| Command | Result |
|---------|--------|
| `npx prisma generate` | **OK** (client v6.19.3) |
| `npx prisma migrate deploy` | **Applied** later in wave (C-s8-02…06 Backend) — init + `20261015170000_sprint8_sot` |
| Docker / local Postgres | `cf-postgres` volume started; seed OK |

Follow-up (same wave Backend): migrate deploy + `npm run db:seed` succeeded without reset.

## Data safety

- No `migrate reset`, no volume wipe, no `generatedMedia` touch
- No API routes / AppShell / UI changes (out of scope)

## Next

C-s8-02 Drafts API after Postgres is reachable and this migration is applied (Tester early check optional).
