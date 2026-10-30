# Guards — C-11

| Guard type | What | Where |
|------------|------|-------|
| test | ViralityMeter + HookAlternatives + ScriptEditor + HeyGenPersonaSwitcher exist | `scripts/sprint4-guards.mjs` |
| test | HookAlternatives calls `selectHook` (Client S2: hook swap must change UI) | `scripts/sprint4-guards.mjs` |
| test | ViralityMeter reads score/hooks; ScriptEditor + Persona bind store | `scripts/sprint4-guards.mjs` |
| test | Hook ACTIVE vs inactive/SWAP visual contract present | `scripts/sprint4-guards.mjs` |

## Mirror in Client skill

| C-11 | hook swap does not wire selectHook / panel missing | sprint4-guards | `scripts/sprint4-guards.mjs` |
