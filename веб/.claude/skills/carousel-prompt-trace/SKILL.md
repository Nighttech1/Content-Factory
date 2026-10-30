---
name: carousel-prompt-trace
description: >-
  Client debugging: dump Scriptwriter→Designer→Image prompts into
  docs/карусель тест/ MD session logs. Use on carousel prompt-trace waves,
  E2E diffusion QA, weak-link diagnosis, viral JSON QA, budget 6 PNG smoke.
---

# Carousel prompt-trace (Scriptwriter → Designer → Image)

## When

User / Client asks **where quality dies** in Create/Razbor carousel: flat hooks, weak handoff, empty visual_prompt, black PNG, letters on bg, weak HTML layout, missing Brand/fonts.  
Locks: **`shell_freeze`** · **`upgrade_only`** · **`no_pipeline_break`**. **Draw/composite path IS in scope.** **S57 budget:** ONE carousel × **4** finals. Legacy 6/12 PNG budgets = historical only.

Paired skills: `carousel-json-contract` **Phase 7** · `create-carousel-prompts-notes` § LAYERED HTML · `ai-bridge` · `content-pipeline-agents` · Client **S57**.

**Тренер / AI Bridge / Backend / Tester** — пишут артефакты. Frontend **omit** (shell freeze chrome). Product code dump helpers — только если Architect locked path; иначе agents write MD by hand from live chat + server logs (no secrets).

## Goal

Find the **weak link** with evidence, not vibes:

| Step | Question |
|------|----------|
| 1 Scriptwriter | Does LLM emit **real viral** Dramaturgy JSON for **user topic** (hook gap, body beats, CTA 1–4, meta swipe, concrete `visual_prompt`)? |
| 2 Handoff | Does Designer receive **full** JSON + tokens-only / approx colors (not truncated / coffee-locked topic)? On **`vision_ref`:** etalon **image reference** present + **no** FULL DESIGN TOKEN CARD inject? |
| 3 Image bg (S57) | Exact **scene-only** prompts? HARD ban letters/logos present? Partial/inset geometry honored when etalon is not full-bleed? |
| 4 HTML + Puppeteer | Layout invent **or** vision hard-copy notes? Brand Vernatun text/CTA? CTA HTML 1–4? `character_paint=in_image` default? `renderMode: layered_html`? |

## HARD — MD session logs

Root folder (create if missing): **`docs/карусель тест/`**

| File pattern | Owner role | Contents (all sections required) |
|--------------|------------|----------------------------------|
| `NN-scriptwriter-<slug>.md` | AI Bridge (+ Tester copy) | See template `_templates/01-scriptwriter-session.md` |
| `NN-designer-<slug>.md` | AI Bridge / Backend draw path | See `_templates/02-designer-session.md` |
| `README.md` | wave index | links to sessions + PNG paths + weak-link verdict |

**Secrets:** never paste API keys, `DATABASE_URL`, Polza tokens. Redact `Authorization` headers. User topic + prompts OK.

### Scriptwriter session (Step 1) — mandatory blocks

1. **Your request** — exact user topic / N / CTA # (raw chat).
2. **Full system** sent to LLM (overlays + paired invariants + mesh identity; note dedupe — no triple paste of same HARD block).
3. **Full user** message(s) to LLM (C-155: raw user only in `role=user`).
4. **LLM chat reply** — full text (markdown + fenced JSON).
5. **Optional correction** — user polish turn + second reply (if any).
6. **Final prompt/JSON to Designer** — exact handoff artifact (`slides[]`, caption, hashtags, `promptForDesigner`).

**PASS Scriptwriter:** cover curiosity gap ≤6–8 words; body value beats; `swipe_trigger` meta on every slide; `cta_type` 1–4 on `cta_slide`; non-empty concrete `visual_prompt` each slide; topic = user (not default coffee/club).  
**FAIL:** flat label cover; empty/generic visual_prompt; missing meta; invented 5th CTA; prose-only «готово» without JSON.

### Designer session (Step 2) — mandatory blocks

1. **Handoff intake** — JSON received (or path); ack + describe plan summary.
2. **Rules / skills / plugins / MCP** added at agent-start (list ids + one-line why).
3. **EXACT prompt(s) to image LLM** — **per slide** scene-only + explicit **NO text/letters/logos**.  
   - **FAIL (S57):** letters/logos requested or present on bg.  
   - **FAIL:** type-on-PNG claimed as product without HTML composite.
4. **HTML + Puppeteer post-process** — record `renderMode: layered_html`; fonts; Brand; CTA button; cut-outs; canvas 1080×1350. `swipe_trigger` never painted.
5. **Outputs** — final PNG paths. Cap **4** finals for S57 Client score set; overspend → stop-report.

**PASS (S57):** expensive IG look; readable HTML type; clean bg scene; Brand+fonts; CTA HTML.  
**FAIL:** type-on-PNG ship; vision ON; old smoke-useful multi-set still present.

## Runtime dump (upgrade_only)

AI Bridge / Backend **may** add a **dev/diagnostic** dump helper (Architect path), e.g. write the same MD blocks when env `CAROUSEL_PROMPT_TRACE=1` (or Architect-locked flag).  

| Do | Don't |
|----|-------|
| Append/overwrite under `docs/карусель тест/` | Break Create pipeline or change handoff buttons |
| Log system+user+reply+**full image prompts** (w/ typography) | Log secrets / full `.env` |
| Keep Scriptwriter → Designer → Draft | Redesign UI shell / nav |
| Upgrade draw path to E2E diffusion | Keep HTML-overlay-primary as «success» |

If no code dump yet — **manual MD from live smoke is enough** for Client weak-link report.

## Viral craft + E2E diffusion (prompt patches)

When traces show **flat JSON** or **wrong render mode**:

- Patch Scriptwriter via `create-carousel-prompts-notes.md` § Viral craft + **Phase 7 LAYERED HTML**.
- Patch Designer via § LAYERED HTML (scene-only bg + HTML invent).
- Backend: Puppeteer composite + ban letters in image path (**Architect** locks).

## Budget & Client

| Item | Value |
|------|-------|
| PNG (**S57** Client score) | **ONE** carousel × **4** finals |
| PNG (legacy S53 / useful-smoke) | historical only — do not regenerate 6/12 sets for S57 |
| UI | `shell_freeze` |
| Draw | **in scope** — layered HTML composite |
| Acceptance | Client MD traces + Playwright Create; **S57**; «в API есть» ≠ PASS |
| Chain | Trainer → Architect → **AI Bridge** → **Backend** (Puppeteer) → Tester → Deployer → Client |

## Useful-smoke 51 / 1 / 17 (**LEGACY** · superseded by S57)

Card: `plugins/trainer/useful-smoke-51-1-17.md`. **S57:** DELETE `docs/карусель тест/smoke-useful-51-1-17/` and write **ONE** new 4-slide layered carousel + MD timeline there.

## Anti-patterns

- Trace only final PNG (no prompts) → useless.
- Truncate system prompt «для краткости» → FAIL dump.
- Claim viral craft without JSON in MD → FAIL.
- Claim **S57** ship while dump shows type-on-PNG / letters on bg / vision ON → FAIL.
- Open Apify / feed UI work in this wave → out of scope.
- New agent that skips Scriptwriter or Designer → **pipeline break** FORBIDDEN.
