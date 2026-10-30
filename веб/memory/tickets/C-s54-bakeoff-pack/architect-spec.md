# Architect spec — C-s54-bakeoff-pack (P0)

> Wave: `memory/waves/2026-10-17-anchor-ref-bakeoff/`  
> Chain: wave `chain.md` step 4 · ticket `chain.md`  
> Depends on: **C-s54-anchor-prompts** + **C-s54-anchor-draw**  
> Unlocks: Tester → Deployer → Client **S54**

## Goal

Run live bake-off pack: **3 Armenian LANGUAGE** Scriptwriter carousels × **3 slides** = **9 new PNG** via `anchor_ref_pipeline`; package etalon + e2e_diffusion by symlink/copy; write root README + `docs/карусель тест/` MD traces for Client side-by-side.

## Decision locks

| ID | Lock |
|----|------|
| **D-bp-1** | Root: `generatedMedia/карусель тест/bakeoff-20261017/` with `pipeline={label}/{theme}/slide_0N.png`. |
| **D-bp-2** | New draw **only** under `pipeline=anchor_ref_pipeline/` — themes `hy-alphabet-hook`, `hy-east-west-spell`, `hy-diaspora-school`. |
| **D-bp-3** | Symlink or copy `etalon` from `generatedMedia/эталон карусели/` and `e2e_diffusion` from `generatedMedia/wave-e2e-image-carousel/` — **0** new image calls for those arms. |
| **D-bp-4** | Root `README.md`: arms table, themes, budget (9 new), Path A/B note (ref vs MASTER STYLE), how Client picks closest to etalon. |
| **D-bp-5** | MD traces: `docs/карусель тест/14…19-s54-*.md` (or next free numbers) — Scriptwriter ×3 + Designer ×3; Designer includes exact prompts, `Paint path: anchor_ref_pipeline`, `html_overlay: none`, continuity mode. |
| **D-bp-6** | Drafts overwrite only: `draft-s54-a` / `b` / `c`. |
| **D-bp-7** | Hard stop if would exceed **9** new PNG — write stop-report, do not continue. |
| **D-bp-8** | Do **not** reimplement Polza client or overlay strings — call APIs from tickets 1–2. |
| **D-bp-9** | `shell_freeze` — no UI chrome. No social publish. |

## Exact files AI Bridge may create/edit

| Path | Action |
|------|--------|
| `scripts/bakeoff-anchor-ref-s54.ts` (or extend existing live-gen/trace script) | Orchestrate 3 themes × sequential draw |
| `generatedMedia/карусель тест/bakeoff-20261017/**` | PNG + README + symlinks/copies |
| `docs/карусель тест/*-s54-*.md` | Traces |
| `docs/карусель тест/README.md` | Index row for S54 |
| Draft store / upsert path used by prior e2e scripts | overwrite `draft-s54-*` |
| `memory/tickets/C-s54-bakeoff-pack/decisions.md` | Run log (counts, Path A/B, theme slugs) |

## MUST NOT

- Edit prompt overlays or `aggregator-images` core (tickets 1–2 ownership) except calling public helpers  
- Touch AppShell / Create chrome  
- Reburn e2e/etalon into the 9 budget  
- VPS / social publish  

## Acceptance

- [ ] Tree shows `pipeline=etalon`, `pipeline=e2e_diffusion`, `pipeline=anchor_ref_pipeline`  
- [ ] Exactly **9** new PNGs under anchor_ref (3×3) unless stop-report  
- [ ] README index present  
- [ ] 6 MD traces (SW+Designer ×3) with exact prompts + paint path  
- [ ] Client can open folders for S54.A–C without hunting unlabeled dumps  

## Guards (Tester)

- Folder naming; PNG count; LANGUAGE themes; continuity note; no shell churn  
- Guard file: `memory/tickets/C-s54-bakeoff-pack/guards.md`

## Skills

`carousel-prompt-trace` · `ai-bridge` · `carousel-json-contract` § Phase5 · Client **S54** · `plugins/trainer/carousel-anchor-ref-bakeoff.md`
