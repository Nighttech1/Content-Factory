# Fixer report — 2026-10-18 vision-style-copy (step 6)

**Role:** Фиксер  
**Date:** 2026-10-18  
**Wave:** `2026-10-18-vision-style-copy`  
**Verdict:** Re-smoke GREEN · visual closer to RE orange plates (not kitchen lifestyle)

---

## Root cause

Client FAIL was **not** “refs missing” — slots + `styleCopyMode=vision_ref` were wired. The visual fail came from **`designer_pack=fallback_synth`**:

1. Designer LLM translate (`ensureDesignerVariantAPack`) failed (multimodal/schema) and silently fell through to **stock variety synth** (`synthesizeFallbackHtmlLayout` → `cover_center` / tip_card / `bgFit=cover`).
2. That synth invents full-bleed editorial scenes; image prompts said “lifestyle kitchen”, so the image model painted a kitchen set — opposite of etalon **solid plate + object zone**.
3. Composite defaulted missing `bgFit` → **`cover`**, and seed typography logged **Manrope** as style SoT even though vision_ref skipped the token card.
4. `character=none` in timeline = HTML cutout placement (correct for `in_image`); conductor must live in **bg pixels** — cover/cta prompts were too weak / overwritten by lifestyle invent.

---

## Fix (surgical)

| File | Change |
|------|--------|
| `lib/studio/designer-variant-a-pack.ts` | vision_ref: LLM retry slim→full→text; soft-repair orphan highlights; **never** stock `fallback_synth` — use `vision_ref_hardcopy` (RE grammar: `body_left`/`cta_bottom`, `bgFit=contain`, left/top); reinforce lifestyle prompts → plate prompts; skip variety shuffle |
| `lib/studio/create-carousel-prompts.ts` | `VISION_STYLE_COPY_HARD` + new `buildVisionRefBackgroundImagePrompt` — MATCH solid plate + ONE object; BAN full-bleed kitchen; conductor cover+cta |
| `lib/studio/carousel-html-renderer.ts` | vision_ref always rebuilds plate prompts; fonts meta/`cssVars` → `etalon_mirror` (no Manrope SoT); `hasHero` forced for in_image |
| `lib/studio/carousel-layered-composite.ts` | default `bgFit=contain` when `layoutMapSource=vision_ref`; **plate polarity** (even=orange/white type, odd=white/dark type) |

---

## Re-smoke

```text
npx tsx scripts/smoke-vision-style-copy.ts
→ DONE ok=true pngCount=6 banOk=true
→ docs/карусель тест/vision-style-copy-smoke-A-in-image-6/
```

| Marker | Before | After |
|--------|--------|-------|
| `designer_pack` | `fallback_synth` | **`vision_ref_hardcopy`** (fallback_synth gone) |
| `bgFit` | always `cover` | **`contain`** ×6 |
| `fonts` | `Manrope+Manrope+Noto…` | **`etalon_mirror+system-ui+Noto Sans Armenian`** |
| `template` | cover_center / tip_card… | **body_left / body_split / cta_bottom** |
| Visual | full-bleed kitchen | **solid orange/white plates + object zone**; conductor on cover+cta |

Artifacts: `17/slide_01…06.png`, `meta.json`, `timeline.md`, `timeline-prompt-full.md`.

---

## Visual notes (honest)

**Closer to RE orange (PASS bar for this Fixer step):**
- Solid orange cover + white body/cta plates (no kitchen room set).
- Hero food object / conductor+object on plate; left-aligned type; accent keyword color on CTA title.
- HTML CTA bottom-left on last slide; Vernatun logo top-left (brand swap OK vs three-bars).

**Still not pixel-clone of etalon (next wave / LLM):**
- Designer LLM still did not win (`vision_ref_hardcopy` path) — hardcopy is intentional safety net; further work = get `designer_llm` green with vision attach.
- CTA chrome = rounded catalog button, not square+arrow glyph from RE.
- Mid slides object-only (no conductor) — by design (cover+cta minimum).
- Image model sometimes still adds a few props; prompt bans busy table but not 100% obeyed.

---

## Guards / forbidden

- Did **not** set overlay_cutout default, AppShell redesign, VPS/publish, DB wipe.
- Did **not** claim PASS on kitchen lifestyle; re-smoke artifacts on disk prove plate grammar.

`🔧 **ФИКСЕР:** fallback_synth → vision_ref_hardcopy · contain · etalon_mirror · plate prompts · re-smoke GREEN`
