# C-25 — E2E QA: Armenian fonts + mesh RBAC

| Field | Value |
|-------|-------|
| **ID** | `C-25` |
| **Priority** | P1 |
| **Area** | inspect / admin_mesh / e2e |
| **Wave** | W-2026-09-20-sprint7-sse |
| **Opened by** | Client — Sprint 7 kickoff (DEV_PLAN 7.3) |
| **Status** | done — Client **ПРИНЯТО** 2026-09-20 (DEV_PLAN 7.3); Sprint 7 согласовано |

## Checks required

1. **Armenian glyphs** on `/studio/inspect/:id` — Noto Sans Armenian (or equivalent) renders without tofu/clipping in hook panel / script.
2. **RBAC:** role `ADMIN` cannot open `/admin/mesh` (redirect or deny); only `OWNER` sees Mesh.
3. Regression smoke: S1 drawer still opens; Generate still works with C-23 stream.

**URL:** `http://localhost:3000/studio/inspect/...`, `http://localhost:3000/admin/mesh`

## Expected

- Hard REJECT criteria from `client.mdc` remain green (S1–S3, no grid chaos, no mobile h-scroll on drawer).
- Automated guards in `guards.md` for fonts CSS + mesh deny for ADMIN.

## Actual

Mesh page has ADMIN redirect in source; need verified guard + font check as Sprint 7 close-out.

## Notes for Orchestrator

Зона: **Tester** (primary) + Frontend only if gaps found.  
Guard scripts preferred (HTTP + role cookie/header + CSS font-family assert). Playwright MCP if available; else honest gap + script smoke like Sprint 6.
