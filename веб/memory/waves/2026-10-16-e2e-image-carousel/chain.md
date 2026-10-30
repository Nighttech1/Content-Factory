# Chain — 2026-10-16-e2e-image-carousel

> **ticket_limit:** default ≤3 (exact: C-e2e-prompts-kill-overlay → C-e2e-draw-integrated-text → C-e2e-live-trace)  
> **shell_freeze:** `true` (chrome only)  
> **draw_path:** **IN SCOPE**  
> **upgrade_only:** `true`  
> **no_pipeline_break:** `true` — Create **Scriptwriter → Designer → Draft**  
> **validation_budget_png:** `6`  
> **Client:** **S53 HARD**  
> **no social publish** · **secrets_in_md:** forbidden  
> Wave plan: `memory/waves/2026-10-16-e2e-image-carousel/plan.md`  
> Trainer: `memory/trainer/2026-10-16-e2e-image-carousel-grade.md` (grade **A**)  
> Plugin: `plugins/trainer/e2e-image-carousel.md`

## Strict role order

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | **Trainer** | — | grade + skills + plugin e2e-image-carousel | [x] | Grade **A**; Phase4 / S53 in skills+rules |
| 1 | **Architect** | wave | `plan.md` + this `chain.md` + `memory/tickets/C-e2e-*/architect-spec.md` | [x] | Spec locked; **no product code** |
| 2 | **AI Bridge** | **C-e2e-prompts-kill-overlay** | `lib/studio/create-carousel-prompts.ts`; `lib/mesh/agent-defaults.ts` (Designer paint lines); notes sync if code/notes drift | [ ] | Overlays say E2E bake-type; **no** «zero readable text» / HTML-first **primary**; VIRAL CRAFT / CTA / swipe intact |
| 3 | **Backend** (+ AI Bridge helper OK) | **C-e2e-draw-integrated-text** | `lib/studio/carousel-html-renderer.ts` (`isCarouselE2eTextInImage`, prompt builder invert, `runCreateCarouselDraw`); optional tiny download helper under `lib/llm/` if needed | [ ] | E2E default ON: N× `generateAggregatorImage` full slide → PNG; HTML overlay **not** primary; `renderMode` e2e; legacy behind env only |
| 4 | **AI Bridge** | **C-e2e-live-trace** | `scripts/trace-carousel-session.ts` (or thin live-e2e sibling); `docs/карусель тест/*`; PNG → `generatedMedia/wave-e2e-image-carousel/`; draft overwrite `draft-e2e-a` / `draft-e2e-b` | [ ] | 2× Scriptwriter MD + 2× Designer MD (`html_overlay: none`, exact prompts **with** type); **≤6 PNG**; Armenian topics |
| 5 | **Tester** | all three | `guards.md` per ticket; assert env default; grep no NO-letters in E2E path; prompt includes copy; PNG≤6; no shell churn | [ ] | Guards green |
| 6 | **Fixer** | failing only | same paths as failing ticket — surgical | [ ] | Same-command rerun green |
| 7 | **Deployer** | localhost | set/document `CAROUSEL_E2E_TEXT_IN_IMAGE=1`; refresh local API; no VPS | [ ] | Live localhost ready for Client |
| 8 | **Client** | accept | Playwright Create @1440 + read traces (**S53.A–B**) | [ ] | Verdict; HTML-overlay-primary = НЕ ПРИНЯТО |

## Path locks (no overlap writers)

1. **Prompts → Draw → Live** sequential (tickets 1→2→3).  
2. **create-carousel-prompts.ts / agent-defaults** only in ticket 1.  
3. **carousel-html-renderer.ts** only in ticket 2.  
4. **Live script + docs/карусель тест + wave PNG dir** only in ticket 3 (may call draw API; no reimplementation).  
5. **Shell / Create chrome / mesh / Settings UI / AppShell / SidebarNavigation:** **0** edits.  
6. **Frontend / Motion / WebGL / Apify / Prisma migrations:** out of chain.  
7. **Do not** parallel AI Bridge ticket 1 with Backend ticket 2 on shared prompt strings without order (ticket 1 lands first).

## Env / script locks

| Key | Value |
|-----|--------|
| `CAROUSEL_E2E_TEXT_IN_IMAGE` | **default ON** (`!== "0"`) — Phase4 primary |
| `CAROUSEL_HTML_FIRST` | Ignored for text compositing when E2E ON; legacy only if E2E=`0` |
| `CAROUSEL_DRAW_SKIP_BG` | `0` under E2E (must call image API) |
| `CAROUSEL_PROMPT_TRACE` | `1` during live/trace |
| `CAROUSEL_E2E_FALLBACK_HTML` | optional emergency only — **not** S53 PASS |
| Artifact dir | `generatedMedia/wave-e2e-image-carousel/` |
| Draft ids | `draft-e2e-a`, `draft-e2e-b` (overwrite only) |
| PNG hard cap | **6** — overspend → stop-report |

## Topic lock (Armenian, user-like)

| Id | Draft | Topic rule |
|----|-------|------------|
| A | `draft-e2e-a` | Armenian cultural / language / heritage — **not** coffee product |
| B | `draft-e2e-b` | Second distinct Armenian brief — **not** coffee/jazz default |

## Out of chain

Frontend · Motion · Razbor/Marketing UI · Apify · Scout · Settings Design UI · VPS/prod · social publish · zod schema rewrite.

## Next executor

**AI Bridge** on **C-e2e-prompts-kill-overlay**  
(`memory/tickets/C-e2e-prompts-kill-overlay/architect-spec.md`).
