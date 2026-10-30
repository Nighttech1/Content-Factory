# Architect spec — C-s54-anchor-draw (P0)

> Wave: `memory/waves/2026-10-17-anchor-ref-bakeoff/`  
> Chain: wave `chain.md` step 3 · ticket `chain.md`  
> Depends on: **C-s54-anchor-prompts**  
> Unlocks: **C-s54-bakeoff-pack**

## Goal

Implement **sequential** Designer draw for bake-off arm `anchor_ref_pipeline`: cover first → slides 2–N visually anchored to cover. Prefer Polza **images/edits** or reference-image param; if aggregator stays prompt-only, enforce **MASTER STYLE** restatement. Write PNG to User HARD paths.

## Decision locks

| ID | Lock |
|----|------|
| **D-ad-1** | Probe Polza for `images/edits` and/or generations `image` / `image_url` / reference fields. Record result in `decisions.md` (endpoint OK/FAIL, no secrets). |
| **D-ad-2** | If probe OK → add helper (e.g. `generateAggregatorImageEdit` or optional `referenceImageUrl` on generate) using cover PNG/bytes/URL for slides 2–N. |
| **D-ad-3** | If probe FAIL → keep `/images/generations` prompt-only; continuity = locked MASTER STYLE block + «match slide 1 world» wording from ticket 1. Still sequential (cover bytes exist before 2–N prompts are built). |
| **D-ad-4** | Algorithm per plan **D-s54-2**. Still E2E type-on-PNG; `html_overlay` not primary. |
| **D-ad-5** | Output path HARD: `generatedMedia/карусель тест/bakeoff-20261017/pipeline=anchor_ref_pipeline/{theme-slug}/slide_0N.png`. |
| **D-ad-6** | Default Create one-shot Phase4 path **must not break** — gate sequential mode behind bakeoff script / explicit `drawMode: "anchor_ref"` (or env used only by bakeoff). |
| **D-ad-7** | Model stays `openai/gpt-5.4-image-2` sync. |
| **D-ad-8** | `shell_freeze` — no UI. Budget enforcement for full 9-PNG burn belongs to pack ticket; draw helper must accept theme/slide and not spam extras. |

## Exact files Backend may edit

| Path | Action |
|------|--------|
| `lib/llm/aggregator-images.ts` | Probe + optional edits/ref API; keep generate path |
| `lib/studio/carousel-html-renderer.ts` | Sequential branch / export helper for anchor_ref (upgrade_only) |
| Bakeoff helper under `lib/studio/` or `scripts/` helpers | Optional thin `runAnchorRefCarouselDraw` if cleaner than bloating renderer |
| `.env.example` | Optional flag docs only |
| `memory/tickets/C-s54-anchor-draw/decisions.md` | Probe result + chosen path A vs B |

## MUST NOT

- Rewrite Create chrome / Frontend  
- Burn full 9 PNG + MD pack (owned by **C-s54-bakeoff-pack**) — unit/smoke ≤1 theme×3 optional for self-check, count toward budget if run  
- Claim anchor_ref if 2–N ignore cover world  
- Social publish / Prisma / Apify  

## Acceptance

- [ ] Cover drawn before slides 2–N  
- [ ] Path A (ref/edits) **or** documented Path B (MASTER STYLE) with sequential prompts  
- [ ] Can write `pipeline=anchor_ref_pipeline/{theme}/slide_0N.png`  
- [ ] Default one-shot Create draw still works  
- [ ] Type-on-PNG / no HTML-primary  

## Guards (Tester)

- Probe documented; continuity mode asserted  
- Path naming `pipeline=`  
- Guard file: `memory/tickets/C-s54-anchor-draw/guards.md`

## Skills

`backend` · `ai-bridge` · `carousel-json-contract` § Phase5 · `prompt-engineering` § Phase5
