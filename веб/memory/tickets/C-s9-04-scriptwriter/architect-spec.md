# Architect spec — C-s9-04-scriptwriter (P0)

> DEV_PLAN **9.4** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

Усилить **на месте** Scriptwriter карусели: captivating hook, CTA catalog **1–4**, `swipe_trigger` = meta only, dynamic N, Vernatun tone. Цель — Claude-Code bar без смены агентов.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-04-upgrade** | Patch `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` + `PIPELINE_COPY["carousel-engine"].copywriter*` only |
| **D-s9-04-keys** | Не ломать JSON keys без Backend zod sync |
| **D-s9-04-no-auto-handoff** | Сохранить «Понравилось? Что поправить?» — без auto Designer |
| **D-s9-04-razbor** | Если insights есть — must-consume (уже в defaults; усилить fail language) |
| **D-s9-04-model** | Haiku 5.5 + thinking — не отключать |

## Exact files AI Bridge may edit

- `lib/studio/create-carousel-prompts.ts` (scriptwriter overlay)
- `lib/mesh/agent-defaults.ts` — **carousel-engine copywriter fields only**
- `workers/script-writer/SKILL.md`
- `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` (optional)
- `.cursor/skills/ai-bridge/s50-prompt-hardening.md` (align)

## MUST NOT

- Designer overlays (→ C-s9-05)
- `custom-reels` keys (→ C-s9-06)
- UI Create/Razbor chrome
- Delete razbor role / change handoff buttons

## Acceptance

- [ ] Hook bar + CTA 1–4 + swipe meta явно в live system path
- [ ] Diff не удаляет Scriptwriter step
- [ ] Smoke later (9.9) shows stronger cover language vs flat labels

## Skills

`carousel-json-contract` · `prompt-engineering` § Sprint 9 · `ai-bridge` · `s50-prompt-hardening`
