# Architect spec — C-trace-scriptwriter-viral (P0)

> Wave `2026-10-16-carousel-prompt-trace` · Trainer grade B  
> Skill: `carousel-prompt-trace` · notes: `create-carousel-prompts-notes.md` § Viral craft

## Goal

Make Scriptwriter emit **viral** Dramaturgy JSON (not schema-flat) and dump a **full** Step1 MD session for two Armenian user-like briefs — so Designer handoff is strong and Client can see every prompt.

## Decision locks

| ID | Lock |
|----|------|
| **D-sw-1** | Inject **VIRAL CRAFT (HARD)** block from `create-carousel-prompts-notes.md` into `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` in `lib/studio/create-carousel-prompts.ts`. |
| **D-sw-2** | **Dedupe:** do **not** paste the full VIRAL CRAFT block into `CREATE_CAROUSEL_PAIRED_INVARIANTS` (already has hook/TOPIC/CTA). Overlay = craft density; paired = schema/meta invariants. |
| **D-sw-3** | New diagnostic script `scripts/trace-carousel-session.ts`: live Scriptwriter call using **product** agent-start assembly (`assembleAgentStartSystemPrompt` / same overlays as Create). |
| **D-sw-4** | C-155: `role=user` = **raw brief only**; system = assembled agent-start (full dump into MD). |
| **D-sw-5** | Optional **one** correction turn per topic (polish viral density / fill `visual_prompt`); log as §5 or `none`. |
| **D-sw-6** | Write `docs/карусель тест/01-scriptwriter-<slug>.md` from `_templates/01-scriptwriter-session.md` — **all** sections mandatory; **no** truncated system. |
| **D-sw-7** | Topics: Armenian user-like; **TOPIC ≠ coffee/jazz/club default**. Suggested: `hy-letters`, `hy-yerevan-evening` (or swap B if coffee-lock risk). N=3; CTA ∈ 1–4. |
| **D-sw-8** | `shell_freeze` · `upgrade_only` · `no_pipeline_break` · no secrets in MD. |

## Exact files AI Bridge may edit

| Path | Action |
|------|--------|
| `lib/studio/create-carousel-prompts.ts` | Append VIRAL CRAFT to Scriptwriter overlay |
| `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` | Mark inject done / keep in sync (optional) |
| `scripts/trace-carousel-session.ts` | **Create** — Scriptwriter live + Step1 MD (Designer half may be stub/`--skip-draw` until C-trace-designer-image) |
| `docs/карусель тест/01-scriptwriter-*.md` | **Write** live sessions (2 files) |

## MUST NOT

- Edit Create/Razbor/AppShell UI  
- Rewrite Designer overlays (→ C-trace-designer-image)  
- Change JSON schema keys / zod without Backend ticket  
- Auto-handoff Scriptwriter → Designer  
- Log API keys / Authorization  
- Soft-mock «готово» without fenced JSON  

## Smoke plan (this ticket)

| Run | Slug | Slides | Correction | MD out |
|-----|------|--------|------------|--------|
| A | `hy-letters` (or locked slug) | 3 | optional 1 | `01-scriptwriter-hy-letters.md` |
| B | second Armenian brief | 3 | optional 1 | `01-scriptwriter-<slug>.md` |

Draw/PNG **deferred** to C-trace-designer-image (script may `--skip-draw`).

## Acceptance

- [ ] `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` contains `VIRAL CRAFT (HARD)`  
- [ ] Two Step1 MD files with sections 1–6 filled; system is complete  
- [ ] Final JSON handoff checklist mostly PASS (cover gap, value beats, swipe meta, CTA 1–4, concrete `visual_prompt`, topic=user)  
- [ ] Diff does not touch shell/Create chrome  
- [ ] No secrets in MD  

## Guards (Tester)

- Grep overlay for `VIRAL CRAFT`  
- Assert MD files exist and contain `## 2. Full system` with non-trivial length  
- Assert topic text ≠ coffee-only default lock  
- Guard file: `memory/tickets/C-trace-scriptwriter-viral/guards.md`

## Skills

`carousel-prompt-trace` · `ai-bridge` · `prompt-engineering` · `carousel-json-contract` · `create-carousel-prompts-notes`
