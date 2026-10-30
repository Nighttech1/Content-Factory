# Status — C-23

| Field | Value |
|-------|-------|
| **Status** | done |
| **Priority** | P0 |
| **Wave** | W-2026-09-20-sprint7-sse |
| **Opened** | 2026-09-20 Client (Sprint 7 / DEV_PLAN 7.1) |
| **Closed** | 2026-09-20 Client — **ПРИНЯТО** |
| **Deploy** | `deployed_localhost` (`http://127.0.0.1:3000`) |

## History

- 2026-09-20: opened by Client (Sprint 7 / DEV_PLAN 7.1).
- 2026-09-20: Architect — `architect-spec.md` + `chain.md` + `decisions.md` → **specced**.
- 2026-09-20: Backend — SSE route + mock emitter + `jobId` on generate → **backend_done**.
- 2026-09-20: Frontend — `hooks/useJobStream.ts` + store SSE wiring; drawer unchanged → **frontend_done**.
- 2026-09-20: Tester — `guards.md` + smoke S1 assert; unit GREEN; `:3000` offline (live gap for Deployer) → **tester_done**.
- 2026-09-20: Deployer — `npm run dev` on `:3000`; `/studio` 200; live smoke GREEN → **deployed_localhost**.
- 2026-09-20: Client — live accept: `/studio` 200; POST generate → `jobId`; SSE `text/event-stream` frames≥1 (progress 0→100); store `openJobStream` / no `runSimulatedPipeline`; `data-testid="generation-drawer"`. Playwright MCP **gap** (HTTP+smoke+source, as Sprint 6). DEV_PLAN **7.1** `[x]` → **done**.

## Client evidence (2026-09-20)

| Check | Result |
|-------|--------|
| `GET /studio` | 200 |
| `POST /api/modules/carousel-engine/generate` | 200, `ok` + `jobId` + draft |
| `GET /api/jobs/:id/stream` | 200, `text/event-stream`, 6 frames with `progress` |
| Smoke `BASE_URL=… npx tsx scripts/smoke-c23-sse.ts` | `SMOKE_C23_HTTP_OK` frames=6 + S1 no-simulate |
| Source | `GenerationDrawer` testid; store `openJobStream` |
| Playwright MCP | **gap** — not in session MCP list |
