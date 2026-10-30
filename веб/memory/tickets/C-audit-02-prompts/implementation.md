# Implementation — C-audit-02 prompts / Phase1

**Role:** AI Bridge  
**Wave:** `2026-10-16-carousel-audit-fix`  
**Depends on:** C-audit-01 (same `agent-defaults.ts` pass)  
**Status:** implemented (await Tester guards)

## What changed

| File | Change |
|------|--------|
| `lib/mesh/agent-defaults.ts` | COMBAT carousel CTA → catalog 1–4 (no «бронь/сторис»); mesh copywriter/designer prompts slimmed to short identity; Designer skills/rules → HTML/CSS-first |
| `lib/studio/create-carousel-prompts.ts` | `CREATE_CAROUSEL_PAIRED_INVARIANTS` (once); role overlays as deltas; Designer describe/draw = HTML/CSS-first, image-2 optional bg; stop panorama-only as sole truth |
| `lib/studio/agent-start-bundle.ts` | `buildRulesBlock`: paired invariants → overlay delta → short mesh identity → mesh rules (no full HARD triple-spam) |
| `lib/studio/prompt-packs/sprint9-carousel-pack.ts` | Embed **3 full** golden JSON few-shots (`dark_notes_coffee`, `bento_glass_metrics`, `dark_editorial_night`) |
| `app/api/studio/agent-chat/route.ts` | Create chat path also prepends paired invariants once |

## Verify

1. Agent-start Scriptwriter system: paired invariants appear once; no triple CTA/hook HARD copy.  
2. COMBAT carousel string has CTA 1–4 keywords; **absent** «бронь стола» / «запись в сторис».  
3. Pack/request contains fenced JSON with real `slides[]`.  
4. Designer describe overlay mentions HTML/CSS-first (not panorama-only promise).

## Out of scope

C-audit-03 `runCreateCarouselDraw` · UI «?» CTA chrome · custom-reels packs.
