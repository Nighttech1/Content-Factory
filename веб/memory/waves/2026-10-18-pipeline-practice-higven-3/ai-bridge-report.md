# AI Bridge report — pipeline-practice-higven-3

**Role:** AI Bridge  
**Wave:** `2026-10-18-pipeline-practice-higven-3`  
**Status:** done (prompts wired)

## Changes

| File | What |
|------|------|
| `lib/studio/create-carousel-prompts.ts` | Added `HIGVEN_3_PARALLEL_PACK_HARD`; append when `vision_ref` + `characterPaint=none`. Logo color = same-pack only (no 2nd call). Scriptwriter: N=3 lock + HITL «Передать дизайнеру». |
| `lib/studio/designer-variant-a-pack.ts` | Parallel pack wording for HIGVEN; `synthesizeVisionRefHardCopyLayout` industrial grammar when paint=`none`; stamp `characterPaint` on pack; no conductor when none. |

## Locks honored

- ONE reply: `image_prompt` + `html_layout` per slide  
- `characterPaint=none` (no girl/conductor)  
- `logo.textColor` optional in same pack only  
- Scriptwriter Haiku via env `CAROUSEL_SCRIPTWRITER_MODEL` (smoke sets haiku)  
- HIGVEN industrial grammar in overlay + hardcopy fallback  

## How to verify

Smoke prompt dump must contain `## HIGVEN-3 PARALLEL PACK` and `characterPaint=none`.
