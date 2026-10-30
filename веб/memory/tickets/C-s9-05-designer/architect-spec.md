# Architect spec — C-s9-05-designer (P0)

> DEV_PLAN **9.5** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

Усилить Designer **на месте**: brandbook / colors-only tokens, **панорама → slice 4:5**, bridges, anti purple-slop / black-success, ignore paint `swipe_trigger`.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-05-upgrade** | Patch designer overlay + `PIPELINE_COPY["carousel-engine"].designer*` only |
| **D-s9-05-pipeline** | Describe → «Нарисовать» → sliced URLs; text-only «готово» = FAIL |
| **D-s9-05-model** | Default image `openai/gpt-5.4-image-2` — не откатывать |
| **D-s9-05-preview** | Product = sliced N×4:5 only |

## Exact files AI Bridge may edit

- `lib/studio/create-carousel-prompts.ts` (designer overlay / draw mode)
- `lib/mesh/agent-defaults.ts` — **carousel-engine designer fields only**
- `workers/designer-carousel/SKILL.md`
- Optional: comments in `carousel-html-renderer.ts` / generate-core **only if** prompt wiring gap (prefer prompts first)

## MUST NOT

- Rewrite renderer architecture
- Change Create UI chrome
- Touch heygen/cartoon workers
- Remove Designer agent

## Acceptance

- [ ] Prompts enforce panorama→slice + brandbook + anti-slop
- [ ] Designer still after Scriptwriter in mesh/Create
- [ ] Golden visual language referenced in NOTES/prompt

## Skills

`carousel-json-contract` · `workers/designer-carousel` · `ai-bridge` · `prompt-engineering`
