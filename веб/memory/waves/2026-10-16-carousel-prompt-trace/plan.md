# Wave plan — 2026-10-16 carousel-prompt-trace

> **Trainer grade:** B — `memory/trainer/2026-10-16-carousel-prompt-trace-grade.md`  
> **Skill:** `.cursor/skills/carousel-prompt-trace/SKILL.md`  
> **Docs folder:** `docs/карусель тест/` (README + `_templates/` already from Trainer)  
> **Architect:** this plan + `chain.md` + tickets `C-trace-*`  
> **Product code:** none in Architect step

## Intent (one sentence)

Find the **weak link** Scriptwriter → Designer → Image with **full MD evidence** (prompts + replies + EXACT per-slide image prompts), inject **VIRAL CRAFT** so JSON is not flat, and prove with **2×3 = 6 PNG** — without touching UI chrome or breaking the Create pipeline.

## Locks (HARD)

| Lock | Value |
|------|-------|
| `ticket_limit` | **≤3** (exact pack: `C-trace-scriptwriter-viral` → `C-trace-designer-image` → `C-trace-docs-md`) |
| `upgrade_only` | `true` — patch overlays + diagnostic script in place |
| `no_pipeline_break` | `true` — Create stays **Scriptwriter → Designer → Draft** |
| `shell_freeze` | `true` — **no** AppShell / nav / Create chrome / Settings UI |
| `validation_budget_png` | **6** (2 carousels × 3 slides) |
| `no social publish` | `true` |
| `secrets_in_md` | **forbidden** (no API keys, `Authorization`, `DATABASE_URL`) |
| modules | `carousel-engine` only |
| Frontend | **omit** |

## Evidence baseline (Architect read)

| Finding | Source | Ticket |
|---------|--------|--------|
| Skill + templates exist; live MD empty | `carousel-prompt-trace`, `docs/карусель тест/` | **C-trace-docs-md** fill |
| VIRAL CRAFT text lives in notes only — **not** yet in `create-carousel-prompts.ts` | `create-carousel-prompts-notes.md` § Viral craft; overlay has TOPIC + hook but no full VIRAL CRAFT block | **C-trace-scriptwriter-viral** |
| Paired invariants already once via `CREATE_CAROUSEL_PAIRED_INVARIANTS` | `create-carousel-prompts.ts` + `agent-start-bundle.ts` | inject **once** — no triple |
| Draw = HTML/CSS-first + optional image-2 bg from `visual_prompt` | `runCreateCarouselDraw` | **C-trace-designer-image** must dump EXACT bg prompt per slide |
| Prior live-gen pattern (Armenian, overwrite drafts) | `scripts/live-gen-s52-armenian.ts` | reuse pattern → `scripts/trace-carousel-session.ts` |
| Optional `CAROUSEL_PROMPT_TRACE` still open | Trainer gap #5 | **locked on** for script + optional draw capture |

## Ticket map (≤3)

| ID | Priority | Goal |
|----|----------|------|
| **C-trace-scriptwriter-viral** | P0 | Inject VIRAL CRAFT; live Scriptwriter call; Step1 MD (request · full system · full user · reply · optional correction · final JSON) |
| **C-trace-designer-image** | P0 | Capture EXACT image LLM prompts per slide; `runCreateCarouselDraw`; Step2 MD + **6 PNG** overwrite stable draft ids |
| **C-trace-docs-md** | P1 | Index `docs/карусель тест/README.md`; name/link sessions; weak-link verdict; assert templates complete (no truncated system) |

Docs are **not** merged into ticket 1: README + Client package stay a separate closable deliverable so Scriptwriter viral work can finish before index/verdict.

## Decisions (Architect locks)

### D-v-1 — VIRAL CRAFT inject (AI Bridge)

Append the **exact** VIRAL CRAFT block from `create-carousel-prompts-notes.md` § Viral craft into:

1. **`CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY`** (role delta) — primary, always present for Create Scriptwriter.
2. Optionally a **one-line pointer** in `CREATE_CAROUSEL_PAIRED_INVARIANTS` only if needed for agent-start Rules — **do not** paste the full block twice (D-p-1 dedupe from audit wave).

Upgrade_only: do **not** rewrite schema hint, CTA catalog, or swipe meta already in paired invariants.

### D-v-2 — Diagnostic script (primary dump path)

New script: **`scripts/trace-carousel-session.ts`** (AI Bridge owns; Backend only if draw return shape needs a tiny helper).

| Step | Behavior |
|------|----------|
| 0 | Load `.env`; set `CAROUSEL_PROMPT_TRACE=1`; force HTML-first + bg on (`CAROUSEL_DRAW_SKIP_BG=0`); artifact dir under `generatedMedia/wave-carousel-prompt-trace/` |
| 1 | Build Scriptwriter system via **same** `assembleAgentStartSystemPrompt` / overlay path as Create (not a hand-rolled stub) |
| 2 | Live Polza/aggregator chat: user = **raw** Armenian brief (C-155); capture full system + user + reply |
| 3 | Optional **one** correction turn (polish for viral density / visual_prompt); capture reply #2 |
| 4 | Parse fenced JSON → write `docs/карусель тест/01-scriptwriter-<slug>.md` from template |
| 5 | Call `runCreateCarouselDraw` with handoff JSON; capture **EXACT** per-slide image prompts (sanitized `visual_prompt` + no-text suffix as sent to image API, or `image_llm: skipped` + HTML inputs) |
| 6 | Write `docs/карусель тест/02-designer-<slug>.md`; copy/overwrite **3 PNG** per topic |
| 7 | Repeat for topic B → total **6 PNG**; stop-report if over budget |

CLI flags (suggested): `--only=a|b|all`, `--skip-draw` (Scriptwriter MD only), `--correction` (force polish turn).

### D-v-3 — Topics (NOT coffee)

Two **user-like** Armenian briefs (Vernatun brand OK; topic ≠ coffee/jazz/club default):

| Run | Slug suggestion | Brief intent (examples — AI Bridge may refine wording) | Draft id (overwrite) |
|-----|-----------------|--------------------------------------------------------|----------------------|
| A | `hy-letters` | Армянский алфавит / буква как дом / diaspora kids | `draft-trace-a` |
| B | `hy-yerevan-evening` | Вечерний Ереван / кафе терраса / городской свет — **not** product-coffee ritual lock | `draft-trace-b` |

N = **3** slides each. CTA # from catalog **1–4** (pick one per run, e.g. A→2, B→1).  
If B still reads as coffee-product lock → swap to language / heritage / table ritual **without** espresso theme.

### D-v-4 — Image prompt capture

Prefer returning prompts from draw path when `CAROUSEL_PROMPT_TRACE=1`:

- Minimal upgrade: `runCreateCarouselDraw` (or a thin wrapper used only by the script) records per-slide `{ slide, image_llm: "openai/gpt-5.4-image-2" \| "skipped", exact_prompt, html_inputs_summary }`.
- Script writes those strings **verbatim** into Designer MD §3.
- **No** secrets in that payload.

If capture-in-renderer is too invasive for this wave: script may duplicate sanitize + log **before** calling draw — must still match what draw sends (Tester greps parity).

### D-v-5 — Backend scope

| In | Out |
|----|-----|
| Optional tiny helper / return field on draw for prompt dump | Prisma migrations |
| Script may hit localhost drafts upsert to overwrite `draft-trace-a/b` | Apify / feed / Scout |
| | `agent-chat/route.ts` UI behavior changes |

If drafts upsert already works via existing API (as S52 live-gen), Backend step may be **skip** — chain marks Backend optional.

### D-v-6 — Docs package

After both runs: fill README index table (file · theme · PNG paths · weak-link).  
Weak-link verdict ∈ { Scriptwriter flat JSON · weak handoff · empty visual_prompt · image prompt weak · HTML overlay miss · none / PASS }.  
Templates remain source of section titles — sessions must have **all** sections; truncated system = FAIL.

## Path locks (no overlap)

1. **C-trace-scriptwriter-viral first** — owns `create-carousel-prompts.ts` (VIRAL CRAFT) + Scriptwriter half of `trace-carousel-session.ts` + Step1 MDs.  
2. **C-trace-designer-image second** — owns draw capture + Designer MD + PNG budget + may extend same script (sequential same-file writer).  
3. **C-trace-docs-md last** — README index + verdict only (and guard that both MD pairs exist).  
4. **Shell / Create chrome / mesh / Settings:** **0** edits.  
5. **Frontend / Motion:** omit.

## Non-goals

- Pipeline rewrite / new agent  
- Create UI redesign / handoff button changes  
- Apify / Competitors feed  
- Soft-mock success without fenced JSON or without PNG  
- VPS / social publish  
- Raising PNG budget above 6  

## Acceptance (Client language)

1. Open `docs/карусель тест/` — two Scriptwriter + two Designer session MDs with **full** prompts (not summaries).  
2. VIRAL CRAFT visible in live Scriptwriter system dump.  
3. Topics follow user briefs (not default coffee club).  
4. Six PNGs under `generatedMedia/wave-carousel-prompt-trace/` (or draft preview paths linked in MD).  
5. Weak-link verdict filled in README.  
6. Playwright Create @1440 still Scriptwriter → Designer → Draft (shape intact) — smoke, not redesign accept.

Hard REJECT: truncated system; secrets in MD; coffee-only topic lock; >6 PNG without stop; pipeline/UI chrome churn; «в API есть» without MD evidence.

## Skills for executors

`carousel-prompt-trace` (primary) · `create-carousel-prompts-notes` · `carousel-json-contract` · `ai-bridge` · `prompt-engineering` · `content-pipeline-agents` · `tester` (guards)

## Next

See `chain.md` — first code executor: **AI Bridge** on **C-trace-scriptwriter-viral**.
