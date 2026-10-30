# Chain — C-154 (carousel live images)

> Path lock: Backend (+ light Frontend wire). No commit.

**One-liner:** Backend image helper + APIs → Frontend Razbor + mesh model picker → smoke

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/llm/aggregator-images.ts` | [x] | POST gens + poll `/media` |
| 2 | Backend | `app/api/aggregator/models/route.ts` | [x] | soft-fail empty |
| 3 | Backend | `app/api/studio/carousel-engine/generate-slides/route.ts` | [x] | live\|mock |
| 4 | Frontend wire | `RazborModal.tsx` (+ mesh model) | [x] | call generate-slides then upsertDraft |
| 5 | Frontend wire | `types/mesh-agent.ts` + `AgentInspectorDrawer.tsx` + `agent-defaults.ts` | [x] | fetch models + cheap image defaults |
| 6 | Ops | `.env.example` + `scripts/smoke-c154-carousel-images.ts` | [x] | |
| 7 | Tester | smoke exit 0 live or mock | [x] | `SMOKE_C154_OK` live url (Backend smoke 2026-10-11) |
| 8 | Client | Playwright Razbor Designer slides | [ ] | after Deployer localhost |
