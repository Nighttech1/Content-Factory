# Sprint 5 live contour — overview

Wave: `memory/waves/W-2026-09-19-sprint5-live.md`  
UI mocks (C-13…C-15): done. This wave: **5.5 → 5.4 → 5.6** (ticket order C-16 → C-17 → C-18).

## Ticket order & ownership

| Order | ID | DEV_PLAN | Primary roles | Chain file |
|-------|-----|----------|---------------|------------|
| 1 | **C-16** | 5.5 schema | Backend → Tester → Fixer → Deployer → Client | `C-16-post-analytics-schema/chain.md` |
| 2 | **C-17** | 5.4 ingest | Backend → … → Client | `C-17-analytics-cron-ingest/chain.md` |
| 3 | **C-18** | 5.6 analyst | **AI Bridge → Backend → Frontend** → … → Client | `C-18-analyst-worker-feed/chain.md` |

## Local fallback strategy (Architect)

| Concern | Canonical | Localhost without infra |
|---------|-----------|-------------------------|
| DB | Prisma **`postgresql`** + `DATABASE_URL` in `.env.example` | **JSON/in-memory** `analytics-repository` (`data/local/`) — no SQLite provider, no Docker required |
| Queue | BullMQ + Redis | **Same ingest handler** via `node-cron` / CLI / `POST /api/analytics/ingest` |
| IG / YT | Graph + YT Analytics APIs | **Mock adapters** (mandatory) |
| LLM | Real key → Analyst run | **Deterministic mock insights** from aggregates; FE also falls back to C-13 mock |

## Path ownership (no overlap)

- **C-16:** `prisma/**`, `lib/db/**`, `.env.example`, seed
- **C-17:** `lib/analytics/ingest*`, `adapters/**`, scheduler, ingest API/script
- **C-18 AI Bridge:** `workers/analyst/**`, `lib/analyst/**`
- **C-18 Backend:** `app/api/analytics/insights|snapshot`
- **C-18 Frontend:** `InsightsFeed` + thin API client / store hydrate

## Safety

No `migrate reset`, DROP, volume wipe. Secrets never in memory/git.

## Stop

**Closed 2026-09-19 by Client (согласовано).** DEV_PLAN 5.4–5.6 `[x]`. Sprint 5 complete. Next = Sprint 6.
