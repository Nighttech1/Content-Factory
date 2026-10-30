# Done — C-s8-04-schedule

**Дата:** 2026-10-15  
**Роль:** Backend  
**Wave:** W-2026-10-15-sprint8-postgres

## What changed

| Method | Path |
|--------|------|
| GET | `/api/schedule/slots?from=&to=` |
| POST | `/api/schedule/slots` (upsert by `postId`) |
| DELETE | `/api/schedule/slots?postId=` |
| GET/PATCH/DELETE | `/api/schedule/slots/[id]` |
| POST | `/api/schedule/slots/approve` |

### HITL
- `approve` → `status = SCHEDULED` (+ linked Draft `SCHEDULED` when present)
- Response always `published: false`, `socialPublish: false`
- **No** Instagram / Telegram / Meta publish clients imported

### Code
- `lib/db/schedule-repository.ts`
- Routes under `app/api/schedule/slots/**`

## Smoke
Approve → `scheduled`; unique `(userId, postId)` upsert OK.
