# Chain — 2026-10-17-anchor-ref-bakeoff

> **ticket_limit:** default ≤3 (exact: C-s54-anchor-prompts → C-s54-anchor-draw → C-s54-bakeoff-pack)  
> **shell_freeze:** `true` (chrome only)  
> **draw_path:** **IN SCOPE**  
> **upgrade_only:** `true`  
> **no_pipeline_break:** `true` — Create **Scriptwriter → Designer → Draft**  
> **validation_budget_png:** `9` new (`anchor_ref_pipeline` only)  
> **Client:** **S54 HARD**  
> **no social publish** · **secrets_in_md:** forbidden  
> Wave plan: `memory/waves/2026-10-17-anchor-ref-bakeoff/plan.md`  
> Trainer: `memory/trainer/2026-10-17-anchor-ref-bakeoff-grade.md` (grade **A**)  
> Plugin: `plugins/trainer/carousel-anchor-ref-bakeoff.md`  
> **HARD out root:** `generatedMedia/карусель тест/bakeoff-20261017/pipeline={label}/{theme}/slide_0N.png`

## Strict role order

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | **Trainer** | — | grade + Phase5 / S54 skills + plugin | [x] | Grade **A** |
| 1 | **Architect** | wave | `plan.md` + this `chain.md` + `memory/tickets/C-s54-*/architect-spec.md` | [x] | Spec locked; **no product code** |
| 2 | **AI Bridge** | **C-s54-anchor-prompts** | `lib/studio/create-carousel-prompts.ts`; `lib/mesh/agent-defaults.ts` (Designer paint lines); notes sync if drift | [ ] | ANCHOR REF inject; LANGUAGE topic guidance; MASTER STYLE wording; E2E type-on-PNG intact |
| 3 | **Backend** (+ AI Bridge helper OK) | **C-s54-anchor-draw** | `lib/llm/aggregator-images.ts` (probe edits/ref); sequential cover→2–N in draw runner (`carousel-html-renderer.ts` and/or bakeoff script helper); write HARD `pipeline=` paths | [ ] | Prefer Polza ref/edits; else MASTER STYLE sequential; continuity documented |
| 4 | **AI Bridge** | **C-s54-bakeoff-pack** | live bakeoff script; `docs/карусель тест/*-s54-*`; PNG → HARD tree; README index; symlink etalon + e2e; drafts `draft-s54-a/b/c` | [ ] | 3× LANGUAGE Scriptwriter MD + 3× Designer MD; **≤9 new PNG**; labeled folders ready |
| 5 | **Tester** | all three | `guards.md` per ticket; naming `pipeline=`; ≤9 new; cover continuity; no HTML-primary; no shell churn | [ ] | Guards green |
| 6 | **Fixer** | failing only | same paths as failing ticket — surgical | [ ] | Same-command rerun green |
| 7 | **Deployer** | localhost | refresh local API; bakeoff folder + README ready; no VPS | [ ] | Live localhost + artifacts for Client |
| 8 | **Client** | accept | S54.A–C side-by-side folder compare (Playwright optional for Create smoke; **folder PNG compare required**) | [ ] | Verdict: which **pipeline label** closest to etalon |

## Path locks (no overlap writers)

1. **Prompts → Draw → Pack** sequential (tickets 1→2→3).  
2. **create-carousel-prompts.ts / agent-defaults** only in ticket 1.  
3. **aggregator-images.ts + sequential draw branch** only in ticket 2.  
4. **Live script + docs/карусель тест + bakeoff PNG tree + README** only in ticket 3 (may call draw API; no reimplementation of Polza client).  
5. **Shell / Create chrome / mesh / Settings UI / AppShell / SidebarNavigation:** **0** edits.  
6. **Frontend / Motion / WebGL / Apify / Prisma migrations:** out of chain.  
7. **Do not** reburn `e2e_diffusion` or etalon into the 9-PNG budget — copy/symlink only.

## Env / artifact locks

| Key | Value |
|-----|--------|
| `CAROUSEL_E2E_TEXT_IN_IMAGE` | `1` |
| `CAROUSEL_PROMPT_TRACE` | `1` during pack |
| `CAROUSEL_DRAW_SKIP_BG` | `0` |
| Bakeoff root | `generatedMedia/карусель тест/bakeoff-20261017/` |
| Arm segment | `pipeline={label}/` |
| Draft ids | `draft-s54-a`, `draft-s54-b`, `draft-s54-c` (overwrite only) |
| PNG hard cap | **9** new — overspend → stop-report |
| Reuse | `generatedMedia/эталон карусели/` · `generatedMedia/wave-e2e-image-carousel/` |

## Theme lock (Armenian LANGUAGE)

| Id | Draft | Slug |
|----|-------|------|
| A | `draft-s54-a` | `hy-alphabet-hook` |
| B | `draft-s54-b` | `hy-east-west-spell` |
| C | `draft-s54-c` | `hy-diaspora-school` |

## Out of chain

Frontend · Motion · Razbor/Marketing UI · Apify · Scout · Settings Design UI · VPS/prod · social publish · zod schema rewrite.

## Next executor

**AI Bridge** on **C-s54-anchor-prompts**  
(`memory/tickets/C-s54-anchor-prompts/architect-spec.md`).
