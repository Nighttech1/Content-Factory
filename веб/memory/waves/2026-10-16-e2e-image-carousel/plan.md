# Wave plan — 2026-10-16 E2E image carousel (Phase4 · kill HTML overlay)

> **Trainer grade:** A — `memory/trainer/2026-10-16-e2e-image-carousel-grade.md`  
> **Plugin:** `plugins/trainer/e2e-image-carousel.md`  
> **Client:** **S53 HARD** (`client.mdc` §19 · `client-scenarios` S53.A–B)  
> **Architect:** this plan + `chain.md` + tickets `C-e2e-*`  
> **Product code:** none in Architect step

## Intent (one sentence)

Make Designer **draw** paint **full Instagram slides** (scene + typography + CTA) via `openai/gpt-5.4-image-2`, with inputs = Scriptwriter scenario text + approximate Settings colors — and **KILL** Playwright/HTML text overlay as the primary ship path.

## Locks (HARD)

| Lock | Value |
|------|-------|
| `ticket_limit` | **≤3** — exact pack below |
| `upgrade_only` | `true` — patch draw + prompts in place; no new agent |
| `no_pipeline_break` | `true` — Create stays **Scriptwriter → Designer → Draft** |
| `shell_freeze` | `true` — AppShell / Create **chrome** / Settings UI / nav = **0** edits |
| `draw_path` | **IN SCOPE** — `runCreateCarouselDraw` + image prompts |
| `validation_budget_png` | **6** (2×3) |
| `no social publish` | `true` |
| `secrets_in_md` | **forbidden** |
| modules | `carousel-engine` only |
| Frontend / Motion | **omit** |
| Client gate | **S53** — HTML-overlay-primary as success = **FAIL** |

## Evidence baseline (Architect read)

| Finding | Source | Ticket |
|---------|--------|--------|
| Phase3 runtime still default: `CAROUSEL_HTML_FIRST !== "0"` → HTML + Playwright primary | `lib/studio/carousel-html-renderer.ts` `isCarouselHtmlFirstDraw` | **C-e2e-draw-integrated-text** |
| Image prompts force **zero text**: `sanitizeLiveGenVisualPrompt` appends `ABSOLUTELY NO readable text…`; builder says «leave empty space for overlays» | same file ~2050–2197 | **C-e2e-draw-integrated-text** + **C-e2e-prompts-kill-overlay** |
| Designer overlays still say HTML/CSS-first / no text in diffusion | `lib/studio/create-carousel-prompts.ts`, `lib/mesh/agent-defaults.ts` | **C-e2e-prompts-kill-overlay** |
| Skills/rules already Phase4 (Trainer A) but code not flipped | `carousel-json-contract` § Phase4, notes E2E DIFFUSION | align code to skills |
| Prior trace script forces HTML-first + dumps skipped/bg-only prompts | `scripts/trace-carousel-session.ts` | **C-e2e-live-trace** upgrade |
| Draft overwrite pattern exists (`draft-trace-a/b`) | prior wave | **new** stable ids `draft-e2e-a` / `draft-e2e-b` |
| Trace folder + Designer template require `html_overlay: none` + typography in prompts | `docs/карусель тест/` | **C-e2e-live-trace** |

## Ticket map (≤3)

| Order | ID | Priority | Owner | Goal |
|-------|-----|----------|-------|------|
| 1 | **C-e2e-prompts-kill-overlay** | P0 | AI Bridge | Invert Designer / Create wording: bake typography into image prompts; remove «zero readable text» / HTML-first **primary** claims |
| 2 | **C-e2e-draw-integrated-text** | P0 | Backend (+ AI Bridge helper OK) | Flip `runCreateCarouselDraw`: per-slide `generateAggregatorImage` full composition → save PNG; skip HTML text overlay primary |
| 3 | **C-e2e-live-trace** | P0 | AI Bridge | Live Scriptwriter (viral JSON) → draw; overwrite `draft-e2e-a/b`; 6 PNG; exact prompts in `docs/карусель тест/` |

## Decisions (Architect locks for executors)

### D-e2e-1 — Env / mode (default Phase4 ON)

| Key | Phase4 default | Meaning |
|-----|----------------|---------|
| **`CAROUSEL_E2E_TEXT_IN_IMAGE`** | **ON** unless explicitly `"0"` | Primary ship path: image model paints typography **in pixels** |
| `CAROUSEL_HTML_FIRST` | When E2E ON → treat as **OFF** for text compositing (ignore or force skip overlay) | Phase3 HTML overlay = **legacy only** |
| `CAROUSEL_DRAW_SKIP_BG` | Must **not** skip image API when E2E ON | No «HTML-only success» under Phase4 |
| `CAROUSEL_PROMPT_TRACE` | `1` during live/trace script | Dump exact prompts |

**Helper:** `isCarouselE2eTextInImage(): boolean` → `process.env.CAROUSEL_E2E_TEXT_IN_IMAGE !== "0"` (default ON).  
Document in `.env.example` / deployer note. Legacy emergency: set `CAROUSEL_E2E_TEXT_IN_IMAGE=0` + `CAROUSEL_HTML_FIRST=1` — **never** claim S53 PASS on that path.

### D-e2e-2 — Prompt builder invert (kill NO-letters ban)

When E2E ON, **replace** Phase3 bg-only prompt assembly:

**INVERT / do not use as primary:**
- `sanitizeLiveGenVisualPrompt` suffix `ABSOLUTELY NO readable text…`
- Lines: `CRITICAL: zero readable text…`, `All headlines… composited later via HTML/CSS`

**New per-slide prompt contract (one string → `generateAggregatorImage`):**
1. Canvas: premium Instagram carousel slide, vertical **4:5** (1080×1350), expensive editorial look  
2. Scene: `visual_prompt` (composition / light / materials)  
3. **Exact readable typography IN image:** `primary_copy` (headline), `secondary_copy` (body) — paint sharp, legible glyphs (Armenian / Latin as given)  
4. CTA: catalog label from `cta_type` 1–4 on `cta_slide` only (or slide that carries CTA) — **on-pixel** button/pill look  
5. Colors: **approximate** tokens from active `DesignPresetFile` / Settings (`bg`, `accent`, `text`, type hints) — not full DESIGN.md layout markup  
6. Safe-zone guidance: top≥120, bottom≥160, sides≥80 — keep type inside margins  
7. Forbidden: paint `swipe_trigger`; purple slop; coffee-theme lock when topic ≠ coffee; placeholder stacks `1/2/CTA`

Optional rename: `buildE2eIntegratedSlidePrompt(slide, brandTokens)` alongside legacy sanitize (legacy only when E2E OFF).

### D-e2e-3 — `runCreateCarouselDraw` primary path

| Step | Phase4 (E2E ON) | Legacy (E2E OFF) |
|------|-----------------|------------------|
| 1 | Build integrated prompt per slide | (unchanged Phase3) |
| 2 | `generateAggregatorImage` **every** slide (N calls) | optional bg / HTML-first |
| 3 | Download/save PNG → `public/generated/carousel/{jobId}/slide_NN.png` | Playwright HTML raster |
| 4 | **Skip** `carouselHtmlBuilder` text overlay + Playwright as product success | HTML primary |
| 5 | Return `renderMode: "e2e_diffusion"` (or `image_png`); `htmlFirst: false`; `html_overlay: none` in traces | `html_png` |

**Emergency fallback only** (env / explicit flag): if image API fails mid-run, may soft-fall to HTML overlay **behind** `CAROUSEL_E2E_FALLBACK_HTML=1` — must tag `legacy_html_overlay` in result + traces; **Tester/Client = not PASS for S53**.

Result shape (minimal upgrade, keep consumers working):
- Keep `slides[].imageUrl`, `ok`, `model`, `budget`
- Add/confirm: `renderMode`, `e2eTextInImage: true`, `bgImageCalls` (= N when E2E), `promptTrace` when `CAROUSEL_PROMPT_TRACE=1` with **exact** prompts (must include copy strings)
- `htmlFirst` must be `false` on Phase4 success

Budget gate: `reservePngBudget(slides.length)` still applies; wave smoke hard-cap **6**.

### D-e2e-4 — Designer overlays / agent defaults (AI Bridge)

Patch (upgrade_only, no schema rewrite):
- `lib/studio/create-carousel-prompts.ts` — Designer overlay / paint lines: **E2E DIFFUSION**; remove «HTML/CSS-first primary» and «optional image-2 bg only (no text)»
- `lib/mesh/agent-defaults.ts` — Designer seed lines match Phase4
- Notes already Phase4 — sync code strings to notes; do **not** strip Scriptwriter VIRAL CRAFT / CTA catalog / swipe meta
- Schema / zod keys **stable** (`carousel-json-contract`)

Scriptwriter: still produces viral Dramaturgy JSON (primary/secondary/CTA + `visual_prompt`). Designer draw = **integrated-text image gen** only.

### D-e2e-5 — Live trace + drafts + topics

| Item | Lock |
|------|------|
| Script | Upgrade `scripts/trace-carousel-session.ts` **or** thin `scripts/live-gen-e2e-diffusion.ts` that reuses assemble + draw — Architect preference: **extend existing trace script** with E2E env defaults (less fork) |
| Env for run | `CAROUSEL_E2E_TEXT_IN_IMAGE=1`, `CAROUSEL_PROMPT_TRACE=1`, `CAROUSEL_DRAW_SKIP_BG=0`, do **not** force `CAROUSEL_HTML_FIRST=1` |
| Drafts | Overwrite **only** `draft-e2e-a`, `draft-e2e-b` — no spam Черновики |
| Topics | Two **Armenian** user-like briefs (≠ coffee product lock). Reuse cultural themes OK (letters / Sevan / Yerevan evening) if still distinct |
| PNG | Exactly **2×3=6**; artifacts `generatedMedia/wave-e2e-image-carousel/` + public carousel URLs |
| MD | `docs/карусель тест/0x-scriptwriter-*.md` + `0x-designer-*.md` — Designer §3 = EXACT prompts **with typography**; §4 `html_overlay: none`; `Paint path: e2e_diffusion` |
| README | Index + weak-link / Phase4 verdict in same ticket or brief note — must not claim PASS if prompts still ban letters |

### D-e2e-6 — What stays / what dies

| Keep | Kill as primary |
|------|-----------------|
| Scriptwriter → Designer → Draft | HTML text overlay + Playwright as ship success |
| Dramaturgy JSON + CTA 1–4 + swipe meta | «zero readable text in diffusion» |
| Settings colors → prompt tokens | Full DESIGN.md layout markup to image |
| Budget 6 + stop-report | Open-ended PNG burn |
| `carouselHtmlBuilder` code on disk | Calling it for Phase4 product path |

## Path locks (no overlap)

1. **C-e2e-prompts-kill-overlay** first — owns `create-carousel-prompts.ts` + `agent-defaults` Designer lines (+ notes sync if needed).  
2. **C-e2e-draw-integrated-text** second — owns `carousel-html-renderer.ts` (`sanitize` / new builder / `runCreateCarouselDraw`). May touch `aggregator-images` **only** if download/save helper missing.  
3. **C-e2e-live-trace** last — owns script + MD + PNG + draft upsert; may **read** draw/prompt APIs, not rewrite overlay wording or re-fork draw logic.  
4. **Do not** parallel two writers on `carousel-html-renderer.ts` or the live script.  
5. Shell / Create chrome / mesh / Settings UI / Frontend / Motion / Prisma / Apify: **0**.

## Acceptance (Client language · S53)

1. Create / live draw produces slides where **headline + body + CTA look painted on the photo**, not a sharp HTML layer over a blank-field background.  
2. Trace MD shows per-slide image prompts that **include** the scenario text (not «NO letters»).  
3. Post-process records `html_overlay: none` (or legacy tagged + not claimed PASS).  
4. Exactly **6 PNG** for the wave smoke; drafts `draft-e2e-a/b` overwritten.  
5. Pipeline still Scriptwriter → Designer → Draft; chrome unchanged.

## Out of scope

- AppShell / Create modal redesign  
- Razbor / Marketing / reels Remotion rewrite  
- Raising budget above 6 for this wave  
- Social publish / VPS  
- New Create agent or zod key churn  
- Claiming Phase3 HTML sharpness as Phase4 success

## Skills for executors

`carousel-json-contract` § Phase4 · `create-carousel-prompts-notes` § E2E DIFFUSION · `carousel-prompt-trace` · `ai-bridge` · `prompt-engineering` § Phase4 · `content-pipeline-agents` · `backend` · `tester` · Client **S53**

## Next

Orchestrator → **AI Bridge** on **C-e2e-prompts-kill-overlay**.
