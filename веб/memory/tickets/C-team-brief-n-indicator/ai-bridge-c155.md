# AI Bridge — C-155 audit (C-team-brief-n-indicator prompt part)

## Verdict

Create / agent-chat **does not** glue Team «Задание» / combat brief into `user`.

## Changes

| File | Change |
|------|--------|
| `lib/mesh/agent-store.ts` | `composeTopicWithBrief` → returns `topic.trim()` only (deprecated) |
| `lib/studio/agent-chat-sanitize.ts` | **new** — `stripCombatBriefGlue` / `sanitizeAgentChatTurnsForC155` |
| `lib/studio/agent-chat-client.ts` | sanitize messages before POST |
| `app/api/studio/agent-chat/route.ts` | sanitize turns + userMessage |

## Not AI Bridge

- Empty «Задание» UI default / `loadUserBrief` → Frontend 4b
- `next.config` `devIndicators: false` → Frontend 4b / Deployer
