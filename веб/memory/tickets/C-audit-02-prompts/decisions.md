# Decisions — C-audit-02 prompts

| ID | Decision | Notes |
|----|----------|-------|
| D-p-1 | Dedupe agent-start Rules | Structure: paired invariants → role overlay → short mesh identity → mesh rules list. Few-shots live in Request (once). |
| D-p-2 | Paired invariants once | Exported `CREATE_CAROUSEL_PAIRED_INVARIANTS` covering N/hook/swipe META/CTA 1–4/visual_prompt/Razbor/no auto-handoff/critic. |
| D-p-3 | COMBAT CTA = catalog 1–4 | Replaced «бронь стола / запись в сторис…»; mesh Create overlay already matched catalog. |
| D-p-4 | Full few-shots | 3 complete JSON bodies embedded in `sprint9-carousel-pack.ts` (not name-only). |
| D-p-5 | Designer HTML/CSS-first | Describe/draw overlays: Playwright HTML primary; image-2 optional bg; panorama not sole truth (prep for C-audit-03). |
| D-p-6 | upgrade_only | Edited existing overlays/pack/bundle/mesh carousel copy only. |
| D-p-7 | Schema stable | No zod/field renames. |

## Mesh seed strategy

Carousel PIPELINE_COPY prompts shortened so `buildRulesBlock` no longer dumps a second full HARD copy of Create overlays.
