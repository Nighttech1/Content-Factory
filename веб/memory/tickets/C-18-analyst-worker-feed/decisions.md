# Decisions — C-18

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chain order | **AI Bridge → Backend → Frontend** | Prompt/run contract before API; FE last with fallback. |
| LLM absent | **Deterministic insights from aggregates** | Localhost without keys still demos Analyst. |
| API fail / empty | **Keep C-13 mock in Zustand** | Hard REJECT avoided; Screen 4 never blank. |
| Persist insights | **JSON cache file / memory TTL** | Avoid new Prisma model in this wave. |
| Prompt mutation | **promptHints advisory only** | workers/analyst SKILL + HITL; no silent prod overwrite. |
| KPI/retention live | **Optional same snapshot API** | Insights are P0; KPI wire nice-to-have. |
| Types | **Reuse `AnalystInsight` from analytics-mock** | Single FE contract; extract shared types file if Backend imports. |

## Env

| Var | Role |
|-----|------|
| LLM key (project standard, e.g. `OPENAI_API_KEY`) | real analyst |
| absent | mock insights from PostAnalytics aggregates |

## Safety reminder

No wipe; no auto prompt apply; secrets only `.env`.
