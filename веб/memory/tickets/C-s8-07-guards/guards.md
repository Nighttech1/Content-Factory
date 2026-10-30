# Guards — C-s8-07 (Sprint 8.7 Postgres SoT)

**Date:** 2026-10-15  
**Wave:** `W-2026-10-15-sprint8-postgres`  
**Smoke:** `npx tsx scripts/smoke-sprint8-postgres-sot.ts`  
**Legacy smoke:** `npx tsx scripts/smoke-sprint8-api.ts` → `SMOKE_OK`  
**Store mode observed:** `prisma` (cf-postgres)

## Verdict

| Scope | Result |
|-------|--------|
| Repo / Prisma SoT guards (D-s8-07-*) | **PASS** |
| Live Next HTTP (`CF_SMOKE_BASE_URL`) | **FAIL / PENDING Deployer** |
| Overall C-s8-07 code gates for Fixer | **PASS** (no product Fixer work) |
| Client F5 @1440 | Blocked until Deployer starts Next |

---

## Checks

| ID | Lock | Result | Evidence |
|----|------|--------|----------|
| `smoke_sprint8_api` | baseline 8.2–8.6 | **PASS** | `scripts/smoke-sprint8-api.ts` → `SMOKE_OK` (draft/board/upload/approve/design_cap/migrate/isolation_empty) |
| `persist_draft_list` / `persist_draft_get` / `persist_board_list` | D-s8-07-f5 (API SoT) | **PASS** | create → list/get still present (`guard_draft_*` / `guard_board_*`) |
| `isolation_drafts` / `isolation_boards` / `isolation_get_foreign` | D-s8-07-iso | **PASS** | actor `user_other_s8_guards` lists empty of seed ids; `getDraft` foreign → `null` |
| `migrate_idempotent_counts` / `migrate_no_dup_explosion` / `migrate_board_no_dup` | D-s8-07-import | **PASS** | migrate×2 upserted=1 each; draft/board id occurrences = 1 |
| `approve_scheduled` / `approve_persisted` / `approve_no_social_static` | D-s8-07-hitl | **PASS** | status `scheduled`; route `SOCIAL_PUBLISH_DISABLED=true` + `socialPublish:false`; no IG/Meta/Telegram imports in approve route or `schedule-repository` |
| `design_cap_le10` | D-s8-07-cap | **PASS** | `DesignLibraryFullError` on 11th (`capHit=true`, count=10) |
| `shell_freeze` | D-s8-07-shell | **PASS** | No git repo — mtime: `AppShell.tsx` 2026-10-07, `SidebarNavigation.tsx` 2026-10-14 (both **before** wave day 2026-10-15). FE stores touched 2026-10-15 only. |
| `http_live_next` | D-s8-07-evidence live | **FAIL** | Next **not** listening. `:3000` = Docker `infra-grafana-1` (401 on `/api/studio/*`). Set `CF_SMOKE_BASE_URL` after Deployer starts Next on a **free** port (≠3000). |

---

## Deployer note (not Fixer)

1. Port **3000 is Grafana** (`infra-grafana-1`). Do **not** bind Next there.
2. Start Content Factory Next, e.g. `PORT=3001 npm run dev` (or agreed free port).
3. Re-run:  
   `CF_SMOKE_BASE_URL=http://localhost:3001 npx tsx scripts/smoke-sprint8-postgres-sot.ts`  
   Expect `http_persist_isolation` **PASS** + `SMOKE_OK`.
4. Then Client Playwright F5 persistence @1440.

## Fixer

**No Fixer failures** from repo guards. Do not weaken assertions.

## Re-run command

```bash
npx tsx scripts/smoke-sprint8-api.ts
npx tsx scripts/smoke-sprint8-postgres-sot.ts
```
