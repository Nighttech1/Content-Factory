# AI Bridge — C-scriptwriter-swipe-cta

## Done

1. `lib/studio/create-carousel-prompts.ts` — Scriptwriter overlay: swipe META HARD + CTA catalog 1–4; Designer describe/draw: one-liner do not paint `swipe_trigger`.
2. `lib/studio/carousel-json-contract.ts` — optional `cta_type` 1|2|3|4 root+slide; schema hint documents meta swipe + CTA catalog; `swipe_trigger` remains required string.
3. `lib/mesh/agent-defaults.ts` — carousel `copywriterPrompt` / designer prompt / skills/rules aligned.

## Verify

- Grep overlays for `CTA catalog` / `META only` / `Do not render swipe_trigger`.
- Zod accepts `{ cta_type: 2 }` on root or slide; rejects `cta_type: 5`.
