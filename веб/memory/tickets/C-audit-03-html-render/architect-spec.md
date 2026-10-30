# Architect spec — C-audit-03 HTML/CSS-first render / Phase3 (P0)

> Wave: `memory/waves/2026-10-16-carousel-audit-fix/`  
> Chain: `memory/waves/2026-10-16-carousel-audit-fix/chain.md`  
> Depends on: **C-audit-02** (designer overlay wording matches runtime)  
> Audit: P1 (panorama claim vs HTML runtime), P2 (zero-text image vs Claude full-frame), research: prefer HTML-first for text-heavy slides

## Goal

Upgrade Create Designer **draw** so publish slides are **HTML/CSS-first** (LLM-driven layout + type + CTA → Playwright PNG 1080×1350). Keep `openai/gpt-5.4-image-2` as **optional** isolated background/illustration only. Preserve Scriptwriter → Designer → Draft; schema stable; smoke budget **6 PNGs**.

## Decision locks

| ID | Decision |
|----|----------|
| **D-r-1 Primary path** | Per slide: build **full HTML/CSS frame** (primary/secondary copy, CTA control from `cta_type` 1–4, kit chrome, `--cf-design-*` vars from active preset) → Playwright raster → `slide_NN.png`. Text must not depend on diffusion OCR. |
| **D-r-2 Optional image** | Call `generateAggregatorImage` **only** for background/illustration when useful; prompt remains **zero readable text**. If HTML-only is enough for a kit, skip image gen for that slide (saves budget). Prefer this over panorama master unless panorama already coded **and** prompts agree. |
| **D-r-3 Current code baseline** | Today `runCreateCarouselDraw` = N× bg image + `carouselHtmlBuilder` overlays. Phase3: flip priority to **HTML as source of truth**; bg optional under/behind HTML. Do not advertise panorama→slice as sole path. |
| **D-r-4 LLM HTML (preferred)** | Where feasible: Designer draw may ask Sonnet (text) for per-slide HTML/CSS snippet or structured layout tokens consumed by builder — **or** strengthen deterministic kits so copy/CTA always win. Architect preference: **text-heavy readability first**; either LLM-HTML or enriched builder OK if Client can read glyphs. |
| **D-r-5 Schema stable** | Handoff JSON / zod in `carousel-json-contract` **unchanged** keys. No new Create agent. |
| **D-r-6 Preview** | Return **N × 4:5** URLs only; «Готово» without visible frames = FAIL (preview-black). |
| **D-r-7 Budget** | Wave smoke: **2 carousels × 3 slides = 6 PNGs** under `generatedMedia/wave-carousel-audit-fix/` + drafts. Respect existing `reservePngBudget`; overspend → stop-report. |
| **D-r-8 Model** | Any image API call uses `DEFAULT_CAROUSEL_IMAGE_MODEL` / image-2. HTML planning uses Designer **text** model (C-audit-01). |
| **D-r-9 Pipeline** | Modes stay: describe → user confirms → draw → drafts. No Publisher agent. |

## In scope

| Path | Owner |
|------|--------|
| `lib/studio/carousel-html-renderer.ts` (`runCreateCarouselDraw` + helpers) | Backend / AI Bridge |
| HTML builder / kit modules already used by renderer | Backend / AI Bridge |
| Designer draw overlay / pack lines that describe render (align only) | AI Bridge |
| Optional: `app/api/studio/agent-chat/route.ts` draw branch if payload needs HTML flag | Backend |

## Out of scope

- Rewriting Create modal chrome  
- Soft-mock black success  
- Raising budget above 6 for this wave’s validation  
- Re-introducing full-slide typography via image-2 as primary  
- custom-reels Remotion path  

## Invariants

1. `upgrade_only` · `no_pipeline_break` · `shell_freeze`.  
2. `swipe_trigger` never painted on-slide.  
3. Brand colors from Settings active DesignPreset / DESIGN.md colors-only.  
4. Critic still gates weak JSON before draw when wired.  

## Acceptance (Client language)

1. Create: Scriptwriter delivers 3-slide JSON → Designer describe → Нарисовать → **3 readable** draft slides (Armenian/Latin glyphs clear).  
2. Second carousel (different CTA/kit) → **3 more** PNGs; wave folder shows **6** total for smoke (or drafts count = 6 frames).  
3. On-slide text looks like HTML kit (sharp), not melted diffusion letters.  
4. Pipeline shape unchanged: still Scriptwriter → Designer → Draft (Публикация step intact).  

## Guards (Tester)

- Unit/integration: draw with fixture 3-slide JSON produces 3 PNG paths; model on image calls = image-2 when called.  
- Budget counter: smoke run ≤6 PNG reserved/written for wave folder.  
- Assert overlay/docs string for draw does not require panorama-only if runtime is HTML-first.  
- Create Playwright S41+: handoff + draw preview not black.  

## Artifacts

`generatedMedia/wave-carousel-audit-fix/` — 6 PNGs max for validation; link paths in Tester report / Client verdict.

## Dependencies

After **C-audit-02** so prompts stop promising panorama-only and CTA/COMBAT are synced. Models from **C-audit-01** must already route describe text ≠ image.
