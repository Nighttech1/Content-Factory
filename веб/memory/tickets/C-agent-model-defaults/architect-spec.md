# Architect spec — C-agent-model-defaults (P0)

> **Архитектор** до кода. Wave: `W-2026-10-13-designer-models-colors-hook`.  
> Shared chain: `memory/waves/W-2026-10-13-designer-models-colors-hook/chain.md`.  
> Trainer: `memory/trainer/2026-10-13-designer-models-colors-hook-grade.md` + `llm-model-catalog-notes.md`.

## Goal

Закрепить продуктовые defaults моделей: **Designer** = `openai/gpt-5.4-image-2`; **Scriptwriter (carousel copywriter)** = Haiku 4.5 aggregator id + **thinking ON**. Каталог + mesh seed + pass-through в aggregator без поломки существующих чатов.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-md-1 Designer image** | `DEFAULT_CAROUSEL_IMAGE_MODEL` = `openai/gpt-5.4-image-2` in `types/mesh-agent.ts` **and** `lib/llm/aggregator-images.ts` (keep in sync). Label: «GPT-5.4 Image 2». |
| **D-md-2 Haiku id** | Prefer aggregator-style **`anthropic/claude-haiku-4.5`**. Label: «Claude Haiku 4.5». Alias `claude-haiku-4.5` OK in catalog if needed; seed uses full id. |
| **D-md-3 Catalog** | `LLM_MODEL_CATALOG` adds both entries; `LLM_AGENTS.designer.defaultModelId` → image id; `script-writer` → Haiku id. |
| **D-md-4 Mesh options** | `MESH_MODEL_OPTIONS` adds both; keep cheap Gemini entries as non-default options. |
| **D-md-5 Seed** | `seedAgentsForPipeline("carousel-engine")`: copywriter `modelConfig.model` = Haiku; `thinking: true` (or `reasoningEffort: "high"`); designer = `openai/gpt-5.4-image-2`. Other pipelines: copywriter may keep prior text defaults unless same pack — **carousel-engine HARD**. |
| **D-md-6 Thinking shape** | `MeshAgentModelConfig`: optional `thinking?: boolean` and/or `reasoningEffort?: "low"\|"medium"\|"high"`. Scriptwriter seed: `thinking: true`. |
| **D-md-7 Aggregator wire** | `callAggregatorChat`: best-effort — if `thinking===true`, send OpenRouter/Anthropic-style extras without breaking: try `reasoning: { effort }` **or** top-level `thinking: { type: "enabled" }` / `extra_body` merge. Prefer fields that Polza OpenAI-compat ignores harmlessly if unsupported. Never log secrets. |
| **D-md-8 Client path** | `meshModelConfigForRole` + `postStudioAgentChat` + route body pass `thinking` / `reasoningEffort` through. |
| **D-md-9 First load** | Store already merges saved over seed; new fields default from seed when missing. No forced wipe of user localStorage. |
| **D-md-10 Image classify** | `classifyAggregatorModelKind` / `IMAGE_MODEL_RE` must treat `gpt-5.4-image-2` as **image**. |

## In scope

| Path | Owner |
|------|--------|
| `lib/settings/llm-models.ts` | AI Bridge |
| `types/mesh-agent.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` | AI Bridge |
| `lib/llm/aggregator-chat.ts` | AI Bridge |
| `lib/llm/aggregator-images.ts` | AI Bridge (DEFAULT sync) |
| `app/api/studio/agent-chat/route.ts` | Backend |
| `lib/studio/agent-chat-client.ts` | Frontend / AI Bridge |
| `components/mesh/v2/AgentInspectorDrawer.tsx` | Frontend — optional thinking checkbox |

## Out of scope

- RazborModal rewrite
- VPS / prod
- Mass image generation smoke (>1 optional)
- New Prisma tables for model prefs

## Acceptance (Client language)

На Team → Scriptwriter Model: видна Haiku 4.5, thinking включён. Designer: GPT-5.4 Image 2. Create chat использует эти defaults с первого seed (пустой persist).
