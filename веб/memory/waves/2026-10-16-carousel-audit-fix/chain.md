# Chain — 2026-10-16-carousel-audit-fix

> **ticket_limit:** default ≤3 (exact pack: C-audit-01 → 02 → 03)  
> **shell_freeze:** `true`  
> **upgrade_only:** `true`  
> **no_pipeline_break:** `true` — Create **Scriptwriter → Designer → Draft**  
> **validation_budget_png:** `6`  
> **no social publish**  
> Wave plan: `memory/waves/2026-10-16-carousel-audit-fix/plan.md`  
> Trainer: `memory/trainer/2026-10-16-carousel-audit-fix-grade.md` (grade **B**)  
> Audit: `docs/PROMPT_AUDIT_CAROUSEL_FULL.md`

## Strict role order

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | **Trainer** | — | grade + skill gaps | [x] | Grade **B** |
| 1 | **Architect** | wave | `plan.md` + this `chain.md` + `memory/tickets/C-audit-0{1,2,3}-*/architect-spec.md` | [x] | Spec locked; **no product code** |
| 2 | **AI Bridge** | **C-audit-01** | `types/mesh-agent.ts`, `lib/mesh/agent-defaults.ts` (carousel modelConfig only), `lib/settings/llm-models.ts`, `lib/llm/aggregator-images.ts` (DEFAULT sync), `lib/llm/aggregator-chat.ts` (thinking pass), notes in skills if needed | [ ] | Defaults: Scriptwriter=`anthropic/claude-3.7-sonnet`+thinking; Designer image=`openai/gpt-5.4-image-2`; Designer textModel=Sonnet; catalog entries |
| 3 | **Backend** | **C-audit-01** | `app/api/studio/agent-chat/route.ts` (+ shared classify helper if extracted under `lib/llm/`) | [ ] | describe/chat/handoff **never** send image-class id to chat; no mini fallback for Designer describe; draw still image-2 |
| 4 | **AI Bridge** | **C-audit-02** | `lib/studio/agent-start-bundle.ts`, `lib/studio/create-carousel-prompts.ts`, `lib/studio/prompt-packs/sprint9-carousel-pack.ts`, `lib/mesh/agent-defaults.ts` (**COMBAT + carousel prompts only**), fixture JSON embed from `memory/fixtures/sprint9/carousel/**` | [ ] | Dedupe + paired invariants; COMBAT CTA=1–4; full JSON few-shots; designer overlay Phase3 wording |
| 5 | **AI Bridge** + **Backend** | **C-audit-03** | `lib/studio/carousel-html-renderer.ts` (`runCreateCarouselDraw`), HTML builder paths it calls, designer draw prompts in create-carousel-prompts / pack; optional tiny route wiring if draw payload shape changes | [ ] | HTML/CSS-first primary; image-2 optional bg only; prompts match runtime; zod keys stable |
| 6 | **Tester** | all three | guards under each ticket; smoke 2×3 PNG; assert model ids + CTA sync + Create shape | [x] | Static smokes PASS; guards written; **LIVE 6-PNG deferred to Deployer** — see `tester-report.md` |
| 7 | **Fixer** | failing only | same paths as failing ticket — surgical | [ ] | Same-command rerun green |
| 8 | **Deployer** | localhost | update local API if present; no VPS | [ ] | Live localhost for Client |
| 9 | **Client** | accept | Playwright Create **S41+** @1440 (Scriptwriter→Designer→Draft); visible drafts | [ ] | Verdict with screenshots; P0/P1 clear or tickets reopened |

## Path locks (no overlap writers)

1. **C-audit-01 AI Bridge → Backend sequential** on model defaults, then `agent-chat/route.ts` (Backend owns route; AI Bridge may add `lib/llm` helper first).  
2. **C-audit-02 after 01** — same `agent-defaults.ts` file: do **not** parallel 01+02 writers.  
3. **C-audit-03 after 02** — designer overlay/prompt wording from 02 must match HTML-first runtime before Client.  
4. **Shell / Create chrome / mesh graph / Settings UI:** **0** edits.  
5. **Frontend:** omit unless Tester finds preview-black / wire regression (then Frontend-minimal only, Architect amends chain).  
6. **Motion / WebGL / social publish:** out.

## Sonnet slug lock (Architect → implementers)

| Constant | Value |
|----------|-------|
| `DEFAULT_SCRIPTWRITER_MODEL` | **`anthropic/claude-3.7-sonnet`** |
| `DEFAULT_DESIGNER_TEXT_MODEL` (new) | **`anthropic/claude-3.7-sonnet`** |
| `DEFAULT_CAROUSEL_IMAGE_MODEL` | **`openai/gpt-5.4-image-2`** (unchanged) |
| Fallback if Polza 404 on 3.7 | Document in `C-audit-01/decisions.md` → try **`anthropic/claude-sonnet-4`**; **never** revert Scriptwriter default to Haiku without new ticket |

## Out of chain

Frontend (default) · Motion · Razbor/Marketing model changes · Apify · Prisma · VPS/prod.

## Next executor

**AI Bridge** on **C-audit-01** (`memory/tickets/C-audit-01-models/architect-spec.md`).
