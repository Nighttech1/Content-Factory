# Tester report — W-2026-10-15-sprint8-postgres (C-s8-07)

**Role:** Тестировщик  
**Date:** 2026-10-15  
**Ticket:** `C-s8-07-guards`  
**Guards:** `memory/tickets/C-s8-07-guards/guards.md`

---

## Summary

Repo-level Sprint 8 Postgres SoT guards **PASS**. Live Next HTTP probe **FAIL** because nothing Content Factory serves API routes — `:3000` is Grafana. **Deployer** must start Next on a free port before Client F5 acceptance. **No Fixer** product defects from this run.

---

## Commands run

| Command | Result |
|---------|--------|
| `npx tsx scripts/smoke-sprint8-api.ts` | `SMOKE_OK` (exit 0); store=`prisma` |
| `npx tsx scripts/smoke-sprint8-postgres-sot.ts` | `SMOKE_OK_REPO_GUARDS` + `HTTP_PENDING_DEPLOYER` (exit 0) |
| HTTP `http://localhost:3000/api/studio/drafts` + `x-cf-user-id` | **401** — Grafana, not Next |
| `docker ps` | `cf-postgres` up; `infra-grafana-1` **0.0.0.0:3000** |

---

## Acceptance matrix (wave §10 / D-s8-07)

| # | Check | Result |
|---|-------|--------|
| 1 | Existing smoke sprint8 API | **PASS** |
| 2 | Isolation other `x-cf-user-id` | **PASS** (repo list/get; other n=0) |
| 3 | Idempotent migrate-local ×2 | **PASS** (no dup explosion) |
| 4 | Approve ≠ social publish | **PASS** (static + runtime status `scheduled`) |
| 5 | shell_freeze AppShell/Sidebar | **PASS** (mtime before wave day; no git) |
| 6 | Persistence create→list | **PASS** |
| 7 | Design ≤10 | **PASS** |
| 8 | Live Next usable for Client | **FAIL → Deployer** |

---

## New / updated artifacts

- `scripts/smoke-sprint8-postgres-sot.ts` — hard-assert guards script  
- `memory/tickets/C-s8-07-guards/guards.md`  
- `.cursor/skills/client-review/regression-guards.md` — Sprint 8.7 row  

---

## Failures for Fixer

**None.** Do not change product code for this ticket.

## Failures for Deployer

1. Next.js app is **not running**.  
2. Port **3000 occupied by Grafana** — use another port (e.g. 3001).  
3. After start, re-run smoke with `CF_SMOKE_BASE_URL` so `http_persist_isolation` can flip to PASS.  
4. Hand off live URL to Client for Playwright F5.

---

`🧪 **ТЕСТИРОВЩИК:** repo SoT guards PASS; HTTP/Next PENDING Deployer (Grafana@:3000); guards.md + smoke-sprint8-postgres-sot.ts; Fixer N/A.`
