# AI Bridge report — C-s57-ai-bridge-layered

**Wave:** `memory/waves/2026-10-17-layered-html-pipeline/`  
**Date:** 2026-10-17  
**Role:** AI Bridge  
**Ticket:** C-s57-ai-bridge-layered  

## Done

Product overlays + zod aligned to **S57 `layered_html`** (bg image + HTML typography/logo/CTA). Vision OFF in docs/overlays. Backend owns Puppeteer composite next.

## Files changed

| File | Change |
|------|--------|
| `lib/studio/carousel-json-contract.ts` | `secondary_copy` **required**; optional `renderMode`; schema hint S57; `assertCarouselSecondaryCopy`; STRICT defaults require secondary |
| `lib/studio/create-carousel-prompts.ts` | Default pipeline **`layered_html`**; `isCarouselLayeredHtmlPipeline` / `resolveCarouselRenderMode`; auto-7 `suggestAutoSlideCountForTopic`; bg helpers `appendBackgroundOnlyGuard` / `sanitizeBackgroundImagePrompt` / `assertBackgroundOnlyPrompt` / `buildLayeredBackgroundImagePrompt`; Scriptwriter + Layered Visual Engine overlays; `buildCorrectImagePromptFromSlide` → bg-only by default |
| `lib/studio/carousel-critic-05.ts` | Require secondary; primary ≤8 words; visual_prompt text-leak warning; retry hint S57 |
| `lib/mesh/agent-defaults.ts` | `carousel-engine` copywriter/designer keys → layered_html |
| `docs/карусель тест/correct/02_scriptwriter_prompt.md.txt` | S57 Scriptwriter notes |
| `docs/карусель тест/correct/03_designer_prompt.md.txt` | Designer = bg prompt only; HTML owns type/logo/CTA |
| `docs/карусель тест/correct/04_text_check_prompt.md.txt` | Vision **OFF** on layered_html |
| `workers/script-writer/SKILL.md` | Phase 7 section |
| `workers/designer-carousel/SKILL.md` | Phase 7 Layered Visual Engine |
| `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` | Backend sketch → layered_html |

## Contract summary

1. **Default gate:** missing/`layered_html`/`default` → layered ON; explicit `correct` / `e2e_diffusion` = archaeology.  
2. **Scriptwriter:** secondary_copy required; primary ≤8; swipe meta; CTA 1–4; auto-7 for N-ways; visual_prompt scene-only.  
3. **Designer:** image = bg only + HARD ban; HTML owns type / Brand logo / CTA button / cut-outs; vision OFF.  
4. **Exports for Backend:** `appendBackgroundOnlyGuard`, `sanitizeBackgroundImagePrompt`, `assertBackgroundOnlyPrompt`, `buildLayeredBackgroundImagePrompt`, `suggestAutoSlideCountForTopic`, `isCarouselLayeredHtmlPipeline`, `resolveCarouselRenderMode`.

## Not touched (path lock)

- `carousel-html-renderer.ts` Puppeteer impl  
- Settings UI / AppShell  
- Smoke folder delete  

## Next

**Backend** — step 3: primary layered composite, vision off wire, FORCE bg ban, fonts, DELETE old smoke, ONE 4-slide deliverable.
