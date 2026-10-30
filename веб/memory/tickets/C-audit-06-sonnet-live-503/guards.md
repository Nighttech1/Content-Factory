# Guards — C-audit-06 Sonnet 503 fallback

| ID | Assert |
|----|--------|
| G1 | `SCRIPTWRITER_MODEL_FALLBACK_CHAIN` starts with `anthropic/claude-3.7-sonnet`, includes `anthropic/claude-sonnet-4`, ends with haiku |
| G2 | `isRetryableAggregatorChatError("aggregator_http_503")` === true |
| G3 | `callAggregatorChat` accepts `fallbackModels: true` |
| G4 | agent-chat Scriptwriter create path passes `fallbackModels: true` |
| G5 | Catalog contains `anthropic/claude-sonnet-4` |
| G6 | decisions.md documents D-f-1…D-f-7 (no silent Haiku-first) |

Smoke: `npx tsx scripts/smoke-c-audit-04-05-06.ts`
