# Wave W-2026-10-07 — localhost deploy

| Field | Value |
|-------|-------|
| **Status** | UP (restarted after prior process exit_code=1) |
| **Environment** | localhost only (**не VPS / не prod**) |
| **URL** | http://localhost:3000 |
| **Command** | `npm run dev` (Next.js 15.5.25 Turbopack) |
| **Shell PID** | 16960 (restart) |
| **Listen PID** | see live :3000 |
| **Prisma** | `npx prisma generate` — OK (no migrate reset) |

## Smoke results

| URL | HTTP |
|-----|------|
| http://127.0.0.1:3000/ | 200 (follows redirect from `/`) |
| http://127.0.0.1:3000/studio | 200 |
| http://127.0.0.1:3000/studio/inspect/demo | 200 |

## Notes

- Port 3000 was free before start; no unrelated processes killed.
- Data safety: no Postgres/Redis volume wipe, no `prisma migrate reset`, no `generatedMedia` touch.
- Deployer only — Client acceptance not performed.
