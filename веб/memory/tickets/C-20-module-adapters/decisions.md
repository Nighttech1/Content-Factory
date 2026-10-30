# Decisions — C-20 Module Adapters (Backend)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-19 | Mock-first for all four adapters | Client acceptance without `HEYGEN_API_KEY` / GPU / Redis |
| 2026-09-19 | Process-local `draft-store` Map | `regenerateElement` needs draft without Prisma; Sprint 7 may persist |
| 2026-09-19 | Remotion only if `ENABLE_REMOTION_RENDER=1` | Avoid blocking Next.js request; still falls back to mock URL until worker attached |
| 2026-09-19 | HeyGen via `lib/ai/heygen-gateway.ts` stub | Backend shell always returns mock; AI Bridge replaces live HTTP branch |
| 2026-09-19 | Facade `lib/modules/run-module.ts` + 3 API routes | Thin sync API; no BullMQ enqueue in default path |
| 2026-09-19 | No Plugin Slot / no social publish | Out of scope → C-21 / HITL publisher |
| 2026-09-19 | Brand context read-only from `workers/_shared/brand-lock.md` | FeedbackLogs only; no secrets |
| 2026-09-19 | Fixer: Studio tiles import `@/modules/manifests` only | Avoid pulling adapter `brand-context` (`node:fs`) into Client bundle; registry stays server-side |
| 2026-09-19 | Fixer: no `import "server-only"` on registry/brand-context | Package throws under plain `tsx` smokes; client boundary enforced by import graph (manifests vs registry) + `_index` not re-exporting registry |
| 2026-09-19 | Fixer: `_index.ts` exports manifests + id-map only (no registry) | Barrel re-export of registry would reintroduce fs-in-client if Studio imported the barrel |
| 2026-09-19 | Fixer: skip `import "server-only"` on brand-context/registry | Package default entry throws under plain `tsx`; would break `smoke-c20-*.ts`; boundary enforced by import graph |

## AI Bridge handoff

1. Enhance `lib/ai/heygen-gateway.ts` `createAvatarVideo` when `HEYGEN_API_KEY` is set (live HTTP).
2. Do **not** log the key; keep `mock: true` path when key absent.
3. Optional: versioned prompts under `lib/ai/prompts/heygen-*.ts` and `workers/designer-heygen/`.
4. Adapter `src/modules/heygen-reels/index.ts` already calls the gateway — prefer not to fork client into Frontend.

## AI Bridge notes (2026-09-19)

| Decision | Rationale |
|----------|-----------|
| Live = `POST /v2/video/generate` + short `GET /v1/video_status.get` poll | Stable HeyGen path; v3 migration later |
| Sync poll budget default **12s** (`HEYGEN_POLL_MS`) | Avoid blocking Next `/studio`; pending → mock URL + `providerJobId` |
| Live failure → **mock + human `feedbackLogs`**, never throw | Localhost acceptance; GenerationDrawer can show reason |
| Key never logged; provider text sanitized | Secrets hygiene |
| Prompt packs: `heygen-script@v1`, `heygen-avatar@v1`, `module-drafts@v1` | Versioned; HITL for bumps; mock builders need no LLM |
| `heygen-reels` draft uses `buildHeyGenScriptMockLines` | Wire gateway + prompts without Plugin Slot |
| Optional env: `HEYGEN_TEST_MODE`, defaults avatar/voice | Safe live smoke without burning credits |

## Frontend notes (2026-09-19)

| Decision | Rationale |
|----------|-----------|
| Wire Generate (was client-only mock) → facade | Client smoke M1–M4 needs real draftId/assets |
| `POST …/generate` with `render: true` | One round-trip mock assets; matches drawer “Designer” step |
| Keep simulated agent steps (no SSE) | Sprint 7 owns live progress; UX unchanged |
| Empty topic → default «Быстрый черновик Studio» | Avoid 400 on smoke without typing |
| Store `lastDraftId` / `lastAssets` / `lastRenderMock` | Inspector/Client can read without Plugin Slot |
| No Plugin Slot UI | Out of scope → C-21 |
