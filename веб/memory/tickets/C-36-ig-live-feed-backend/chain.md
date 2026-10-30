# Chain — C-36

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-35 Done (AI Bridge + Tester green).  
> **Порядок волны:** C-35 → **C-36** → C-37.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/studio/feed-types.ts`, `lib/studio/feed-fixtures.ts` (add `sourceMode:"mock"`), `lib/studio/ig-feed-config.ts` (new), `lib/studio/ig-feed-cache.ts` (new), `lib/studio/ig-live-feed.ts` (new), optional `lib/analytics/adapters/ig-token.ts` (shared readIgToken), `app/api/studio/[moduleId]/feed/route.ts`, `.env.example`, `scripts/smoke-c36-ig-feed.ts` (new) | [x] | Skills: `backend`. Reuse soft-fail pattern from `instagram-graph.ts`. **No** BullMQ, **no** Prisma, **no** HTML scrape. Cache TTL ~10 min in-memory. |
| 2 | Tester | `memory/tickets/C-36-ig-live-feed-backend/guards.md` | [x] | GREEN: smoke mock OK; HTTP 200 mock without token; heygen stays mock; secrets clean; TTL 10m; live skipped (unconfigured) |
| 3 | Fixer | _(если красное)_ | [ ] | Surgical; no architecture change |
| 4 | Deployer | localhost `:3000`; restart/refresh local API after build | [x] | Smoke OK: `/api/studio/carousel-engine/feed` 200, `sourceMode:mock`; reused healthy server; no VPS |
| 5 | Client | приёмка API/контракта (можно вместе с C-37 UX) | [ ] | P0: no 500 without token |

Skills: `backend`; IG adapter patterns in `lib/analytics/adapters/instagram-graph.ts`.  
BullMQ **not** required. Frontend — **C-37 only**.
