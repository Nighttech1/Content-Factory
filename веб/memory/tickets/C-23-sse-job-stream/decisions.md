# Decisions — C-23 SSE Job Stream

## JobId source

**Chosen:** `POST /api/modules/[moduleId]/generate` returns `jobId` alongside existing `draft`.

| Option | Verdict |
|--------|---------|
| Separate `POST /api/jobs` then generate | Extra round-trip; harder for current store |
| **Generate returns jobId** | Keeps C-20/C-22 generate path; one client flow |
| Client-only fake jobId | Breaks real EventSource contract |

## Transport without Redis

**Chosen:** in-memory mock emitter on `globalThis` (same lesson as C-22 registry).

- If Redis/BullMQ later present: Backend may swap emitter to queue events **without** changing SSE event shape.
- Localhost demo **must not** require Redis.

## Unknown job

**Chosen:** HTTP `404` JSON `{ ok: false, error: "job_not_found" }` **before** opening SSE body if job missing. Do not hang an empty stream. (Backend confirmed 2026-09-20 — matches Architect preference; not a single `failed` SSE event.)

## Client simulation

**Chosen:** remove `runSimulatedPipeline` as the driver of steps once SSE wired. Temporary dual-path (SSE preferred, simulate fallback) allowed only if EventSource constructor throws — document in guards if used.

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec + chain + decisions | Done |
| 2026-09-20 | Backend | `lib/jobs/**` + `GET …/stream` + `jobId` on generate; 404 unknown; smoke `scripts/smoke-c23-sse.ts` | Done |
| 2026-09-20 | Frontend | `hooks/useJobStream.ts` (`openJobStream` + React hook); store drops timers, maps agents→steps, awaits SSE completed (6s) then force done; GenerationDrawer untouched | Done |

## Rollback

1. Revert stream route + `lib/jobs/**`; strip `jobId` from generate response.
2. Restore `runSimulatedPipeline` in store.
3. `status.md` → `rolled_back`; ticket folder keep.
