# C-team-brief-gone-design-brandbook — Architect spec

**Priority:** P0 · Wave S49

## Goal

(1) Delete Team User basic brief UI and any glue that injects `loadUserBrief` / `defaultCombatBrief` into Create chat or agent user turns.  
(2) Settings Design: Heritage-style **brandbook visual board** from `DesignPresetFile`; upload image → deconstruct → brandbook; active tokens → Designer.

## Locks

| ID | Lock |
|----|------|
| D-brief-gone | No textarea on User node; store `userBrief` stays `""`; never sync into chat payloads; sanitize hardened |
| D-brandbook-s49 | Primary Embla slot UI = brandbook board (colors+scales, Aa, buttons, bars, icons on beige); deconstruct fills preset → board |

## Paths

### Brief delete
- `components/mesh/v2/ReleaseTeamFlowchart.tsx`
- `lib/mesh/agent-store.ts` (`loadUserBrief` always `""` for inject paths; stop `syncUserAgentBrief` from combat seed)
- `lib/mesh/agent-defaults.ts` (`defaultCombatBrief` deprecated stub OK)
- `lib/studio/agent-chat-sanitize.ts` + `app/api/studio/agent-chat/route.ts` (AI Bridge)

### Brandbook
- `components/settings/BrandbookBoard.tsx` (**new**)
- `components/settings/DesignLibraryCarousel.tsx`
- `app/api/settings/design-deconstruct/route.ts` (presetFile for board)
- `lib/settings/design-preset.ts` / `types/design.ts` (consume existing tokens)

## Acceptance (Client S49.C–D)

1. Team User node: no brief field; Create chat user turns = raw only.
2. Settings Design slot shows brandbook board (not sliced-only / not MD textarea).
3. Upload image → deconstruct → brandbook updates; active slot still drives Designer.
