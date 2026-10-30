# Guards — C-audit-01 models / routing

Wave: `2026-10-16-carousel-audit-fix` · Spec: `architect-spec.md`

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `DEFAULT_SCRIPTWRITER_MODEL` = `anthropic/claude-3.7-sonnet` (**≠** Haiku). Carousel seed: `thinking: true`, `reasoningEffort: "high"`. |
| G2 | `DEFAULT_DESIGNER_TEXT_MODEL` = `anthropic/claude-3.7-sonnet`. Designer seed: `model` = image-2, `textModel` = Sonnet. |
| G3 | `DEFAULT_CAROUSEL_IMAGE_MODEL` = `openai/gpt-5.4-image-2` (`types/mesh-agent` + `aggregator-images`). |
| G4 | **Routing:** mode ∈ `{chat,handoff,describe}` + image-class preferred → substitute `textModel` / seed / `DEFAULT_DESIGNER_TEXT_MODEL`. **Never** chat on image-2; **never** fall to `gpt-4o-mini` for Designer describe. |
| G5 | mode `draw` keeps image-2 (no text substitute). |
| G6 | `RAZBOR_ANALYST_MODEL` stays `anthropic/claude-haiku-4.5` (uncoupled from Scriptwriter). |

## Commands

```bash
npx tsx scripts/smoke-c-audit-01-routing.ts
# Expect: SMOKE_C_AUDIT_01_ROUTING_OK

npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts
# Expect: SMOKE_W_2026_10_13_DESIGNER_MODELS_COLORS_HOOK_OK
```

## Class of defect

Wrong Create model defaults; describe/chat sending image-class id to `/chat/completions`; silent mini fallback; Razbor accidentally upgraded with Scriptwriter.

## Out of scope this guard

LIVE 6-PNG gen (`validation_budget_png=6`) → Deployer / Client S41+.
