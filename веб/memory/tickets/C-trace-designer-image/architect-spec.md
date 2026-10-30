# Architect spec — C-trace-designer-image (P0)

> Wave `2026-10-16-carousel-prompt-trace` · after **C-trace-scriptwriter-viral**  
> Skill: `carousel-prompt-trace` § Designer session

## Goal

For each of the two Scriptwriter handoffs: run Designer draw (`runCreateCarouselDraw`), dump **EXACT** image-LLM prompts per slide + HTML post-process into Step2 MD, and produce **exactly 6 PNG** (2×3) overwriting stable draft ids — so Client sees where Image quality dies.

## Decision locks

| ID | Lock |
|----|------|
| **D-de-1** | Extend `scripts/trace-carousel-session.ts` (sequential after ticket 1): after final JSON → `runCreateCarouselDraw`. |
| **D-de-2** | Capture **EXACT** per-slide prompt sent to image API (post-`sanitizeLiveGenVisualPrompt` / no-text suffix). If bg skipped: `image_llm: skipped` + HTML template inputs. |
| **D-de-3** | Optional minimal upgrade: when `CAROUSEL_PROMPT_TRACE=1`, `runCreateCarouselDraw` returns/logs `{ slides: [{ exact_prompt, skipped }] }` — Backend helps only if AI Bridge cannot capture parity without it. |
| **D-de-4** | Write `docs/карусель тест/02-designer-<slug>.md` from `_templates/02-designer-session.md` — all sections. |
| **D-de-5** | Budget **≤6 PNG**; artifact root `generatedMedia/wave-carousel-prompt-trace/`; overspend → stop-report. |
| **D-de-6** | Draft overwrite only: `draft-trace-a`, `draft-trace-b` — **no** spam Черновики. |
| **D-de-7** | `swipe_trigger` **never** painted; paint only primary/secondary (+ CTA). Safe-zone documented. |
| **D-de-8** | Image model: `openai/gpt-5.4-image-2` (`DEFAULT_CAROUSEL_IMAGE_MODEL`) when bg warranted; HTML/CSS-first primary path unchanged. |
| **D-de-9** | `shell_freeze` · no Create chrome · no secrets · no pipeline break. |

## Exact files AI Bridge may edit

| Path | Action |
|------|--------|
| `scripts/trace-carousel-session.ts` | Extend draw + Step2 MD + PNG copy |
| `lib/studio/carousel-html-renderer.ts` | **Optional** prompt-capture return when `CAROUSEL_PROMPT_TRACE=1` only |
| `docs/карусель тест/02-designer-*.md` | Write 2 sessions |
| `generatedMedia/wave-carousel-prompt-trace/**` | Write ≤6 PNG (+ budget file if pattern exists) |

## Backend (optional)

| If | Then |
|----|------|
| Draft upsert needs API tweak for stable ids | Backend surgical on drafts route only |
| Prompt capture needs shared helper under `lib/llm/` | Backend OK if AI Bridge requests |
| Script already works end-to-end | Mark Backend **N/A** in `decisions.md` |

## MUST NOT

- Redesign HTML kits / brandbook UI  
- Change Scriptwriter VIRAL CRAFT overlay (owned by ticket 1)  
- Raise budget above 6  
- Social publish  
- Touch AppShell / Create chrome  

## Smoke plan

| Run | Draft id | Slides | PNGs | Designer MD |
|-----|----------|--------|------|-------------|
| A | `draft-trace-a` | 3 | 3 | `02-designer-<slug-a>.md` |
| B | `draft-trace-b` | 3 | 3 | `02-designer-<slug-b>.md` |
| **Total** | | | **6** | |

Env: `CAROUSEL_PROMPT_TRACE=1`, `CAROUSEL_DRAW_SKIP_BG=0`, HTML-first on.

## Acceptance

- [ ] Two Step2 MDs with §3 EXACT prompts for slide_01…03  
- [ ] §4 post-process filled; `swipe_trigger` painted = no  
- [ ] §5 PNG paths exist on disk; wave total ≤6  
- [ ] Drafts overwritten (2 ids), not multiplied  
- [ ] Create pipeline shape unchanged  

Hard REJECT: Designer MD without exact prompts; text-only claim when image was expected without `skipped` note; >6 PNG; UI churn.

## Guards (Tester)

- Count PNG under wave artifact dir ≤6  
- Each Designer MD has `### slide_01` … `slide_03` fenced prompts  
- Grep shell paths: **0** Create chrome file changes in this ticket  
- Guard file: `memory/tickets/C-trace-designer-image/guards.md`

## Skills

`carousel-prompt-trace` · `ai-bridge` · `carousel-json-contract` · `content-pipeline-agents`
