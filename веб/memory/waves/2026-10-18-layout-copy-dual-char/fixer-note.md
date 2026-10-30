# Fixer note — smoke B overlay cutout (whole sheet → single pose)

**Role:** Fixer  
**Date:** 2026-10-18  
**Wave:** `2026-10-18-layout-copy-dual-char`

## What failed

Smoke **B** (`overlay_cutout`) pasted the entire Ануш **character sheet** (6 poses in a white/light box) as the HTML `<img class="character">` on slides **01** and **06**, instead of one transparent/single conductor pose.

## Root cause

1. Smoke script set `generateCutoutPoses` only when `SMOKE_GEN_CUTOUT_POSES=1` → default **OFF**.
2. Renderer soft-failed / defaulted `cutoutForSlide = characterPhoto` → raw sheet URL `/characters/anush-sheet.jpg`.

## Fix

1. **`buildCharacterCutoutPrompt`** — HARD: exactly ONE pose; ban sheet/grid/collage; ban checkerboard pixels; prefer transparent / flat studio; sheet = identity ref only.
2. **`character-cutout-pose.ts`** — crop one cell (2×3) via Playwright as soft-fail; **`knockoutCutoutBackground`** → true PNG alpha (strip light/checkerboard).
3. **`carousel-html-renderer.ts`** — overlay path generates poses with sheet as `referenceImagePath`; never paste whole sheet; crop + knockout fallback.
4. **Smoke** — pose gen **ON** by default for arm B (`SMOKE_GEN_CUTOUT_POSES=0` to opt out; still crops, never whole sheet).
5. **Re-composite** — `scripts/fix-smoke-b-overlay-cutout.ts` patches **01+06** only (smoke A untouched).

## Verify

```bash
npx tsx scripts/fix-smoke-b-overlay-cutout.ts
# or full arm B:
# SMOKE_ARM=B npx tsx scripts/smoke-layout-copy-dual-char.ts
```

Expect: `docs/карусель тест/layout-copy-dual-char-smoke-B-overlay/slide_01.png` + `slide_06.png` show **one** girl pose as conductor, not the 6-up sheet.

**Verified 2026-10-18:** 01+06 = `image_ref_generations+knockout` — single transparent conductor; no sheet grid; smoke A untouched.

```
🔧 ФИКСЕР: whole-sheet cutout → single pose gen(+sheet ref) / cell crop + alpha knockout; smoke B 01+06 re-composited
```
