# Architect spec — C-s9-08-prompt-packs-critic (P0)

> DEV_PLAN **9.8** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

Claude-Code-level: **один** сильный system/user pack на карусель + **один** на рилс; few-shot из golden (9.2/9.3); **critic loop** перед Draft — reject weak hook / empty CTA / purple slop. **Без** удаления существующих агентов.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-08-packs** | Packs live as overlays / mesh seeds / optional `lib/studio/prompt-packs/sprint9-*.ts` — injected into **existing** agent-start, not a replacement mesh |
| **D-s9-08-fewshot** | 2–5 examples from golden fixtures; same JSON schema as live |
| **D-s9-08-critic** | Per wave §6: extra gate before Draft; max **1** retry then fail; critic does **not** replace Scriptwriter/Designer |
| **D-s9-08-plug** | Call from handoff success / draw success / publish-to-draft path |
| **D-s9-08-no-publish** | Critic never triggers social publish |

## Exact files AI Bridge may edit

- New: `lib/studio/carousel-quality-critic.ts`, `lib/studio/reels-quality-critic.ts` (names flexible)
- New or extend: prompt pack modules under `lib/studio/`
- `lib/studio/agent-start-bundle.ts` — inject few-shot / critic instructions
- `app/api/studio/agent-chat/route.ts` — call critic plug
- `lib/studio/create-carousel-publish.ts` — gate before Draft persist if needed
- `.cursor/skills/ai-bridge/` pack markdown stubs (no secrets)

## MUST NOT

- New mesh agent that deletes Razbor/SW/Designer
- Soft pass on critic fail
- UI chrome redesign

## Acceptance

- [ ] Packs referenced from live agent-start for carousel + reels
- [ ] Few-shots cite golden fixture ids
- [ ] Critic rejects at least: flat hook, missing CTA, carousel JSON on reels
- [ ] Pipeline order unchanged

## Skills

`prompt-engineering` § Sprint 9 · `carousel-json-contract` · `reels-scriptwriter` · `ai-bridge`
