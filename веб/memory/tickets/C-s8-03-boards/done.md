# Done — C-s8-03-boards

**Дата:** 2026-10-15  
**Роль:** Backend  
**Wave:** W-2026-10-15-sprint8-postgres

## What changed

| Method | Path |
|--------|------|
| GET | `/api/studio/boards` |
| POST | `/api/studio/boards` |
| GET/PATCH/DELETE | `/api/studio/boards/[id]` |
| POST | `/api/studio/boards/upload` (multipart or JSON dataUrl) |

### Media
- Upload → `public/generatedMedia/boards/{userId}/…`
- DB stores URL/path refs only (not base64 SoT)
- Does **not** delete unrelated media

### Code
- `lib/db/boards-repository.ts`
- Routes under `app/api/studio/boards/**`

## Smoke
Upload returned `/generatedMedia/boards/…`; list/upsert OK on Prisma.
