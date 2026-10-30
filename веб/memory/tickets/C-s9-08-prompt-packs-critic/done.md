# Done — C-s9-08-prompt-packs-critic

**Status:** done  
**Role:** AI Bridge

## Packs

- `lib/studio/prompt-packs/sprint9-carousel-pack.ts`
- `lib/studio/prompt-packs/sprint9-reels-pack.ts`
- Notes: `.cursor/skills/ai-bridge/sprint9-prompt-packs.md`

## Critics (gate, not agents)

- `lib/studio/carousel-quality-critic.ts` — flat hook / CTA / purple-slop / swipe
- `lib/studio/reels-quality-critic.ts` — soft intro / hook / beats / CTA / carousel forbid

## Wire

- `agent-start-bundle.ts` — few-shot + critic instructions
- `agent-chat/route.ts` — critic before draw; critic on Scriptwriter JSON replies

## Confirmed

Pipeline order unchanged; critic does not replace Razbor/SW/Designer; no social publish.
