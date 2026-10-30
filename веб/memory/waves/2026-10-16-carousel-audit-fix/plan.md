# Wave plan — 2026-10-16 carousel-audit-fix

> **Trainer grade:** B — `memory/trainer/2026-10-16-carousel-audit-fix-grade.md`  
> **Research:** `docs/PROMPT_AUDIT_CAROUSEL_FULL.md` + user/Gemini conclusion  
> **Architect:** this plan + `chain.md` + tickets `C-audit-01…03`  
> **Product code:** none in Architect step

## Intent (one sentence)

Fix Create carousel quality drivers: **wrong model routing**, **noisy/contradictory prompts**, and **render path that fights text-heavy slides** — without breaking Scriptwriter → Designer → Draft or touching UI chrome.

## Locks (HARD)

| Lock | Value |
|------|-------|
| `ticket_limit` | **≤3** (this wave = exactly 3 tickets) |
| `upgrade_only` | `true` — patch in place; no new Create agent / pipeline rewrite |
| `no_pipeline_break` | `true` — Create stays **Scriptwriter → Designer → Draft** (+ Публикация step) |
| `shell_freeze` | `true` — no AppShell / nav / Create chrome redesign |
| `validation_budget_png` | **6** (2 carousels × 3 slides) |
| `no social publish` | `true` |
| modules | `carousel-engine` only (custom-reels out unless Fixer finds shared regression) |

## Evidence baseline (Architect read)

| Finding | Source | Ticket |
|---------|--------|--------|
| Scriptwriter seed = `anthropic/claude-haiku-4.5` | `types/mesh-agent.ts`, `agent-defaults`, audit §1 / P7 | **C-audit-01** |
| Designer mesh model = `openai/gpt-5.4-image-2` passed into **chat** describe → risk empty→`gpt-4o-mini` | `agent-chat/route.ts` preferredModel path; audit P6 | **C-audit-01** |
| Draw already uses `DEFAULT_CAROUSEL_IMAGE_MODEL` = image-2 | `aggregator-images.ts`, `runCreateCarouselDraw` | **C-audit-01** verify |
| COMBAT CTA «бронь/сторис» ≠ catalog 1–4 | `COMBAT_USER_BRIEFS["carousel-engine"]` vs overlays; audit P4 | **C-audit-02** |
| Agent-start repeats overlay + mesh systemPrompt + pack (3–4× HARD) | `assembleAgentStartSystemPrompt` / `buildRulesBlock`; audit P5 | **C-audit-02** |
| Few-shots = fixture **names** only | `sprint9-carousel-pack.ts`; audit P3 | **C-audit-02** |
| Draw = per-slide image bg + HTML kits; overlays still say panorama→slice | `carousel-html-renderer.ts` vs designer overlay; audit P1 | **C-audit-03** |
| Claude-chat quality > product because HTML/CSS text + stronger models | research conclusion | **C-audit-01 + 03** |

## Phases

### Phase 0 — Models & routing (ticket **C-audit-01**)

**Goal:** every Create call hits the right aggregator surface.

| Decision ID | Lock |
|-------------|------|
| **D-m-1** | Image / draw pixels: **`openai/gpt-5.4-image-2`** (`DEFAULT_CAROUSEL_IMAGE_MODEL`). Env `CAROUSEL_IMAGE_MODEL` may override only to another **image-class** id. |
| **D-m-2** | Scriptwriter default: **`anthropic/claude-3.7-sonnet`** (Polza-style slug, mirrors `anthropic/claude-haiku-4.5`). Label RU: «Claude 3.7 Sonnet». Thinking/reasoning **ON** when API supports (`thinking: true` / `reasoningEffort: "high"`). |
| **D-m-3** | Designer **describe / chat / handoff** text model: **same Sonnet slug** via new constant `DEFAULT_DESIGNER_TEXT_MODEL` (or `modelConfig.textModel`). Mesh row may keep image id for **draw**, but chat routes **must not** send image id to `/chat/completions`. |
| **D-m-4** | Route helper (Backend): if `classifyAggregatorModelKind(model)==="image"` **and** mode ∈ `{chat,handoff,describe}` → substitute `textModel` / `DEFAULT_DESIGNER_TEXT_MODEL`. **Forbidden:** fall through to `DEFAULT_AGGREGATOR_MODEL` (`gpt-4o-mini`) for Designer describe. |
| **D-m-5** | Catalog: add `anthropic/claude-3.7-sonnet`; keep `claude-sonnet` as alias → map via `AGGREGATOR_MODEL_MAP_*` or resolve to same Polza id. If live Polza rejects 3.7, Backend documents fallback **`anthropic/claude-sonnet-4`** in ticket `decisions.md` — do not silently stay on Haiku. |
| **D-m-6** | Razbor / Marketing Haiku defaults: **out of scope** this wave. |

**Acceptance (Client language):** Create Scriptwriter chat uses Sonnet (not Haiku). Designer «описание» uses Sonnet text — never image-2 and never mini. «Нарисовать» still burns image-2 (or HTML-primary with optional image-2 bg after C-audit-03).

### Phase 1 — Prompt hygiene (ticket **C-audit-02**)

**Goal:** one clear combat instruction set; less noise; better few-shots.

| Decision ID | Lock |
|-------------|------|
| **D-p-1** | `assembleAgentStartSystemPrompt` / `buildRulesBlock`: **dedupe** — do not concatenate full CREATE overlay + full mesh `systemPrompt` + pack HARD. Prefer: (1) **paired invariants** block once, (2) short role delta, (3) full few-shots. |
| **D-p-2** | Paired invariants (must appear once, wording synced): `requested_slide_count===slides.length` from user N; cover hook curiosity ≤6–8; `swipe_trigger` META never on-slide; CTA catalog **1–4**; non-empty concrete `visual_prompt` every slide. |
| **D-p-3** | CTA COMBAT sync: replace carousel COMBAT line «бронь стола / запись в сторис…» with catalog **1–4** intents (comments / subscribe / TG profile / like+save). Mesh copywriterPrompt CTA line must match Create overlay. |
| **D-p-4** | Embed **full** golden JSON bodies (2–3 fixtures from `memory/fixtures/sprint9/carousel/*`) into pack / agent-start — **not** name-only bullets. Cap size: trim alt_text/caption if needed; keep hook + all slides + cta_type. |
| **D-p-5** | Designer overlay wording: align with Phase3 (HTML/CSS-first); stop promising panorama→slice as sole truth unless C-audit-03 re-implements it. |

**Acceptance:** System prompt for Scriptwriter start no longer triple-repeats the same HARD block; COMBAT CTA matches 1–4; few-shot section contains parseable JSON objects.

### Phase 3 — HTML/CSS-first render (ticket **C-audit-03**)

**Goal:** text-heavy slides look like Claude-chat HTML craft, not diffusion typography.

| Decision ID | Lock |
|-------------|------|
| **D-r-1** | **Primary:** per slide = **full HTML/CSS** (copy + CTA + kit chrome + brand CSS vars) → **Playwright** PNG 1080×1350. Prefer extending LLM→HTML path (describe plan / draw handoff drives HTML), not baking words into image-2. |
| **D-r-2** | **Optional:** `openai/gpt-5.4-image-2` only for **isolated background / illustration** (zero readable text) OR keep current per-slide bg gen under HTML — Architect preference: **HTML-first**; diffusion optional. Do **not** require panorama master unless already coded and prompts agree. |
| **D-r-3** | Keep handoff JSON / zod keys **stable**. Upgrade `carousel-html-renderer.ts` / `carouselHtmlBuilder` in place — **no** new agent. |
| **D-r-4** | Preview = **N × 4:5** sliced URLs only; «Готово» without visible frames = FAIL. |
| **D-r-5** | Validation budget: smoke writes **≤6 PNGs** into drafts / `generatedMedia/wave-carousel-audit-fix/` (2 jobs × 3 slides). Overspend → stop-report. |

**Acceptance:** After Scriptwriter JSON → Designer describe → Нарисовать, drafts show 3 readable text slides per carousel × 2 runs (6 PNG); copy is HTML-rasterized (not garbled diffusion text).

## Ticket map

| ID | Title | Priority | Primary role |
|----|-------|----------|--------------|
| **C-audit-01** | Models + describe≠image routing | P0 | AI Bridge → Backend |
| **C-audit-02** | Phase1 prompts: dedupe / COMBAT CTA / full few-shots | P0 | AI Bridge |
| **C-audit-03** | Phase3 HTML/CSS-first draw | P0 | AI Bridge → Backend |

## Out of scope

- Frontend chrome / 21st redesign / mesh UI  
- Social publish / VPS  
- custom-reels / HeyGen / Razbor model upgrades  
- Soft-mock success on bad JSON  
- Raising PNG budget above 6 for this wave’s smoke  

## Validation budget detail

| Run | Slides | PNGs |
|-----|--------|------|
| Carousel A (vernatun topic) | 3 | 3 |
| Carousel B (different kit/CTA) | 3 | 3 |
| **Total** | | **6** |

Artifacts: `generatedMedia/wave-carousel-audit-fix/` + draft entries visible in Studio Ours → Черновики.

## Skills for executors

`ai-bridge` · `prompt-engineering` § Carousel audit · `carousel-json-contract` (+ create-carousel-prompts-notes) · `content-pipeline-agents` · `backend` · `tester` · Trainer notes `llm-model-catalog-notes.md`

## Done when

All three tickets have localhost fix + `guards.md`; Tester green on model ids + CTA sync + 6 PNG smoke; Deployer localhost; Client Playwright Create (S41+) **without** shell churn.
