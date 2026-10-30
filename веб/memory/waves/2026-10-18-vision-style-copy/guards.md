# Guards G1–G14 — 2026-10-18 vision-style-copy

**Role:** Tester (step 5)  
**Date:** 2026-10-18  
**Scripts:** `npx tsx scripts/verify-vision-style-copy-unit.ts` · `npx tsx scripts/verify-vision-style-copy-guards.ts`  
**Smoke:** `docs/карусель тест/vision-style-copy-smoke-A-in-image-6/`  
**Verdict:** **14/14 PASS** · Fixer **not needed**

---

| ID | Assert | Result | Evidence |
|----|--------|--------|----------|
| **G1** | Job/prompt path accepts `styleCopyMode` `vision_ref` \| `token_card` | **PASS** | `StyleCopyMode` in `create-carousel-prompts.ts`; `resolveCreateCarouselOverlay(…, vision_ref)` ≠ `token_card` path. Unit+guards scripts OK. |
| **G2** | On `vision_ref`, Designer builder skips FULL `buildDesignTokensPayload` dump | **PASS** | Overlay vision: no `## FULL DESIGN TOKENS`; token_card path still injects. Trace: `inject_skipped: token_card_role_table`. |
| **G3** | Timeline prompt: **0** Manrope / Cormorant / `typography.scale` / FULL DESIGN TOKEN | **PASS** | `assertVisionRefPromptBanClean(timeline-prompt-full.md)` ok; grep 0 hits on ban substrings in Designer SYSTEM+USER dump. |
| **G4** | Image reference attached (path/url/base64) per slide/slot | **PASS** | `meta.referenceImageAttached=true`; `slotMap`×6 with `refKind=path` + `refPath` to `_slots/01-…/{cover,midA,midB,cta}.png`; timeline `REFERENCE IMAGE WIRE`. |
| **G5** | Slot map N=6 → cover, midA, midB, midA, midB, cta | **PASS** | `mapSlideToRefSlot` fixture + meta.slotMap identical. |
| **G6** | Hard-copy wording (composition / zones / hierarchy / logo·CTA·numbering / photo-vs-plate) | **PASS** | `VISION_STYLE_COPY_HARD` + timeline HARD-COPY block present. |
| **G7** | Product default `characterPaint` = `in_image` | **PASS** | `DEFAULT_CHARACTER_PAINT === "in_image"`. |
| **G8** | Smoke meta: `in_image` (not overlay_cutout) | **PASS** | `meta.json`: `styleCopyMode=vision_ref`, `characterPaint=in_image`, `character_path=in_image`, pack `re_orange_01`, slides=6. |
| **G9** | `bgFit` cover \| contain \| mask honored; contain/mask ≠ forced cover-only | **PASS** | `resolveBgFitCss` unit: modes distinct; contain CSS ≠ cover CSS; mask emits `.bg-photo`. |
| **G10** | Smoke dir exactly **6** final PNG | **PASS** | `slide_01.png`…`slide_06.png` present (6/6). |
| **G11** | KEEP secondary_copy ≥220 + ≥5 | **PASS** | `SECONDARY_COPY_MUCH_WIDER_HARD` + critic mins 220/5. |
| **G12** | KEEP CTA 1–4 + swipe meta + `layered_html` | **PASS** | Vision overlay + timeline markers; `slide_01.html` `data-render="layered_html"`. |
| **G13** | layoutMap **not** required for PASS | **PASS** | Prompt: «layoutMap JSON is **NOT** required for PASS»; meta has **no** `layoutMap` field — smoke still green. |
| **G14** | shell_freeze: no AppShell churn | **PASS** | AI Bridge + Backend reports: AppShell **Not touched**; Frontend SKIP; no AppShell in wave product file lists. |

---

## Smoke dir checklist

| Artifact | Status |
|----------|--------|
| 6× PNG | ✅ |
| `meta.json` | ✅ `vision_ref` · `in_image` · pack 01 · refs attached |
| `timeline-prompt-full.md` | ✅ ban-clean |
| layoutMap required? | ❌ **not required** (PASS) |

## Commands

```bash
npx tsx scripts/verify-vision-style-copy-unit.ts   # OK
npx tsx scripts/verify-vision-style-copy-guards.ts # 14/14 PASS
```

## Fixer targets

**None** — all G1–G14 PASS.
