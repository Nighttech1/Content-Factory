# Status — C-16

| Status | **done** |
| Owner | Client (closed) |
| Updated | 2026-09-19 |

Spec: `architect-spec.md` · Chain: `chain.md` · Decisions: `decisions.md`

## Backend summary

- Prisma **postgresql** schema: `User` / `Role` / `ContentJob` / `JobStatus` / `PostAnalytics` (+ ContentJob indexes).
- Additive migration SQL: `prisma/migrations/20260919000000_init_post_analytics/` (no `migrate reset` / DROP).
- Repository: `lib/db/analytics-repository.ts` → Prisma if `DATABASE_URL` connects, else JSON `data/local/post-analytics.json`.
- Seed: `prisma/seed.ts` (1 ADMIN, 3 PUBLISHED jobs, 6 snapshots) — idempotent stable ids.
- Deps: `@prisma/client@6`, `prisma@6`, `tsx` (Prisma 7 rejected — needs adapters/`prisma.config.ts`).

**Postgres not available on this machine** → JSON fallback is active. Migration SQL is ready for when DB exists.

## Deployer (localhost)

- Next.js `:3000` HTTP 200
- `npm run db:seed` → `analytics-store=fallback` jobs=3 snapshots=6
- `scripts/sprint5-live-guards.mjs` → GREEN
- No VPS

## Client

- **[x] Client checkbox** — ПРИНЯТО 2026-09-19
- Live: schema/repo/fallback files present; guards GREEN; `.env` not in git; `.env.example` placeholders only
- Playwright MCP недоступен — приёмка по HTTP + guards + wiring

## Next

—
