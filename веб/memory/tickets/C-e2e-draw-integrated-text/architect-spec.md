# Architect spec — C-e2e-draw-integrated-text (P0)

> Wave: `memory/waves/2026-10-16-e2e-image-carousel/`  
> Chain: wave `chain.md` step 3 · after **C-e2e-prompts-kill-overlay**  
> Supersedes product primary of **C-audit-03** Phase3 HTML-first (code remains as legacy fallback only)

## Goal

Upgrade `runCreateCarouselDraw` so the **default ship path** is: per-slide image LLM paints a **full 4:5 Instagram slide** (scene + readable typography + CTA) from Scriptwriter copy + approximate Settings colors — and **skip** `carouselHtmlBuilder` / Playwright text overlay as primary success.

## Decision locks

| ID | Lock |
|----|------|
| **D-d-1 Env default** | Add `isCarouselE2eTextInImage()` → `process.env.CAROUSEL_E2E_TEXT_IN_IMAGE !== "0"` (**default ON**). Document in `.env.example` if present. |
| **D-d-2 Primary path** | When E2E ON: for each slide build **integrated** prompt → `generateAggregatorImage` → download/save PNG under `public/generated/carousel/{jobId}/`. **Do not** Playwright-raster HTML text as product success. |
| **D-d-3 Prompt invert** | When E2E ON: **do not** call Phase3 `sanitizeLiveGenVisualPrompt` NO-letters path. New builder includes `primary_copy`, `secondary_copy`, CTA label, `visual_prompt`, approx preset colors, safe-zone. When E2E OFF: keep legacy sanitize for HTML-first path. |
| **D-d-4 Skip overlay** | When E2E ON: skip `carouselHtmlBuilder` text frames + `screenshotHtmlToPng` for success path. Optional write of `.html` debug **forbidden** as required success artifact. |
| **D-d-5 Result shape** | Success: `ok: true`, `htmlFirst: false`, `e2eTextInImage: true` (or equivalent), `renderMode: "e2e_diffusion"` (name locked), `bgImageCalls === slides.length`, `imagePrompts` / `promptTrace` = exact strings sent to API. Keep `slides[].imageUrl` consumers working (`agent-chat` draw branch). |
| **D-d-6 Fallback** | HTML/Playwright only if `CAROUSEL_E2E_TEXT_IN_IMAGE=0` **or** explicit `CAROUSEL_E2E_FALLBACK_HTML=1` after image failure — tag `legacy_html_overlay`; **not** S53 PASS. |
| **D-d-7 Model** | `DEFAULT_CAROUSEL_IMAGE_MODEL` / `openai/gpt-5.4-image-2` (env override OK). |
| **D-d-8 Schema** | Handoff JSON / zod keys **unchanged**. No new agent. |
| **D-d-9 Budget** | Keep `reservePngBudget` / `commitPngBudget`. Wave smoke hard-cap enforced in live ticket (6). |
| **D-d-10 Aggregator** | E2E ON **requires** aggregator key; fail `missing_key` if absent (no silent HTML success). |
| **D-d-11 Pipeline** | Modes: describe → confirm → draw → drafts. No Publisher agent. |
| **D-d-12 shell_freeze** | No Create chrome / Settings UI edits. |

## Prompt contract (per slide · E2E ON)

```
Premium Instagram carousel SLIDE (not background-only), vertical 4:5 1080×1350, expensive editorial.
Approx brand colors: {bg, accent, text, … from DesignPresetFile}.
Scene: {visual_prompt}.
Paint EXACT readable headline: "{primary_copy}".
Paint EXACT readable body: "{secondary_copy}".
[If cta slide] Paint CTA control with label: "{cta_catalog_label}".
Safe-zone: keep typography inside top≥120 bottom≥160 sides≥80.
Do NOT paint swipe_trigger. No purple AI-slop. Sharp legible glyphs.
```

(Exact English phrasing may be polished by Backend; **must** include the copy strings verbatim.)

## Exact files Backend may edit

| Path | Action |
|------|--------|
| `lib/studio/carousel-html-renderer.ts` | E2E flag, prompt builder, `runCreateCarouselDraw` flip, result fields |
| `lib/llm/aggregator-images.ts` | Only if download/save-from-URL helper missing / broken |
| `.env.example` / `docs/ENV_AGGREGATOR.md` | Document `CAROUSEL_E2E_TEXT_IN_IMAGE` |
| `app/api/studio/agent-chat/route.ts` | **Only if** draw result typing breaks — minimal type passthrough |

## MUST NOT

- Redesign HTML kits «for fun» while E2E ON  
- Delete `carouselHtmlBuilder` (legacy fallback)  
- Edit Create chrome / Frontend  
- Raise wave budget / social publish  
- Own live Armenian session MD (ticket 3) — unit/fixture smoke OK  
- Re-introduce «leave empty space for HTML» in E2E prompts  

## Smoke (this ticket · fixture, not full 6 live)

| Check | Expect |
|-------|--------|
| Fixture 3-slide JSON + E2E ON + mock/live image | 3 image API calls; 3 PNG paths; `renderMode=e2e_diffusion` |
| Exact prompt contains `primary_copy` substring | true |
| Prompt does **not** contain `ABSOLUTELY NO readable text` | true |
| `htmlFirst` on result | false |
| E2E OFF + HTML_FIRST | legacy still callable (regression soft) |

Prefer existing smoke script upgrade (`smoke-c-audit-03-*` sibling) or tiny `scripts/smoke-c-e2e-draw.ts` — full Armenian live = **C-e2e-live-trace**.

## Acceptance (Client language)

1. Draw path default no longer ships «pretty photo + HTML text layer».  
2. Each slide PNG is the image-model output (typography in pixels).  
3. Trace-ready: exact prompts available when `CAROUSEL_PROMPT_TRACE=1`.  
4. Create API consumers still get `slides[].imageUrl`.  

Hard REJECT: default still HTML-first; E2E prompts still ban letters; claiming success with `image_llm: skipped` under E2E ON.

## Guards (Tester)

- Unit/integration: E2E path calls image API N times; no Playwright success required  
- Grep E2E prompt builder: includes copy; excludes NO-letters suffix  
- Env default ON documented  
- Guard: `memory/tickets/C-e2e-draw-integrated-text/guards.md`

## Skills

`backend` · `carousel-json-contract` § Phase4 · `ai-bridge` (prompt parity) · `carousel-prompt-trace` · Client **S53**
