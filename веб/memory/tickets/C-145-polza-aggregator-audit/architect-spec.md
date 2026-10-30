# Architect spec — C-145 (Polza aggregator audit)

> **Архитектор** + Backend confirm. **Memory only — no product code for this ticket.**  
> Never paste API keys / `.env` secrets into memory.

## Goal

Зафиксировать, какие пути генерации контента реально ходят в `lib/llm/aggregator` (Polza / OpenAI-compatible), а какие остаются mock / другим клиентом.

## Env / docs (no secrets)

| Artifact | Role |
|----------|------|
| `lib/llm/aggregator.ts` | Env reader: `AGGREGATOR_API_KEY`, `AGGREGATOR_BASE_URL`, model maps; builds `/chat/completions` URL |
| `docs/ENV_AGGREGATOR.md` | Operator docs |
| `scripts/smoke-polza-connection.ts` | Connectivity smoke to Polza-compatible base |
| `.env.example` | Placeholders only (must stay empty of real keys) |

Default in code if base URL missing: `https://api.openai.com/v1` (not Polza) — Polza expected via `AGGREGATOR_BASE_URL` in env.

## Call-site evidence (read-only, 2026-10-10)

### Uses `lib/llm/aggregator` / Polza-compatible chat

| Path | Notes |
|------|-------|
| `lib/analyst/llm.ts` | Imports `resolveAggregatorEnv`, `aggregatorChatCompletionsUrl`; live chat when key present |
| `lib/analyst/run-insights.ts` | Calls `callAnalystLlm` — **Analytics insights**, not studio draft modules |

### Content generation — mock / non-aggregator

| Path | Notes |
|------|-------|
| `src/modules/carousel-engine/index.ts` | `generateDraft` → mock carousel assets |
| `src/modules/heygen-reels/index.ts` | HeyGen / mock video path — not aggregator chat |
| `src/modules/cartoon-reels/index.ts` | Mock poster/mp4 |
| `src/modules/aesthetic-graphics/index.ts` | Mock single asset |
| `src/modules/custom-remote/factory.ts` | Worker proxy; falls back `mockDraft` |
| `lib/modules/run-module.ts` | Facade → module `generateDraft` (inherits mocks above) |
| `components/studio/workspace/RazborModal.tsx` | `MOCK_ACK` local replies — not `lib/llm/aggregator` |
| `components/studio/workspace/AgentChatComposer.tsx` | UI composer; no aggregator import |

### Settings UI (orthogonal; removed by C-144)

| Path | Notes |
|------|-------|
| `lib/settings/llm-aggregator.ts` | Browser localStorage model picker — **not** server Polza client |
| `components/settings/SettingsShell.tsx` | LLM UI block — trimmed in **C-144** |

## Verdict

**partial**

- **Connected:** Analytics analyst LLM path (`lib/analyst/llm.ts` → aggregator env → `/chat/completions`). Smoke script can validate Polza when env set.
- **Not wired for product content drafts:** carousel / reels / graphics / remote worker / Razbor chat still mock or vendor-specific — **do not** claim «фабрика пишет через Polza» end-to-end.
- **Gap (follow-up, out of this ticket unless Orchestrator opens wire work):**
  1. Razbor / agent chat server route → aggregator chat completions + Team model pick.
  2. `generateDraft` text stages (hooks/scripts) → aggregator instead of fixture text.
  3. Ensure `AGGREGATOR_BASE_URL` default docs prefer Polza; code default still OpenAI URL if unset.
  4. After C-144, no Settings UI for keys — document operator path = env only.

## Acceptance (закрытие C-145)

1. This file + Backend note in chain checkbox = audit complete.
2. Verdict string stable: **partial**.
3. No secrets in memory.
4. No requirement to ship wire code under C-145.

## Out of scope

- Implementing wire gaps
- Settings Design preview (C-143)
- Mesh UI (C-140/C-141)

## Mid-flight escalation

If Backend finds additional live call sites → update this evidence table + keep verdict accurate (may become **connected** only if draft/Razbor paths also use aggregator).
