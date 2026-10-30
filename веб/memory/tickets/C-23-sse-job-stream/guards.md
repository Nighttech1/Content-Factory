# Guards — C-23 SSE job stream

Date: 2026-09-20  
Role: Tester  
Result: **GREEN** (unit/mock + source; live HTTP deferred — `:3000` offline)

Executable smoke:
- `npx tsx scripts/smoke-c23-sse.ts` → `SMOKE_C23_S1_NO_SIMULATED_PIPELINE_OK` + `SMOKE_C23_OK`
- Live (when Deployer brings up localhost):
  `BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c23-sse.ts`
  → expects `SMOKE_C23_LIVE_404_OK` + `SMOKE_C23_HTTP_OK` (generate → jobId → ≥1 progress frame)

Anti-slop: `python plugins/frontend/anti_slop_scan.py .` → **OK** (2026-09-20)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Mock registry: create job → ≥4 agent events → `completed` @ progress 100 | GREEN | `SMOKE_C23_OK` events=6; agents researcher/hook_writer/script_writer/designer |
| G2 | Progress field present on stream events | GREEN | smoke asserts `progress` + final 100 |
| G3 | Last-Event-ID / replay filter (`getEventsAfter`) | GREEN | `after2.every(id > 2)` in smoke; route replays via `?lastEventId=` / header |
| G4 | Unknown job → 404 `job_not_found` | SOURCE+SMOKE | unit: `getJob("job_missing")` undefined; live HTTP path in smoke when BASE_URL up; route returns `{ ok:false, error:"job_not_found" }` |
| G5 | Generate returns `ok` + `jobId` | SOURCE | `app/api/modules/[moduleId]/generate/route.ts` calls `createJobWithMockStream()` and includes `jobId` in JSON; live asserted by smoke when server up |
| G6 | S1: store no `runSimulatedPipeline`; uses `openJobStream` | GREEN | smoke file-read assert + grep `lib/` `components/` `hooks/` — zero matches for `runSimulatedPipeline` |
| G7 | SSE content-type `text/event-stream` | SOURCE / LIVE | `app/api/jobs/[id]/stream/route.ts`; live smoke checks header when BASE_URL set |
| G8 | anti-slop scan | GREEN | `anti_slop_scan: OK` |

## Live gap (Deployer)

At Tester run, `http://127.0.0.1:3000` was **unreachable**. Core contract validated in-process (no Redis required). After `npm run dev`:

```bash
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c23-sse.ts
# Expect: SMOKE_C23_LIVE_404_OK + SMOKE_C23_HTTP_OK frames≥1
```

Manual UI: `/studio` → module → topic → Generate Draft → Network `…/api/jobs/<id>/stream` event-stream ≥1 progress; drawer `data-step-state` advances without reload.

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| Generate opens drawer (S1) | GREEN (wiring: openJobStream; no simulate) — Client 2026-09-20 source+HTTP |
| Steps/progress from server SSE | GREEN (mock emitter + store applyJobStreamEvent) |
| Network event-stream ≥1 progress | GREEN live Client — 6 frames `progress` on `job_67607979…` |
| No Redis still demos | GREEN (in-memory registry smoke) |
| Generate still returns mock draft + jobId | GREEN live — POST generate 200 + jobId + draft |

## Failures for Fixer

none

## Re-run

```bash
npx tsx scripts/smoke-c23-sse.ts
python plugins/frontend/anti_slop_scan.py .
# with server:
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c23-sse.ts
```

## Mirror in Client skill

| C-23 | SSE live progress; no runSimulatedPipeline | smoke-c23 | `scripts/smoke-c23-sse.ts` + this file |
