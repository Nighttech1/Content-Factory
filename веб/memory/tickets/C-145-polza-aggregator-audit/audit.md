# Backend audit — C-145 (Polza / aggregator)

> **Backend / Аудитор** · 2026-10-10 · memory only · **no secrets**  
> Re-read of call sites against `architect-spec.md`. No product code changed.

## Verdict

**partial**

| Area | Status |
|------|--------|
| Analytics analyst LLM | **connected** — uses `lib/llm/aggregator` → OpenAI-compatible `/chat/completions` when key present |
| Studio content drafts (modules) | **not wired** — mock / vendor / stub |
| Razbor / agent chat UI | **not wired** — local `MOCK_ACK`, no aggregator import |
| Settings browser picker | Orthogonal (`lib/settings/llm-aggregator.ts` localStorage) — **not** server Polza client |
| Smoke / docs | Operator path exists; code default base URL is OpenAI if `AGGREGATOR_BASE_URL` unset |

Stable string for Orchestrator / Client wave note: **`partial`**.

---

## Paths that call `lib/llm/aggregator` / Polza (`AGGREGATOR_*`)

| Path | Role |
|------|------|
| `lib/llm/aggregator.ts` | Env reader: `AGGREGATOR_API_KEY`, `AGGREGATOR_BASE_URL`, `AGGREGATOR_DEFAULT_MODEL`, `AGGREGATOR_MODEL_MAP_*`; builds chat URL. Fallback key names: `OPENAI_API_KEY`, `ANALYST_LLM_API_KEY`. Default base if unset: `https://api.openai.com/v1` (**not** Polza). |
| `lib/analyst/llm.ts` | **Only runtime import** of `resolveAggregatorEnv` / `aggregatorChatCompletionsUrl` / `resolveAggregatorModelId`. Live `fetch` to chat completions when env resolves. |
| `lib/analyst/run-insights.ts` | Calls `callAnalystLlm` via `tryLlmInsights`; on missing key / failure → deterministic mock insights. |
| `lib/analytics/resolve-insights.ts` | Facade → `runAnalystInsights` (inherits aggregator path above). |
| `scripts/smoke-polza-connection.ts` | Connectivity smoke; reads `AGGREGATOR_*` (must not log key). Default base in script prefers Polza URL when env base empty — **differs** from library default. |
| `docs/ENV_AGGREGATOR.md` | Operator docs (placeholders only). |
| `.env.example` | Placeholders only (verified by smoke-c34). |

**No matches** under `src/` or `app/` for imports of `@/lib/llm/aggregator` / `resolveAggregatorEnv`.

---

## Content generation paths that still mock (or non-aggregator)

| Path | Notes |
|------|-------|
| `src/modules/carousel-engine/index.ts` | `generateDraft` / render → mock carousel assets (`mock: true`) |
| `src/modules/heygen-reels/index.ts` | HeyGen gateway or mock video — not aggregator chat |
| `src/modules/cartoon-reels/index.ts` | Mock poster/mp4 |
| `src/modules/aesthetic-graphics/index.ts` | Mock single asset / SVG |
| `src/modules/custom-remote/factory.ts` | Worker proxy; on failure → `mockDraft` / `mockAssets` |
| `src/modules/tg-articles`, `site-articles` | Stub modules (`createStubModule`, `meta.mock`) |
| `lib/modules/run-module.ts` | Facade → module `generateDraft` (inherits mocks) |
| `components/studio/workspace/RazborModal.tsx` | `MOCK_ACK` local replies — not aggregator |
| `components/studio/workspace/AgentChatComposer.tsx` | UI composer only — no aggregator import |
| `lib/jobs/mock-emitter.ts` | Job timeline mock — unrelated to Polza chat |

---

## Gaps (follow-up; out of C-145 unless Orchestrator opens wire tickets)

1. Razbor / agent chat server route → aggregator chat + Team model pick.  
2. Module `generateDraft` text stages (hooks/scripts) → aggregator instead of fixture text.  
3. Align library default / docs: Polza expected via `AGGREGATOR_BASE_URL`; code default remains OpenAI URL if unset.  
4. After C-144 Settings LLM UI trim — operator path = env only; `docs/ENV_AGGREGATOR.md` still mentions models in `/settings` (doc drift, not a wire fix).

---

## Backend notes for chain

- Architect evidence table **confirmed**; no additional live aggregator call sites found.  
- Verdict remains **partial** (cannot upgrade to **connected** until draft/Razbor use aggregator).  
- Tester: doc guard on this file + no key material in `memory/tickets/C-145-*`.  
- Deployer: optional local `scripts/smoke-polza-connection.ts` only — do not log keys; no code deploy required for C-145.

---

## Plain Russian summary (for Orchestrator → user)

Сейчас «умный» запрос к агрегатору вроде Polza реально включён только для аналитики: система может спрашивать нейросеть про insights, если в окружении задан ключ. Черновики контента в студии (карусели, ролики, картинки и т.п.) по-прежнему собираются из заглушек или отдельных сервисов вроде HeyGen — они не ходят в Polza. Чат агентов в Разборе тоже отвечает заранее заготовленным текстом, без живой модели. Поэтому итог аудита — «частично подключено»: канал к агрегатору есть, но фабрика целиком через Polza ещё не пишет. Чтобы всё шло через Polza end-to-end, нужны отдельные задачи на проводку чата и генерации черновиков.
