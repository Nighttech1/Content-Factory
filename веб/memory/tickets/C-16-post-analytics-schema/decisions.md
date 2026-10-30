# Decisions — C-16

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Prisma provider | **`postgresql` only** | ARCHITECTURE §5–6 канон; не ветвить schema на sqlite. |
| Local without Postgres | **In-memory / JSON-file repository** behind same interface | Zero-infra localhost; Client accepts without Docker; no data wipe. |
| SQLite file `prisma/dev.db` | **Rejected** | Avoid dual-provider schema drift; fallback is application-level, not second Prisma provider. |
| Docker-compose | **Optional note only** in `.env.example` comments | Do not force compose or volume recreate in this ticket. |
| Minimal models | User + ContentJob + enums + PostAnalytics | Enough for FK + seed; rest of factory schema later sprints. |
| Seed location | `prisma/seed.ts` preferred | Standard Prisma; alt `scripts/` OK if documented. |
| Secrets | `.env.example` placeholders only | Real keys never in memory/git. |
| Prisma major | **`^6.19`** (not 7) | Spec uses classic `url = env("DATABASE_URL")` in schema; Prisma 7 requires `prisma.config.ts` + driver adapters — out of C-16 scope. |
| npm scripts | `db:generate`, `db:migrate` (= deploy), `db:migrate:dev`, `db:seed`, `db:verify` | Documented names for Deployer/Tester. |
| ContentJob indexes | `userId`, `status`, `moduleId`, `createdAt` | From `prisma-content-schema` skill; additive beyond ARCHITECTURE body. |
| Seed path | `prisma/seed.ts` | Also wired as `package.json#prisma.seed`. |

## Fallback behavior

1. Boot: try `DATABASE_URL` → Prisma.
2. On missing URL or connect error → `analytics-store=fallback` (log once) → `data/local/post-analytics.json`.
3. C-17/C-18 **must** use repository interface, never raw Prisma in job/API handlers.

## Safety reminder

No `migrate reset`, no DROP, no volume delete.
