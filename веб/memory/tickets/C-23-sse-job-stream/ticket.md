# C-23 — Live SSE job stream for Generation Drawer

| Field | Value |
|-------|-------|
| **ID** | `C-23` |
| **Priority** | P0 |
| **Area** | studio / generation_drawer / realtime |
| **Wave** | W-2026-09-20-sprint7-sse |
| **Opened by** | Client — Sprint 7 kickoff (DEV_PLAN 7.1) |
| **Status** | done — Client **ПРИНЯТО** 2026-09-20 (DEV_PLAN 7.1) |

## Repro (current gap)

1. Open `http://localhost:3000/studio`, select a module, enter topic, click **Generate Draft**.
2. Drawer opens; agent steps and progress advance via **client-side simulation** (`runSimulatedPipeline`), not server events.
3. There is **no** `GET /api/jobs/:id/stream` and **no** `useJobStream(jobId)`.

**URL:** `http://localhost:3000/studio`

## Expected

- After generate starts, UI receives live events `{ status, agent, message, progress }` over SSE.
- Hook `useJobStream(jobId)` drives drawer steps/progress (reconnect with `Last-Event-ID` when possible).
- No aggressive polling when SSE is connected.
- Without Redis/BullMQ: mock stream still advances steps so localhost demo works.
- Skill contract: `.cursor/skills/sse-job-stream/SKILL.md`.

## Actual

Simulated pipeline only; SSE endpoint and hook missing.

## Notes for Orchestrator

Зона: **Backend** (stream route + job id) → **Frontend** (hook + store/drawer wiring).  
Не ломать mock generate C-20/C-22. Guard: open EventSource → receive ≥1 progress event → drawer `data-step-state` changes without reload.
