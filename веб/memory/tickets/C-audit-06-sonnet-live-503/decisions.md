# Decisions — C-audit-06 Sonnet live 503 fallback

| ID | Decision | Notes |
|----|----------|-------|
| D-f-1 | Primary Scriptwriter stays `anthropic/claude-3.7-sonnet` + thinking/high | Unchanged from C-audit-01 |
| D-f-2 | On retryable aggregator errors (400/404/408/429/5xx/529/network/empty/bad_json) try next model | 400 often = model rejects thinking payload — continue chain. Implemented in `callAggregatorChat({ fallbackModels })` |
| D-f-3 | Fallback #1 = `anthropic/claude-sonnet-4` (alias `claude-sonnet-4`) | Prefer Sonnet-class; never jump straight to Haiku |
| D-f-4 | Last resort = `anthropic/claude-haiku-4.5` **only after** Sonnet chain fails | Thinking disabled on haiku attempt |
| D-f-5 | Success response may include `fallbackFrom` + `triedModels` | UI/logs show degrade — not silent wrong path |
| D-f-6 | Fixture JSON in wave scripts is **render-only** safety net after chain exhausts | Never claim «LIVE Sonnet» when source=`fixture_fallback` |
| D-f-7 | Create / custom-reels / carousel-engine Scriptwriter routes pass `fallbackModels: true` | `app/api/studio/agent-chat/route.ts` |

## Chain (canonical)

```
anthropic/claude-3.7-sonnet
  → anthropic/claude-sonnet-4
  → claude-sonnet-4
  → anthropic/claude-haiku-4.5   (last resort)
```

Constants: `SCRIPTWRITER_MODEL_FALLBACK_CHAIN` in `types/mesh-agent.ts`.
