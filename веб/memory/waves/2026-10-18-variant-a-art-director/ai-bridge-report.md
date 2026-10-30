# AI Bridge report — 2026-10-18 Variant A + Art Director

**Role:** AI Bridge · step 2  
**Spec:** `architect-spec.md` §5–7 · `chain.md` step 2  
**Status:** DONE (prompts + zod + AD seed; no composite CSS / no mesh JSX)

## Paths touched

| Path | Change |
|------|--------|
| `lib/studio/carousel-json-contract.ts` | `HtmlLayout` zod (template enum, text_block, primary/secondary highlights, logo/character/cta, scrim, brandChrome/characterSlot aliases); optional on dramaturgy slides; **required** on Designer pack; `ArtDirectorVerdict`; `critiqueHtmlLayout` / `assertDesignerPackHtmlLayouts` (orphan highlight + unknown template); parse helpers |
| `lib/studio/create-carousel-prompts.ts` | `LAYERED_HTML_DESIGNER_OVERLAY` Variant A — MUST emit `image_prompt` + `html_layout`; highlight ⊆ copy |
| `lib/studio/art-director-review.ts` | **NEW** — system prompt + checklist + user payload + parse; **NO remake** wording |
| `workers/art-director/SKILL.md` | **NEW** — worker stub for Backend job wire |
| `lib/mesh/agent-defaults.ts` | carousel-engine seed `art-director` + Designer Variant A skills/rules |
| `lib/settings/agent-pack-catalog.ts` | pack `art-director` → workers skill |

## Contracts (export for Backend)

- `htmlLayoutSchema` / `HTML_LAYOUT_TEMPLATES`
- `designerImagePromptsSchema` — `{ slides: [{ slide_number, image_prompt, html_layout }] }`
- `parseAndAssertDesignerPack(text, handoff)` — zod + orphan/template critic
- `artDirectorVerdictSchema` / `parseArtDirectorVerdictFromText`
- `ART_DIRECTOR_SYSTEM_PROMPT` / `buildArtDirectorReviewMessages` / `reviewArtDirectorFromLlmText`

## Critic

| Rule | Behavior |
|------|----------|
| Unknown `template` | zod enum FAIL + critic code `unknown_template` |
| Orphan highlight phrase | FAIL — must be substring of primary_copy / secondary_copy |
| Missing `html_layout` on Designer pack | FAIL |
| CTA placement vs role | FAIL (non-cta ≠ none; cta_slide with 1–4 needs bottom\|inline) |

## NOT done (other roles)

- Composite CSS map / Puppeteer execute → **Backend**
- Job step AD persist / no-remake wire → **Backend**
- Mesh flowchart node / inspector Ревью → **Frontend**
- Smoke ONE+AD artifact → Backend smoke step

## How to verify

1. Import `parseAndAssertDesignerPack` with pack missing `html_layout` or orphan phrase → throws SCHEMA.
2. `seedAgentsForPipeline("carousel-engine")` has `art-director` with `ART_DIRECTOR_SYSTEM_PROMPT` containing «Не запускай перерисовку».
3. Designer overlay string includes `html_layout` + closed template list.

`🤖 **AI BRIDGE:** Variant A html_layout zod + Designer overlay + Art Director prompts/defaults; Backend executes composite + AD job.`
