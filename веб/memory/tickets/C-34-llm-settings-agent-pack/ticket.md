# C-34 — Settings LLM + aggregator env + agent instruction pack

| Field | Value |
|-------|-------|
| **ID** | `C-34` |
| **Priority** | P0 |
| **Wave** | W-2026-09-20-agents-brand-settings |
| **Status** | specced |

## Expected

1. New sidebar **Настройки** `/settings` with block: which LLM model per agent (Analyst, Scriptwriter, Designer, Researcher, Hook Writer, Renderer, Publisher, …).
2. `.env.example` (+ document): `AGGREGATOR_API_KEY=` and optional `AGGREGATOR_BASE_URL=` — all agents use this aggregator; never commit real key.
3. Folder e.g. `agents/` (or `docs/agents/`) with one file per agent: base prompt, skills list, plugins, MCP servers they use.

## Notes

Зона: Frontend settings UI + lib config store (localStorage or file) + Backend env wiring stub; docs folder. Persist models locally OK for wave.
