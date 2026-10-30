# Architect spec — C-s9-03-golden-reels (P1)

> DEV_PLAN **9.3** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

**2–3** эталонных viral scripts для IG + YouTube Shorts: hook 0–2с, value beats, on-screen + caption CTA, VO. **Не** карусельный Dramaturgy JSON.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-03-schema** | `contentType: "reels"` per `reels-scriptwriter` |
| **D-s9-03-path** | `memory/fixtures/sprint9/reels/{id}/script.json` + `NOTES.md` |
| **D-s9-03-platforms** | Хотя бы один явно IG-toned, один YT Shorts-toned (caption nuance OK; same 9:16 structure) |
| **D-s9-03-fail** | Fixture with carousel `slides[]` = invalid |

## In scope

- AI Bridge fixtures only (+ optional Backend load)

## Out of scope

- HeyGen / Remotion cartoon; UI; publish

## Acceptance

- [ ] ≥2 fixtures with hook.t1≤2, ≥2 beats, explicit CTA
- [ ] NOTES explain why viral / Vernatun

## Skills

`reels-scriptwriter` · `ai-bridge`
