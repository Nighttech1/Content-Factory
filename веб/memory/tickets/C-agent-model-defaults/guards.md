# Guards — C-agent-model-defaults

Wave: `W-2026-10-13-designer-models-colors-hook` · Scenario: **S45.A** (models + thinking)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `DEFAULT_CAROUSEL_IMAGE_MODEL` = `openai/gpt-5.4-image-2` in `types/mesh-agent.ts` **and** `lib/llm/aggregator-images.ts`. |
| G2 | `LLM_AGENTS` designer `defaultModelId` = `openai/gpt-5.4-image-2`; catalog entry present in `lib/settings/llm-models.ts`. |
| G3 | `DEFAULT_SCRIPTWRITER_MODEL` = `anthropic/claude-haiku-4.5`; script-writer `defaultModelId` same. |
| G4 | Carousel-engine Scriptwriter seed `modelConfig.thinking: true` + `reasoningEffort: "high"` in `lib/mesh/agent-defaults.ts`. |
| G5 | `MESH_MODEL_OPTIONS` includes both new ids/labels. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts
# Expect: SMOKE_W_2026_10_13_DESIGNER_MODELS_COLORS_HOOK_OK
```

Live Client: **S45.A** — Settings / Team Model shows Designer GPT-5.4 Image 2; Scriptwriter Haiku 4.5 + thinking.

## Class of defect

Wrong Designer/Scriptwriter defaults; thinking off on carousel Scriptwriter; catalog/mesh out of sync with aggregator DEFAULT.
