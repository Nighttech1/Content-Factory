# Chain — 2026-10-16-carousel-prompt-trace

> **ticket_limit:** default ≤3 (exact pack: C-trace-scriptwriter-viral → C-trace-designer-image → C-trace-docs-md)  
> **shell_freeze:** `true`  
> **upgrade_only:** `true`  
> **no_pipeline_break:** `true` — Create **Scriptwriter → Designer → Draft**  
> **validation_budget_png:** `6`  
> **no social publish**  
> **secrets_in_md:** forbidden  
> Wave plan: `memory/waves/2026-10-16-carousel-prompt-trace/plan.md`  
> Trainer: `memory/trainer/2026-10-16-carousel-prompt-trace-grade.md` (grade **B**)  
> Skill: `.cursor/skills/carousel-prompt-trace/SKILL.md`  
> Docs: `docs/карусель тест/`

## Strict role order

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | **Trainer** | — | grade + skill + templates | [x] | Grade **B**; skill `carousel-prompt-trace`; `docs/карусель тест/_templates/` |
| 1 | **Architect** | wave | `plan.md` + this `chain.md` + `memory/tickets/C-trace-*/architect-spec.md` | [x] | Spec locked; **no product code** |
| 2 | **AI Bridge** | **C-trace-scriptwriter-viral** | `lib/studio/create-carousel-prompts.ts` (VIRAL CRAFT inject); notes sync if needed; **new** `scripts/trace-carousel-session.ts` (Scriptwriter live + Step1 MD write); may touch `lib/studio/agent-start-bundle.ts` **read-only** / import only | [ ] | Overlay contains VIRAL CRAFT once; 2× Step1 MD with full system/user/reply/final JSON; topics ≠ coffee default |
| 3 | **AI Bridge** (+ **Backend** optional) | **C-trace-designer-image** | Same script extend; `lib/studio/carousel-html-renderer.ts` **only if** needed for `CAROUSEL_PROMPT_TRACE` prompt capture return; PNG → `generatedMedia/wave-carousel-prompt-trace/`; draft overwrite `draft-trace-a` / `draft-trace-b` via existing drafts API | [ ] | 2× Step2 MD with EXACT per-slide image prompts; **≤6 PNG**; swipe_trigger not painted |
| 4 | **AI Bridge** / docs | **C-trace-docs-md** | `docs/карусель тест/README.md` index + weak-link verdict; ensure session filenames match templates | [ ] | README table filled; verdict written; no missing mandatory sections |
| 5 | **Backend** | only if step 3 blocked | Tiny draw return / drafts upsert wire — **skip** if script already works | [ ] | or marked N/A in ticket `decisions.md` |
| 6 | **Tester** | all three | guards under each ticket; assert VIRAL CRAFT string in overlay; MD section completeness; PNG ≤6; Create shape intact (no shell file churn) | [ ] | `guards.md` green; static + script smoke |
| 7 | **Fixer** | failing only | same paths as failing ticket — surgical | [ ] | Same-command rerun green |
| 8 | **Deployer** | localhost | update local API if present; ensure script runnable; no VPS | [ ] | Live localhost + MD artifacts for Client |
| 9 | **Client** | accept | Read MD traces + Playwright Create @1440 (shape); weak-link judgment | [ ] | Verdict; P0/P1 clear or reopen |

## Path locks (no overlap writers)

1. **C-trace-scriptwriter-viral → C-trace-designer-image sequential** on `scripts/trace-carousel-session.ts` (one writer at a time).  
2. **create-carousel-prompts.ts** only in ticket 1 (VIRAL CRAFT); ticket 2 may read Designer overlays — **no** rewrite of Scriptwriter overlay in ticket 2.  
3. **carousel-html-renderer.ts** only in ticket 2, and only for prompt-capture / return shape — **no** HTML kit redesign.  
4. **Shell / Create chrome / mesh / Settings / AppShell / SidebarNavigation:** **0** edits.  
5. **Frontend / Motion / WebGL / Apify / Prisma:** out of chain.  
6. **Do not** parallel AI Bridge on ticket 1 + 2.

## Env / script locks

| Key | Value |
|-----|--------|
| `CAROUSEL_PROMPT_TRACE` | `1` during script run |
| `CAROUSEL_HTML_FIRST` | `1` (default on) |
| `CAROUSEL_DRAW_SKIP_BG` | `0` (want real image prompts when bg warranted) |
| `WAVE_VISUAL_ARTIFACT_DIR` / script default | `generatedMedia/wave-carousel-prompt-trace/` |
| Draft ids | `draft-trace-a`, `draft-trace-b` (overwrite only) |
| PNG hard cap | **6** — overspend → stop-report |

## Topic lock (Armenian, user-like)

| Id | Draft | Topic rule |
|----|-------|------------|
| A | `draft-trace-a` | Armenian cultural / language — **not** coffee product |
| B | `draft-trace-b` | Second distinct Armenian user-like brief — **not** coffee/jazz default |

## Out of chain

Frontend · Motion · Razbor/Marketing model changes · Apify · Scout · Settings Design UI · VPS/prod · social publish.

## Next executor

**AI Bridge** on **C-trace-scriptwriter-viral**  
(`memory/tickets/C-trace-scriptwriter-viral/architect-spec.md`).
