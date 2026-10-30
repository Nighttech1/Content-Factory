# Guards — C-34

| Result | **GREEN** 2026-09-20 |
|--------|----------------------|
| Smoke | `SMOKE_C34_PASS` |
| Live | `/settings` 200 |

## Checks
- `.env.example` has `AGGREGATOR_API_KEY` + `AGGREGATOR_BASE_URL` (empty placeholders)
- `agents/*.md` pack present (8 agents + README)
- Settings LLM panel testids; localStorage `cf-llm-agent-models`
- No real API keys in repo
