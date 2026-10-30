# Decisions — C-34

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | `N/A` (no git HEAD at spec) | Spec 2026-09-20 |
| **after_sha** | | После закрытия |

## Product / tech decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route | `/settings` + sidebar «Настройки» | Ticket |
| Model persistence | `localStorage` key `cf-llm-agent-models` via `lib/settings/llm-models.ts` | Ship note (supersedes early `cf.llm-models.v1`) |
| Aggregator env | `AGGREGATOR_API_KEY=` + `AGGREGATOR_BASE_URL=https://api.openai.com/v1` in `.env.example`; helper `lib/llm/aggregator.ts` | Ticket; Analyst prefers AGGREGATOR → OPENAI |
| Real keys | Forbidden in git/memory | Safety |
| Instruction pack root | `agents/` (repo root) | Ticket preference |
| Agent files | One `.md` per pipeline agent | Ticket |
| Live aggregator calls | Out of scope | Stub env read only |
| Chain order | Backend → AI Bridge → Frontend | Env + packs before UI |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec+chain+decisions | status → specced |
| 2026-09-20 | Backend | `.env.example` + `lib/llm/aggregator.ts` + analyst fallback | Done |
| 2026-09-20 | AI Bridge | `agents/*.md` instruction pack | Done |
| 2026-09-20 | Frontend | `/settings` + sidebar + `llm-models.ts` | Done; status → implemented |

## Rollback plan

1. Remove `/settings` route + sidebar item; remove `lib/settings/*`; revert `.env.example` aggregator lines; keep or delete `agents/` as needed.
2. `status.md` → `rolled_back`.
3. Keep ticket folder.
4. Localhost sync.
