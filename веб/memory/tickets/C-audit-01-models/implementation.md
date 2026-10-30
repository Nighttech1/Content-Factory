# Implementation — C-audit-01 models

**Role:** AI Bridge (+ Backend route patch)  
**Wave:** `2026-10-16-carousel-audit-fix`  
**Status:** implemented (await Tester guards)

## What changed

| File | Change |
|------|--------|
| `types/mesh-agent.ts` | `DEFAULT_SCRIPTWRITER_MODEL` → `anthropic/claude-3.7-sonnet`; added `DEFAULT_DESIGNER_TEXT_MODEL` (same Sonnet); `MeshAgentModelConfig.textModel?`; MESH option «Claude 3.7 Sonnet» |
| `lib/mesh/agent-defaults.ts` | Carousel copywriter seed uses Sonnet + thinking/high; Designer seed keeps image-2 on `model`, sets `textModel` = Sonnet |
| `lib/settings/llm-models.ts` | Catalog + `script-writer.defaultModelId` → Sonnet; Designer default stays image-2 |
| `lib/studio/razbor-live-shared.ts` | **HARDCODE** `RAZBOR_ANALYST_MODEL = anthropic/claude-haiku-4.5` (D-m-8 — not coupled to Scriptwriter) |
| `app/api/studio/agent-chat/route.ts` | For `mode !== draw`, if preferred model is image-class → `textModel` / seed textModel / `DEFAULT_DESIGNER_TEXT_MODEL` |
| `lib/llm/aggregator-images.ts` | Verified sync still `openai/gpt-5.4-image-2` (no edit) |
| `scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts` | S45 expectations → Sonnet + textModel routing |
| `scripts/smoke-w-2026-10-14-razbor-live-boards.ts` | Razbor Haiku ≠ Scriptwriter Sonnet |
| `scripts/smoke-razbor-live-analyze.ts` | Same split assert |

## Verify

1. Seed carousel: Scriptwriter model = Sonnet, thinking on; Designer model = image-2, textModel = Sonnet.  
2. Create Scriptwriter chat → aggregator model id is Sonnet (not Haiku / mini).  
3. Create Designer describe → chat model is Sonnet text (not image-2, not mini).  
4. Create «Нарисовать» → still image-2 path (`CAROUSEL_IMAGE_MODEL` / HTML renderer).  
5. Razbor analyze still Haiku.

## Out of scope

C-audit-02 prompts · C-audit-03 HTML renderer · UI chrome (`shell_freeze`).
