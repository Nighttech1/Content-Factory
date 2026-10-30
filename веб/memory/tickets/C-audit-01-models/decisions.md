# Decisions — C-audit-01 models

| ID | Decision | Notes |
|----|----------|-------|
| D-m-1 | Image draw = `openai/gpt-5.4-image-2` | Sync verified in `aggregator-images.ts` (unchanged) |
| D-m-2 | Scriptwriter = `anthropic/claude-3.7-sonnet` + thinking/high | Label «Claude 3.7 Sonnet» in MESH + LLM catalog |
| D-m-3 | `DEFAULT_DESIGNER_TEXT_MODEL` = Sonnet; `modelConfig.textModel` | Draw keeps image id on `model` |
| D-m-4 | Route: non-draw + image-class → textModel chain | Never chat on image id; never Designer describe → mini |
| D-m-5 | `IMAGE_MODEL_RE` still matches `gpt-5.4-image-2` | No change needed |
| D-m-6 | Catalog + script-writer default → Sonnet | Designer catalog default stays image-2; no chrome redesign |
| D-m-7 | Polza slug | Used `anthropic/claude-3.7-sonnet` as specified. **Fallback if live 404/503:** see **C-audit-06** `SCRIPTWRITER_MODEL_FALLBACK_CHAIN` → `anthropic/claude-sonnet-4` → haiku last resort (never silent Haiku-first). |
| D-m-8 | Razbor stays Haiku | `RAZBOR_ANALYST_MODEL` hardcoded; uncoupled from `DEFAULT_SCRIPTWRITER_MODEL` |

## Smoke updates

- S45 carousel defaults smoke → expects Sonnet for Scriptwriter.  
- Razbor smokes → assert Haiku on Razbor, Sonnet on Scriptwriter.
