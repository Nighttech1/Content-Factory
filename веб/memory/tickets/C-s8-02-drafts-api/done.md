# Done — C-s8-02-drafts-api

**Дата:** 2026-10-15  
**Роль:** Backend  
**Wave:** W-2026-10-15-sprint8-postgres

## What changed

### Actor helper (shared for Sprint 8)
- `lib/db/actor.ts` — resolve `userId` from `x-cf-user-id` → cookie `cf_user_id` → `CF_DEV_USER_ID` → seed `user_seed_admin_c16` (upsert if missing)
- `.env.example` — documented **name** `CF_DEV_USER_ID` only

### Drafts API
| Method | Path |
|--------|------|
| GET | `/api/studio/drafts?moduleId=` |
| POST | `/api/studio/drafts` (upsert by id) |
| GET | `/api/studio/drafts/[id]` |
| PATCH | `/api/studio/drafts/[id]` |
| DELETE | `/api/studio/drafts/[id]` |

### Storage
- `lib/db/drafts-repository.ts` + `lib/db/sprint8-db.ts` / `sprint8-mappers.ts` / `sprint8-fallback.ts`
- Prisma primary; JSON fallback `data/local/sprint8-sot.json` if DB down
- Isolation: other user → 403/404
- Shape mirrors `CarouselDraft` (`brand`/`competitor` → `payload`)

## Smoke
`npx tsx scripts/smoke-sprint8-api.ts` — draft upsert + isolation OK (`sprint8-store=prisma`)

## Out of scope
No FE store wire; no AppShell edits; no social publish.
