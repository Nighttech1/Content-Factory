# Architect spec — C-s9-06-reels-scriptwriter (P0)

> DEV_PLAN **9.6** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

Усилить live generate Scriptwriter для `custom-reels` (IG + YouTube Shorts): hook 0–2с, beats, VO, on-screen CTA, `promptForMontage`. Handoff в **существующий** Монтажёр/render path — **не** HeyGen/cartoon.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-06-upgrade** | Patch `PIPELINE_COPY["custom-reels"]` + `reels-script-contract` helpers in place |
| **D-s9-06-not-carousel** | Carousel JSON as reels output = FAIL |
| **D-s9-06-path** | Keep Scriptwriter → Монтажёр; no new video stack |
| **D-s9-06-wire** | Ensure agent-chat / create path for `custom-reels` uses upgraded prompts (no UI redesign) |

## Exact files AI Bridge may edit

- `lib/mesh/agent-defaults.ts` — **custom-reels only**
- `lib/studio/reels-script-contract.ts`
- `workers/script-writer/SKILL.md` (reels section only / clarify split)
- Optional: small wire in `agent-chat/route.ts` **only** to apply reels schema hint / parse — no role delete

## MUST NOT

- HeyGen / Remotion cartoon paths
- Carousel Dramaturgy as reels deliverable
- Social publish
- UI shell

## Acceptance

- [ ] Verbatim HARD intents from `reels-scriptwriter` skill in defaults
- [ ] Parse rejects carousel slides-only payloads
- [ ] Inventory gap «live generate» closed or documented remaining chrome for render

## Skills

`reels-scriptwriter` · `prompt-engineering` · `ai-bridge` · `content-pipeline-agents` § Sprint 9
