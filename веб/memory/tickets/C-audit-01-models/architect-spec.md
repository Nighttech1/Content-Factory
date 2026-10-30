# Architect spec — C-audit-01 models (P0)

> Wave: `memory/waves/2026-10-16-carousel-audit-fix/`  
> Chain: `memory/waves/2026-10-16-carousel-audit-fix/chain.md`  
> Trainer: `memory/trainer/2026-10-16-carousel-audit-fix-grade.md`  
> Supersedes product default from **C-agent-model-defaults** for Scriptwriter (Haiku → Sonnet). Image-2 Designer draw default **retained**.

## Goal

Make Create carousel LLM calls use the correct aggregator surface: **Sonnet for all text**, **gpt-5.4-image-2 only for pixels**, and **never** route Designer describe through an image model id (empty/wrong → `gpt-4o-mini`).

## Decision locks

| ID | Decision |
|----|----------|
| **D-m-1** | `DEFAULT_CAROUSEL_IMAGE_MODEL` = `openai/gpt-5.4-image-2` in `types/mesh-agent.ts` **and** `lib/llm/aggregator-images.ts` (keep sync). Draw / `runCreateCarouselDraw` / `CAROUSEL_IMAGE_MODEL` stay image-class. |
| **D-m-2** | `DEFAULT_SCRIPTWRITER_MODEL` = **`anthropic/claude-3.7-sonnet`**. Seed carousel copywriter: `thinking: true`, `reasoningEffort: "high"`. Label: «Claude 3.7 Sonnet». |
| **D-m-3** | Add **`DEFAULT_DESIGNER_TEXT_MODEL`** = **`anthropic/claude-3.7-sonnet`**. Mesh Designer may keep `modelConfig.model` = image-2 for draw UX; add `modelConfig.textModel` (or equivalent) for chat modes. |
| **D-m-4** | **Route HARD** (`agent-chat/route.ts`): for `mode ∈ {chat,handoff,describe}` if resolved mesh/client model is **image-class** → use `textModel` / `DEFAULT_DESIGNER_TEXT_MODEL`. **Forbidden:** calling chat/completions with image id; **Forbidden:** Designer describe falling through to `DEFAULT_AGGREGATOR_MODEL` (`gpt-4o-mini`). |
| **D-m-5** | `classifyAggregatorModelKind` / `IMAGE_MODEL_RE` treat `gpt-5.4-image-2` as image (verify still true). |
| **D-m-6** | Catalog `LLM_MODEL_CATALOG` + `LLM_AGENTS.script-writer.defaultModelId` → Sonnet id; Designer default stays image-2; document textModel in Team/Model UI if field exists — **no chrome redesign** (shell_freeze). |
| **D-m-7** | Polza slug verify: if `anthropic/claude-3.7-sonnet` 404, record fallback `anthropic/claude-sonnet-4` in `decisions.md` — do not silently keep Haiku. |
| **D-m-8** | Razbor / Marketing / other pipelines: **do not** change defaults this ticket. |

## In scope

| Path | Owner |
|------|--------|
| `types/mesh-agent.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` (carousel-engine modelConfig only) | AI Bridge |
| `lib/settings/llm-models.ts` | AI Bridge |
| `lib/llm/aggregator-images.ts` | AI Bridge (DEFAULT sync) |
| `lib/llm/aggregator-chat.ts` | AI Bridge (thinking extras if needed) |
| `lib/llm/*` classify helper (optional extract) | AI Bridge |
| `app/api/studio/agent-chat/route.ts` | Backend |

## Out of scope

- Prompt text / COMBAT / few-shots → **C-audit-02**  
- HTML renderer Phase3 → **C-audit-03**  
- Frontend shell / Create chrome  
- Soft-mock  
- VPS / social publish  

## Invariants

1. Create Scriptwriter → Designer → Draft handoffs **unchanged**.  
2. `shell_freeze: true`.  
3. Image API calls continue to use image-2; chat never receives image id for describe.

## Acceptance (Client language)

1. Team / seed: Scriptwriter shows Claude 3.7 Sonnet (or documented Polza alias), thinking on.  
2. Create → Scriptwriter message: network/model id is Sonnet, not Haiku, not mini.  
3. Create → Designer describe: chat model is Sonnet text — **not** `openai/gpt-5.4-image-2`, **not** `gpt-4o-mini`.  
4. Create → Нарисовать: image generations still `openai/gpt-5.4-image-2` (until C-audit-03 makes diffusion optional).  

## Guards (Tester)

- Assert seed + route: describe with Designer mesh image id → chat uses textModel Sonnet.  
- Assert draw path model = image-2.  
- Assert Scriptwriter default ≠ `anthropic/claude-haiku-4.5`.  

## Dependencies

None (first ticket). Unblocks C-audit-02/03 quality claims.
