# Backend report — 2026-10-18 vision-style-copy

**Role:** Backend (step 3)  
**Date:** 2026-10-18  
**Tickets:** C-vision-style-mode · C-vision-image-ref-wire · C-vision-bg-fit · C-char-default-in-image · C-vision-smoke-a6  
**Verdict:** Wire + bgFit + smoke A×6 **GREEN**

---

## Done

### 1. `styleCopyMode` on job/draw
- `runCreateCarouselDraw` / `runCorrectPipelineGenerate` / `runCorrectPipelineFromRow` accept `styleCopyMode: vision_ref | token_card`
- Thin wire on `app/api/studio/agent-chat` draw body (`styleCopyMode`, `characterPaint` / `character_path`, pack id/path)
- Smoke default = **`vision_ref`**

### 2. Pack 01 → 4 slots + `mapSlideToRefSlot`
- New: `lib/studio/style-copy-slots.ts`
- Default pack = `re_orange_01` → `…/layout-copy-refs-2026-10-18/01-real-estate-orange-grid.png`
- **Slice math (2×2 equal quadrants):**
  - `cover` = top-left `(0, 0, W/2, H/2)`
  - `midA` = top-right `(W/2, 0, W/2, H/2)`
  - `midB` = bottom-left `(0, H/2, W/2, H/2)`
  - `cta` = bottom-right `(W/2, H/2, W/2, H/2)`
- Cache: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/_slots/01-real-estate-orange-grid/{cover,midA,midB,cta}.png`
- N=6 map: `1→cover, 2→midA, 3→midB, 4→midA, 5→midB, 6→cta` (unit-verified)

### 3. Multimodal / reference image wire
- `lib/llm/aggregator-images.ts`: `referenceImageBase64` + `referenceImageMime`; prefer path → url → base64
- Layered draw: per-slide `generateAggregatorImageWithOptionalRef({ referenceImagePath: slot })`
- Designer pack LLM: 4 slot images as multimodal `images[]` via `callAggregatorChat`
- Thin sanitize: `sanitizePlaceholdersForVisionRef` strips typography/roles from `{{DESIGN_PALETTE_JSON}}` so Manrope/scale never enter vision_ref Designer prompt

### 4. Product default `characterPaint=in_image`
- Flipped remaining `overlay_cutout` defaults:
  - `correct-pipeline-job` (hero present → `DEFAULT_CHARACTER_PAINT`)
  - `carousel-html-renderer` layered path
  - `carousel-layered-composite` `shouldPlaceCharacterOnSlide` / `resolveCharacterPlacement`
- `overlay_cutout` remains explicit legacy only

### 5. Composite `bgFit`
- `resolveBgFitCss` in `carousel-layered-composite.ts`
- Modes: `cover` | `contain` (letterbox) | `mask` (+ optional `photoZone` 0..1)
- Meta `cf-bg-fit` + `data-bg-fit` on frame

### 6. Smoke A×6 GREEN
| Field | Value |
|-------|-------|
| Path | `docs/карусель тест/vision-style-copy-smoke-A-in-image-6/` |
| Mode | `styleCopyMode=vision_ref` · `characterPaint=in_image` |
| Pack | **01** RE orange |
| Topic | useful **#17** kitchen (row 17) |
| PNG | **slide_01…06.png** (6/6) |
| Meta | `meta.json` — in_image + vision_ref + slotMap |
| Timeline | `timeline.md` + **`timeline-prompt-full.md`** |
| Ban | **PASS** — zero Manrope / Cormorant / typography.scale / FULL DESIGN TOKEN / buildDesignTokensPayload |
| Refs | `referenceImageAttached: true` · count 4 · per-slide slot paths in meta |

**Alias:** prior `layout-copy-dual-char-smoke-A-in-image/` not overwritten — wave-named dir is SoT.

### Unit
```bash
npx tsx scripts/verify-vision-style-copy-unit.ts  # OK
npx tsx scripts/smoke-vision-style-copy.ts        # GREEN
```

---

## Files changed

| File | Change |
|------|--------|
| `lib/studio/style-copy-slots.ts` | **NEW** — pack resolve, 2×2 slice/cache, `mapSlideToRefSlot` |
| `lib/llm/aggregator-images.ts` | base64 ref + mime |
| `lib/studio/carousel-layered-composite.ts` | `bgFit` CSS · default `in_image` |
| `lib/studio/designer-variant-a-pack.ts` | multimodal slots · promptDump · vision_ref placeholder sanitize |
| `lib/studio/carousel-html-renderer.ts` | styleCopyMode · slots · per-slide ref draw · defaults |
| `lib/intake/correct-pipeline-job.ts` | job flags · default in_image · pass-through dump |
| `app/api/studio/agent-chat/route.ts` | thin body wire for styleCopyMode / characterPaint |
| `scripts/smoke-vision-style-copy.ts` | **NEW** smoke A×6 |
| `scripts/verify-vision-style-copy-unit.ts` | **NEW** unit |
| `docs/карусель тест/vision-style-copy-smoke-A-in-image-6/` | 6 PNG + meta + timelines |

**Not touched:** AppShell / Create chrome · AI Bridge prompt prose (except Backend sanitize of palette JSON inject) · VPS / publish / DB wipe · secrets

---

## Risks / notes

- Postgres unreachable locally → Sprint8 **fallback** JSON SoT (expected; same as prior wave).
- PNG budget reset to max 80 for smoke.
- First smoke attempt failed ban assert because `{{DESIGN_PALETTE_JSON}}` still dumped FULL token payload (Manrope) — fixed via `sanitizePlaceholdersForVisionRef` and re-ran smoke GREEN.
- Secrets not logged.

---

## DoD checklist

| # | Item | Status |
|---|------|--------|
| 1 | Accept styleCopyMode; default pack 01 | ✅ |
| 2 | Slice/cache 4 slots + map N=6 | ✅ |
| 3 | Reference image multimodal per slide | ✅ |
| 4 | Job default characterPaint=in_image | ✅ |
| 5 | Composite bgFit cover\|contain\|mask | ✅ |
| 6 | Smoke 6 PNG + meta + timeline-prompt-full (no stock font table) | ✅ |
| 7 | backend-report.md | ✅ |

```
⚙️ BACKEND: vision_ref slots+multimodal · bgFit · in_image default · smoke A×6 GREEN
Next: Frontend SKIP → Tester G1–G14
```
