# Architect spec — C-e2e-prompts-kill-overlay (P0)

> Wave: `memory/waves/2026-10-16-e2e-image-carousel/`  
> Chain: wave `chain.md` step 2 · ticket `chain.md`  
> Depends on: Trainer Phase4 skills (done)  
> Unlocks: **C-e2e-draw-integrated-text** (runtime must match these words)

## Goal

Align Create/Designer **prompt overlays and agent-defaults** with Phase4 E2E diffusion: bake typography into image prompts; **remove** «zero readable text» / HTML-first **as primary** product language — without breaking Scriptwriter VIRAL CRAFT, CTA 1–4, or swipe meta.

## Decision locks

| ID | Lock |
|----|------|
| **D-p-1** | Patch `CREATE_CAROUSEL_*` Designer / paint overlays in `lib/studio/create-carousel-prompts.ts` to **E2E DIFFUSION** (see `create-carousel-prompts-notes.md` § E2E DIFFUSION). |
| **D-p-2** | Remove or demote wording: «HTML/CSS-first», «optional image-2 bg only», «no text in diffusion», «leave empty space for HTML overlays» as **primary**. Legacy may be mentioned only as Architect/env fallback. |
| **D-p-3** | Patch `lib/mesh/agent-defaults.ts` Designer seed lines to match (Primary paint = image-2 full slide with type). |
| **D-p-4** | **Do not** strip VIRAL CRAFT, CTA catalog, swipe_trigger meta, paired invariants, or Scriptwriter schema hints. |
| **D-p-5** | Zod / Dramaturgy keys **stable**. No new agent. |
| **D-p-6** | `shell_freeze` — no Create chrome / Settings UI. |
| **D-p-7** | Notes file sync only if code↔notes drift; skills already Phase4 — do not rewrite Trainer skills in this ticket. |

## Exact files AI Bridge may edit

| Path | Action |
|------|--------|
| `lib/studio/create-carousel-prompts.ts` | Invert Designer / draw paint strings → bake type |
| `lib/mesh/agent-defaults.ts` | Designer primary-paint / skill lines → Phase4 |
| `.cursor/skills/ai-bridge/create-carousel-prompts-notes.md` | Optional one-line sync if needed |
| `memory/tickets/C-e2e-prompts-kill-overlay/decisions.md` | 21st N/A; list string changes |

## MUST NOT

- Edit `carousel-html-renderer.ts` (owned by **C-e2e-draw-integrated-text**)  
- Run live 6-PNG burn (owned by **C-e2e-live-trace**)  
- Touch AppShell / Create modal UI  
- Change Scriptwriter viral block structure beyond ensuring it still ships  
- Social publish / raise PNG budget  

## Acceptance

- [ ] Grep product overlays: no primary claim of HTML-first success or «ABSOLUTELY NO readable text» as Designer draw instruction  
- [ ] Overlay explicitly: image-2 paints headline/body/CTA **in pixels**; inputs = scenario + approx colors  
- [ ] VIRAL CRAFT / CTA 1–4 / swipe meta still present for Scriptwriter  
- [ ] Create pipeline shape unchanged  

## Guards (Tester)

- String asserts on overlay constants  
- No shell path churn  
- Guard file: `memory/tickets/C-e2e-prompts-kill-overlay/guards.md`

## Skills

`ai-bridge` · `create-carousel-prompts-notes` · `prompt-engineering` § Phase4 · `carousel-json-contract` § Phase4 · `content-pipeline-agents`
