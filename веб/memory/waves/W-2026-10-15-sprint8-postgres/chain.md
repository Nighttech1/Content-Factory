# Chain — W-2026-10-15-sprint8-postgres

> **ticket_limit:** `full-queue` (не резать на пачки по 3)  
> **shell_freeze:** `true`  
> **Запрет:** параллелить overlapping Backend schema/API paths; Motion / AI Bridge **out**  
> Wave spec: `memory/waves/W-2026-10-15-sprint8-postgres/architect-spec.md`

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | Trainer | — | grade `memory/trainer/2026-10-15-sprint8-postgres-grade.md` | [x] | B — skills gaps closed |
| 1 | **Architect** | wave | `architect-spec.md` + this `chain.md` + tickets C-s8-* | [x] | Spec locked; no product code |
| 2 | **Backend** | **C-s8-01** | `prisma/schema.prisma`, `prisma/migrations/*` only (+ seed upsert User if needed) | [x] | Additive Draft/Board/ScheduleSlot/DesignSlot; migration `20261015170000_sprint8_sot` **applied** + seed OK (cf-postgres volume) |
| 3 | **Backend** | **C-s8-02** | `app/api/studio/drafts/**`, `lib/db/*draft*` (new), actor helper | [x] | CRUD drafts scoped userId; actor + CF_DEV_USER_ID |
| 4 | **Backend** | **C-s8-03** | `app/api/studio/boards/**`, storage under `generatedMedia/boards/` (or existing storage util) | [x] | Boards CRUD + upload → URLs |
| 5 | **Backend** | **C-s8-04** | `app/api/schedule/**`, link Draft/ContentJob; **no** social clients | [x] | Slots from DB; approve → SCHEDULED only |
| 6 | **Backend** | **C-s8-05** | `app/api/settings/design-slots/**`, extend `design-active` + `lib/settings/design-active-server.ts` (Postgres first) | [x] | ≤10; active from server (Postgres first) |
| 7 | **Backend** | **C-s8-06** (API) | `app/api/studio/migrate-local/route.ts` | [x] | Idempotent import endpoint (FE wire still open) |
| 8 | **Frontend-minimal** | **C-s8-06** (FE) | `lib/studio/carousel-drafts-store.ts`, `boards-store.ts`, `lib/schedule/storage.ts`, `lib/settings/design-library.ts` (+ thin client fetch helpers). **Не** AppShell/Sidebar/nav | [x] | Stores SoT=API; one-shot import; no shell redesign (`done-fe.md`) |
| 9 | **Tester** | **C-s8-07** | `memory/tickets/C-s8-07-guards/guards.md` + smoke script | [x] | Repo guards PASS (`smoke-sprint8-postgres-sot.ts` + `smoke-sprint8-api.ts`); HTTP/Next PENDING Deployer (Grafana@:3000); report `tester-report.md` |
| 10 | **Fixer** | as needed | only failing paths from Tester | [x] | N/A — Deployer HTTP smoke green (no fail to fix) |
| 11 | **Deployer** | localhost | restart/update local API if present | [x] | Live `http://localhost:3001` · SMOKE_OK · `deployer.md` |
| 12 | **Client** | accept | Playwright persistence smoke @1440 | [x] | ПРИНЯТО С ЗАМЕЧАНИЯМИ — `client-verdict.md` |}

## Path locks (no overlap writers)

1. **Schema:** only step 2 writes `prisma/schema.prisma`.  
2. **Drafts API → Boards API → Schedule API → Design API** sequential (steps 3–6).  
3. **Import API** after 3–6 exist.  
4. **Frontend-minimal** after import API; one writer on the four store files.  
5. **Shell files** (`AppShell`, `SidebarNavigation`, `MenuVertical`, module top nav): **0** edits this wave.

## Out of chain

Motion · AI Bridge · full Frontend redesign · social publish · Auth UI.
