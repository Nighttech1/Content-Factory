# Agent pack — Content Factory pipeline

Instruction packs for product micro-agents (not Cursor team roles).
Each file: Role, Base prompt, Skills, Plugins, MCP servers, Default LLM model slot.

| Agent | File | Default model slot |
|-------|------|--------------------|
| Researcher | [researcher.md](./researcher.md) | `gpt-4o-mini` |
| Hook Writer | [hook-writer.md](./hook-writer.md) | `gpt-4o` |
| Script Writer | [script-writer.md](./script-writer.md) | `gpt-4o` |
| Analyst | [analyst.md](./analyst.md) | `gpt-4o-mini` |
| Designer | [designer.md](./designer.md) | `claude-sonnet` |
| Renderer | [renderer.md](./renderer.md) | `gpt-4o-mini` |
| Publisher | [publisher.md](./publisher.md) | `gpt-4o-mini` |
| Router (optional) | [router.md](./router.md) | `gemini-flash` |

## Runtime note

All live LLM calls should prefer `AGGREGATOR_API_KEY` / `AGGREGATOR_BASE_URL`
(see `.env.example` and `lib/llm/aggregator.ts`). Fallback: `OPENAI_API_KEY`.
Model picks in Settings (`/settings`) are stored client-side in `localStorage`
key `cf-llm-agent-models` and map to the slot ids above.

Never commit real API keys.
