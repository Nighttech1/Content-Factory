# Fixer — C-team-brief-n-indicator

**Date:** 2026-10-13  
**Role:** Фиксер

## P2 — seedAgentsForPipeline userRequest

**Report:** `lib/mesh/agent-defaults.ts` ~L377 still seeded `userRequest: defaultCombatBrief(pipelineId)`.

**Fix:** `userRequest: ""` so Team «Задание» / user agent seed stays empty (D-tb-2 / C-team-brief-n-indicator).

`defaultCombatBrief` kept exported — still used by `agent-store` migrate + smoke hydrate tests.

## Verify

- Smoke: `npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts` → OK
- `tsc`: no errors on `agent-defaults.ts`
