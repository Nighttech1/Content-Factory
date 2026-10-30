# Guards — C-155 live agent chat

## G1 — API contract D1

- Body: `agentRole`, `pipelineId`, `messages[]` (raw user text, **no** `Бриф:` glue)
- Response 200: `{ reply, model, source: "live"|"mock" }`
- Soft-fail when no key / LLM error — never blank crash

Smoke: `npx tsx scripts/smoke-c155-agent-chat-route.ts` → `SMOKE_C155_ROUTE_OK`

## G2 — No combat-brief glue on agent chat

- `AgentChatComposer` / CreateCarousel / Razbor send **raw** composer text
- `composeTopicWithBrief` must **not** be called on agent-chat paths
- Mesh User brief stays on Team card only

## G3 — PromptBox + Thinking

- Composer uses `chatgpt-prompt-input` (`data-testid=agent-chat-prompt-box`)
- While fetch in flight: `thinking-indicator` visible

## G4 — Drafts persist + Create upsert

- Store key `cf.carousel.drafts.v1`
- CreateCarousel `upsertDraft` after designer slides

## G5 — Secrets

- Never log / return `AGGREGATOR_API_KEY`
