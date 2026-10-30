# Brief — pipeline-practice-higven-3

**Status:** Trainer step 0 **done** (grade A). Ready for Architect.  
**Canon:** `plan.md` (do not drift).  
**Grade:** `memory/trainer/2026-10-18-pipeline-practice-higven-3-grade.md`  
**Card:** `plugins/trainer/pipeline-practice-higven-3.md`  
**ticket_limit:** full-queue  
**Carousel attempts:** ≤3 then STOP

## Locks (copy into chain.md)

1. Active etalon = **01 HIGVEN**; clear other etalon presets; **02** inactive library OK  
2. Designer GPT **parallel** ONE reply: `image_prompt`×3 + `html_layout`×3 → image ‖ renderer  
3. Scriptwriter **Haiku** → HITL **«Передать дизайнеру»** (no auto-handoff)  
4. Theme = any useful-sheet  
5. N=**3** cover · body · cta  
6. Logo = **full** Vernatun PNG (`vernatun-logo.png`) HTML `<img>` only  
7. No second Designer call for logo color  
8. Art Director remarks \| approve — **no remake**  
9. `characterPaint=none`  
10. Settings seed from `pipeline-practice-2026-10-18` as above  

## Proposed chain

```text
Architect → AI Bridge → Backend (seed+smoke) → Tester → Fixer if needed (≤3) → Deployer → Client
```

## Smoke

- Script: `scripts/smoke-pipeline-practice-higven-3.ts` (Architect/Backend name if missing)  
- Out: `docs/карусель тест/pipeline-practice-higven-3/` (3 PNG + timeline)  
- Guards: N=3 · no character · active HIGVEN · full logo PNG · parallel pack fields · AD no remake  

## Out of scope

Phase3 girl · overlay_cutout · VPS · social publish · Frontend AppShell · >3 slides · paid MCP  

## Success

Carousel looks like **HIGVEN** (dark industrial / orange / hierarchy) + Sheet text + full Vernatun PNG + 3 frames + no girl → Client **согласовано** or explicit C-* after ≤3 attempts.
