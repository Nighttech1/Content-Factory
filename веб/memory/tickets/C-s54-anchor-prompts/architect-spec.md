# Architect spec — C-s54-anchor-prompts (P0)

> Wave: `memory/waves/2026-10-17-anchor-ref-bakeoff/`  
> Chain: wave `chain.md` step 2 · ticket `chain.md`  
> Depends on: Trainer Phase5 skills (done)  
> Unlocks: **C-s54-anchor-draw**

## Goal

Wire Create/Designer **prompt overlays** for Phase5 bake-off arm: cover-first **ANCHOR REF**, MASTER STYLE kit for sequential slides, Armenian **LANGUAGE** Scriptwriter topic guidance — without breaking E2E type-on-PNG, VIRAL CRAFT, CTA 1–4, or swipe meta.

## Decision locks

| ID | Lock |
|----|------|
| **D-ap-1** | Inject **ANCHOR REF** block from `create-carousel-prompts-notes.md` § Phase5 into Designer / draw overlays in `lib/studio/create-carousel-prompts.ts` (mode or labeled section when bakeoff / `anchor_ref` selected). |
| **D-ap-2** | Add **MASTER STYLE (LOCKED)** instruction for slides 2–N: restate cover palette/light/materials/type/camera; only beat/copy/CTA change. |
| **D-ap-3** | Scriptwriter overlay / bakeoff brief helpers: themes = Armenian **LANGUAGE** (alphabet / East–West / diaspora school) — forbid coffee/jazz product default for S54 pack. |
| **D-ap-4** | Keep **E2E DIFFUSION** (type ON PNG); forbid HTML-overlay-primary language. |
| **D-ap-5** | Export path wording in prompts/notes for this wave: `generatedMedia/карусель тест/bakeoff-20261017/pipeline=anchor_ref_pipeline/{theme}/slide_0N.png` (User HARD — supersedes compare-carousel-bakeoff in product strings for S54). |
| **D-ap-6** | Zod / Dramaturgy keys **stable**. No new agent. |
| **D-ap-7** | `shell_freeze` — no Create chrome / Settings UI. |
| **D-ap-8** | Patch `lib/mesh/agent-defaults.ts` Designer lines only if needed to mention reference-first / cover-anchor (no model id churn). |

## Exact files AI Bridge may edit

| Path | Action |
|------|--------|
| `lib/studio/create-carousel-prompts.ts` | ANCHOR REF + MASTER STYLE + LANGUAGE topic guidance |
| `lib/mesh/agent-defaults.ts` | Designer paint lines if drift |
| `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` | Optional one-line HARD path sync |
| `memory/tickets/C-s54-anchor-prompts/decisions.md` | List string changes |

## MUST NOT

- Edit `aggregator-images.ts` / `carousel-html-renderer.ts` (owned by **C-s54-anchor-draw**)  
- Run live 9-PNG burn (owned by **C-s54-bakeoff-pack**)  
- Touch AppShell / Create modal UI  
- Social publish / raise PNG budget  

## Acceptance

- [ ] Overlay contains cover-first + reference/MASTER STYLE continuity language  
- [ ] LANGUAGE theme guidance present for S54 briefs  
- [ ] E2E bake-type + VIRAL CRAFT / CTA / swipe intact  
- [ ] HARD bakeoff path with `pipeline=` mentioned where export paths are documented in overlays/notes  

## Guards (Tester)

- String asserts on ANCHOR REF / MASTER STYLE / LANGUAGE  
- No shell path churn  
- Guard file: `memory/tickets/C-s54-anchor-prompts/guards.md`

## Skills

`ai-bridge` · `create-carousel-prompts-notes` § ANCHOR REF · `prompt-engineering` § Phase5 · `carousel-json-contract` § Phase5 · `content-pipeline-agents`
