# Tester report — C-team-brief-n-indicator

**Role:** Тестировщик  
**Wave:** `W-2026-10-13-drafts-design-team`  
**Date:** 2026-10-13  
**Verdict:** **PASS** (static + unit/contract) with **P2 note** for Fixer. Live **S43.5–7** → Client / Deployer.

## What ran

```bash
npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
# → SMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK
```

## Covered

| Guard | Result |
|-------|--------|
| G1 label «Задание» | PASS (ReleaseTeamFlowchart) |
| G2 empty / migrate combat seed | PASS (`loadUserBrief` unit) |
| G3 composeTopicWithBrief no glue | PASS (unit) |
| G4 sanitize agent-chat | PASS (sanitize + route static) |
| G5 `devIndicators: false` | PASS (`next.config.ts`) |
| G6 reset → empty | PASS (static) |

## Artifacts

- `memory/tickets/C-team-brief-n-indicator/guards.md`
- Shared smoke script (above)

## Fixer backlog (P2, non-blocking smoke)

1. **`lib/mesh/agent-defaults.ts` ~L377** — `seedAgentsForPipeline` still sets `userRequest: defaultCombatBrief(pipelineId)`. UI textarea uses `userBrief` (empty OK after `setPipeline` + `syncUserAgentBrief`), but seed still carries combat body on the user agent record. Prefer `userRequest: ""` to match D-tb-2 and avoid any consumer reading `agents.user.userRequest` before sync.
