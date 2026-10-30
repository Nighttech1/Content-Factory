# Wave plan — 2026-10-17 Carousel pipeline bake-off (Phase5 · S54 · anchor_ref)

> **Trainer grade:** A — `memory/trainer/2026-10-17-anchor-ref-bakeoff-grade.md`  
> **Plugin:** `plugins/trainer/carousel-anchor-ref-bakeoff.md`  
> **Client:** **S54 HARD** (`client.mdc` §20 · `client-scenarios` S54.A–C)  
> **Architect:** this plan + `chain.md` + tickets `C-s54-*`  
> **Product code:** none in Architect step

## Intent (one sentence)

Ship a labeled bake-off: **NEW** OpenAI/GitHub-style **cover-first visual anchor** paint path vs existing Phase4 one-shot vs etalon — Client picks which pipeline is closest to etalon (Armenian LANGUAGE themes, 9 new PNG).

## Locks (HARD)

| Lock | Value |
|------|-------|
| `ticket_limit` | **≤3** — exact pack below |
| `upgrade_only` | `true` — prompts + draw path only; no Create rewrite |
| `no_pipeline_break` | `true` — Create stays **Scriptwriter → Designer → Draft** |
| `shell_freeze` | `true` — AppShell / Create **chrome** / Settings UI / nav = **0** edits |
| `draw_path` | **IN SCOPE** — sequential cover→ref image path |
| `validation_budget_png` | **9** new (3 carousels × 3 slides) — **only** `anchor_ref_pipeline` arm |
| `no social publish` | `true` |
| `secrets_in_md` | **forbidden** |
| modules | `carousel-engine` only |
| Frontend / Motion | **omit** |
| Client gate | **S54** — unlabeled dump / no side-by-side pick = **FAIL** |

## Compare set (arms)

| Label | Source | Budget |
|-------|--------|--------|
| `etalon` | Existing `generatedMedia/эталон карусели/` — copy/symlink into bakeoff tree | **0** new PNG |
| `e2e_diffusion` | Phase4 existing `generatedMedia/wave-e2e-image-carousel/` — copy/symlink; **do not reburn** | **0** new PNG |
| `anchor_ref_pipeline` | **NEW** this wave — cover first → slides 2–N match cover | **9** PNG |
| `html_overlay` | Optional legacy label if prior HTML artifacts exist | **0** (label only; not ship target) |

## Output folder naming (HARD — Architect supersedes trainer default)

Trainer card / skills still mention `generatedMedia/compare-carousel-bakeoff/…`.  
**This wave User HARD wins** — all Client-facing compare artifacts use:

```text
generatedMedia/карусель тест/bakeoff-20261017/
  README.md                              # index: arms · themes · budget · how Client compares
  pipeline=etalon/{theme-slug}/slide_01.png …   # symlink/copy from эталон
  pipeline=e2e_diffusion/{theme-slug}/…          # symlink/copy from wave-e2e-image-carousel
  pipeline=anchor_ref_pipeline/{theme-slug}/slide_01.png
  pipeline=anchor_ref_pipeline/{theme-slug}/slide_02.png
  pipeline=anchor_ref_pipeline/{theme-slug}/slide_03.png
  # optional: pipeline=html_overlay/{theme-slug}/…
```

| Rule | Detail |
|------|--------|
| Date slug | `bakeoff-20261017` (wave calendar day) |
| Pipeline segment | literal `pipeline={label}` — **required** in path |
| Slides | `slide_01.png` … `slide_03.png` (zero-padded) |
| Forbidden | anonymous `deliverables/a` without `pipeline=`; mixing arms in one unlabeled folder |
| Twin pointer | README may note skills' `compare-carousel-bakeoff` as alias — **do not** write Client verdict to unlabeled twin only |

### MD traces

`docs/карусель тест/` — Scriptwriter + Designer sessions per theme (extend numbering after existing `1x-e2e-*`):

- `14/15/16-s54-scriptwriter-{theme}.md`
- `17/18/19-s54-designer-{theme}.md`  

Designer MD must record: `Paint path: anchor_ref_pipeline`, cover-first order, whether Polza **ref image** or **MASTER STYLE** fallback was used, **exact** per-slide image prompts (typography baked), `html_overlay: none`.

## Evidence baseline (Architect read)

| Finding | Source | Ticket |
|---------|--------|--------|
| Skills/rules Phase5 + S54 ready (Trainer A) | grade + `carousel-json-contract` § Phase5 · notes ANCHOR REF | align code |
| `generateAggregatorImage` = **prompt-only** `POST /images/generations` — **no** `image` / edits param today | `lib/llm/aggregator-images.ts` | **C-s54-anchor-draw** |
| Phase4 E2E arm artifacts exist | `generatedMedia/wave-e2e-image-carousel/` | **C-s54-bakeoff-pack** reuse |
| Etalon craft folders exist | `generatedMedia/эталон карусели/` | index symlink |
| Trace templates + prior e2e MDs | `docs/карусель тест/` | bakeoff pack numbering |

## Ticket map (≤3)

| Order | ID | Priority | Owner | Goal |
|-------|-----|----------|-------|------|
| 1 | **C-s54-anchor-prompts** | P0 | AI Bridge | Inject ANCHOR REF + LANGUAGE Scriptwriter topic lock; MASTER STYLE kit wording for sequential prompts |
| 2 | **C-s54-anchor-draw** | P0 | Backend (+ AI Bridge helper OK) | Cover-first draw; Polza edits/ref **if supported**, else locked MASTER STYLE + restated style kit; write under HARD `pipeline=` paths |
| 3 | **C-s54-bakeoff-pack** | P0 | AI Bridge | Live 3× Scriptwriter (LANGUAGE) → 9 PNG anchor_ref; symlink etalon + e2e; root README; MD traces |

## Decisions (Architect locks for executors)

### D-s54-1 — Path canon (User HARD)

| Item | Lock |
|------|------|
| Root | `generatedMedia/карусель тест/bakeoff-20261017/` |
| Arm folder | `pipeline={etalon\|e2e_diffusion\|anchor_ref_pipeline\|html_overlay}/` |
| Theme | kebab-slug, Armenian **LANGUAGE** topic (see D-s54-5) |
| Files | `slide_01.png` … `slide_03.png` |
| Index | `README.md` at bakeoff root — table of arms + themes + «Client: pick closest to etalon» |

Skills that still say `compare-carousel-bakeoff` are **not wrong historically** — executors **must** use this HARD tree for S54 deliverables. Optional: one-line pointer in etalon README / bakeoff README only (no product UI).

### D-s54-2 — Anchor-ref draw algorithm

```text
for each theme:
  1. Scriptwriter → Dramaturgy JSON (3 slides: cover / body / cta)
  2. Build MASTER STYLE kit from cover intent + brandbook approx colors
     (palette, light, materials, type treatment, camera grammar) — lock string
  3. Draw slide_01 (cover) = full E2E diffusion (scene + type + CTA on PNG)
  4. Persist cover bytes + extract style kit from prompt/result metadata
  5. For slide_02, slide_03:
       Prefer: Polza /images/edits OR generations with reference image param
               (cover PNG as visual anchor) + beat/copy-only delta prompt
       Else:   same /images/generations prompt-only path with:
               - locked MASTER STYLE block (verbatim restated)
               - explicit «match slide 1 world; only beat/copy/CTA change»
               - NO new art direction
  6. Write pipeline=anchor_ref_pipeline/{theme}/slide_0N.png
```

Still **Phase4 paint quality**: integrated typography on PNG; HTML overlay **not** primary (`html_overlay: none`).

### D-s54-3 — Polza reference capability (Backend probe)

| Priority | Approach |
|----------|----------|
| **A (prefer)** | Probe aggregator for `images/edits` and/or `image` / `image_url` / multi-ref on generations. If 2xx + usable URL → use for slides 2–N. Document endpoint + payload shape in `decisions.md` (no secrets). |
| **B (fallback)** | Keep prompt-only `generateAggregatorImage`; extend API only if needed with optional `referenceImageUrl` that is **ignored** when unsupported — continuity via **MASTER STYLE** + sequential prompts. |
| **Forbidden** | Claiming `anchor_ref` success when slides 2–N are independent one-shots with new art direction; HTML text overlay as continuity hack. |

New helper OK: `generateAggregatorImageEdit` or optional fields on existing helper — **upgrade_only**, keep `DEFAULT_CAROUSEL_IMAGE_MODEL = openai/gpt-5.4-image-2`.

### D-s54-4 — Env / mode

| Key | Value |
|-----|--------|
| `CAROUSEL_E2E_TEXT_IN_IMAGE` | `1` (Phase4 still ON) |
| `CAROUSEL_DRAW_MODE` / flag | `anchor_ref` for bakeoff script only (or script-local mode) — **must not** break default Create one-shot unless product opts in later |
| `CAROUSEL_PROMPT_TRACE` | `1` during bakeoff |
| `CAROUSEL_DRAW_SKIP_BG` | `0` |
| HTML-first | **OFF** for this wave |

Default Create product path may remain Phase4 one-shot; bakeoff script **forces** sequential anchor_ref for the NEW arm only.

### D-s54-5 — Themes (Armenian LANGUAGE — three distinct)

| Slug | Scriptwriter brief intent (LANGUAGE, not coffee) |
|------|--------------------------------------------------|
| `hy-alphabet-hook` | Armenian alphabet / letter shapes — curiosity gap cover |
| `hy-east-west-spell` | Eastern vs Western Armenian spelling / loanwords tension |
| `hy-diaspora-school` | Diaspora Saturday school / heritage language ritual |

Exact RU/HY user-message text owned by AI Bridge in ticket 1/3 — must be **language** topics, rotate, no coffee/jazz product lock.

Draft overwrite ids (no spam): `draft-s54-a` / `draft-s54-b` / `draft-s54-c`.

### D-s54-6 — MASTER STYLE block (prompt contract)

When Polza has no image ref, every slide 2–N prompt **must** open with a frozen block extracted after cover:

```text
MASTER STYLE (LOCKED from cover — do not reinvent):
- palette: …
- lighting: …
- materials / texture: …
- typography treatment: …
- camera / composition grammar: …
MATCH cover visual world. Only change: this slide's beat, headline, body, CTA intent.
```

Cover prompt builds the kit; body/CTA prompts **restate verbatim** + delta copy.

### D-s54-7 — e2e_diffusion + etalon packaging

| Arm | Action |
|-----|--------|
| etalon | Symlink or copy 3 craft sets (or representative 3×3) under `pipeline=etalon/…` — README maps A/B/C folders → theme labels for Client |
| e2e_diffusion | Copy/symlink existing Phase4 PNG (hy-letters / hy-sevan / …) under `pipeline=e2e_diffusion/{theme}/` — **0** new image API calls |
| Mismatch themes | OK if e2e themes ≠ LANGUAGE set — README must say «e2e = prior Phase4 topics; anchor_ref = LANGUAGE; Client compares craft continuity vs etalon» |

### D-s54-8 — What stays / what dies

| Keep | Kill / forbid this wave |
|------|-------------------------|
| Scriptwriter → Designer → Draft | Create chrome edits |
| Phase4 type-on-PNG | HTML overlay as ship / as continuity |
| Budget 9 new + stop-report | Reburning e2e/etalon to fill labels |
| Labeled `pipeline=` folders | Anonymous dumps |
| Client S54 pick | API-only «PASS» |

## Path locks (no overlap)

1. **C-s54-anchor-prompts** first — owns `create-carousel-prompts.ts` + Designer/Scriptwriter overlay strings for ANCHOR REF + LANGUAGE topic guidance (+ notes sync if drift).  
2. **C-s54-anchor-draw** second — owns `aggregator-images.ts` (+ optional edits helper) and sequential branch in `carousel-html-renderer.ts` / bakeoff draw runner.  
3. **C-s54-bakeoff-pack** last — owns live script, PNG write to HARD tree, README index, `docs/карусель тест/` MDs, draft upsert; **calls** draw API, does not reimplement prompt invert or Polza client.  
4. **Do not** parallel writers on `aggregator-images.ts` or `carousel-html-renderer.ts`.  
5. Shell / Create chrome / mesh / Settings UI / Frontend / Motion / Prisma / Apify: **0**.

## Acceptance (Client language · S54)

1. Folder tree under `generatedMedia/карусель тест/bakeoff-20261017/` shows `pipeline=` labels for etalon, e2e_diffusion, anchor_ref_pipeline.  
2. `anchor_ref_pipeline` has **3 themes × 3 slides**; cover→2–N share visual world (S54.C).  
3. Traces in `docs/карусель тест/` show Scriptwriter LANGUAGE JSON + Designer exact prompts + paint path label.  
4. ≤**9** new PNG; etalon/e2e reused.  
5. Client verdict sentence: **which pipeline label is closest to etalon** (not API logs).

## Out of scope

- AppShell / Create modal redesign  
- Razbor / Marketing / reels Remotion  
- Raising budget above 9 for this wave  
- Social publish / VPS  
- Zod schema rewrite / new Create agent  
- Claiming HTML overlay as bake-off winner ship path  

## Skills for executors

`carousel-json-contract` § Phase5 · `create-carousel-prompts-notes` § ANCHOR REF · `plugins/trainer/carousel-anchor-ref-bakeoff.md` · `prompt-engineering` § Phase5 · `ai-bridge` · `content-pipeline-agents` · `carousel-prompt-trace` · `backend` · `tester` · Client **S54**

## Next

Orchestrator → **AI Bridge** on **C-s54-anchor-prompts**.
