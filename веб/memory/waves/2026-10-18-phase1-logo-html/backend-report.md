# Backend Report — 2026-10-18 Phase 1 · Vernatun wordmark HTML logo

**Роль:** Backend  
**Волна:** `2026-10-18-phase1-logo-html`  
**Статус:** **DONE** (DoD §7)  
**Дата:** 2026-10-18

---

## Summary

Установлен прозрачный wordmark PNG Vernatun как дефолт Brand. Layered composite при `logoUrl` рисует **только** `<img>` — без HTML `.brand-name`. Thin prompt hint убирает «name right of icon» для wordmark path. Dual-path `logoRefRaw` KEEP. S57 HTML only — лого не вшивается в image model. Smoke: 6 слайдов re-composite без paid gen.

---

## Files changed

| Path | Change |
|------|--------|
| `public/brand/vernatun-logo.png` | Already present; **SHA256 match** Cursor assets source (238444 bytes). No rewrite needed. |
| `public/brand/vernatun-logo.svg` | **KEEP** on disk (legacy). |
| `lib/settings/brand-store.ts` | `DEFAULT_LOGO_REF = "/brand/vernatun-logo.png"`; comment that svg is legacy asset only. `defaultBrandSettings()` → PNG. |
| `lib/studio/carousel-layered-composite.ts` | Brand branch: `logoUrl` → `<img>` ONLY; else `brandName` → `.brand-name`. CSS `.brand-name` rule kept for fallback. Placement/size unchanged (bottom-RIGHT / 88px). |
| `lib/studio/create-carousel-prompts.ts` | Thin LOGO hint: wordmark/`logoRef` present → logo image only; omit name-beside / name-right-of-icon. |
| `scripts/smoke-phase1-logo-recomposite.ts` | **NEW** — re-composite 6 slides from vision-style-copy HTML bg data URIs. |
| `docs/карусель тест/phase1-logo-html-smoke/` | **NEW** — `slide_01…06.png` + `.html` + `README.md` + `asserts.json`. |
| `memory/waves/2026-10-18-phase1-logo-html/backend-report.md` | This file. |
| `memory/waves/2026-10-18-phase1-logo-html/chain.md` | Step 2 + optional re-smoke → `[x]`. |

### Unchanged (intentional)

| Path | Why |
|------|-----|
| `lib/intake/placeholders.ts` | Dual-path KEEP |
| `lib/studio/carousel-html-renderer.ts` | Already prefers `logoRefRaw` → Playwright; default `brandName="Vernatun"` for fallback/logging only — composite now gates name on `!logoUrl` |
| `data/local/brand-settings.json` | No entry used `/brand/vernatun-logo.svg`. `user_seed_admin_c16` has custom `data:image/png` upload — **not overwritten**. `smoke-tester` keeps `/brand/smoke.svg`. Fresh users get PNG via `defaultBrandSettings()`. |
| AppShell / fonts / character / image-model prompts | Out of scope Phase 1 |

---

## DoD checklist

1. **Asset** — `public/brand/vernatun-logo.png` = source SHA256 `90C9D0C473D97A892110ADF8400EE555A8C55FC381257242F07193DE64E6AA30` ✓  
2. **Default** — `DEFAULT_LOGO_REF === "/brand/vernatun-logo.png"`; svg file remains ✓  
3. **Composite logoUrl** — brand block = `<img …>` only; **no** `<div class="brand-name">` ✓  
4. **Fallback** — no `logoUrl` + `brandName` → `.brand-name` still emits (smoke assert PASS) ✓  
5. **Dual-path** — renderer still prefers `logoRefRaw`; no bake into image model ✓  
6. **Prompt hint** — omit name-right for wordmark path ✓  
7. **Scope** — no AppShell / Phase 2 / Phase 3 / publish / DB wipe ✓  
8. **Report** — this file ✓  
9. **Smoke** — 6 PNG @ `docs/карусель тест/phase1-logo-html-smoke/` ✓  

---

## How to verify

```bash
# Default logo path
npx tsx -e "import { defaultBrandSettings } from './lib/settings/brand-store.ts'; console.log(defaultBrandSettings('x').logoRef)"
# → /brand/vernatun-logo.png

# Guards (Tester step)
# G3/G4: logoUrl → no <div class="brand-name">; no logoUrl → brand-name OK
# Note: CSS may still contain `.brand-name {` rule — assert the *element*, not the stylesheet string.

# Re-smoke (no paid gen)
npx tsx scripts/smoke-phase1-logo-recomposite.ts
# → docs/карусель тест/phase1-logo-html-smoke/slide_01.png … slide_06.png
```

**Confirmation:** when `logoUrl` present → HTML brand chrome is `<div class="brand" …><img …/></div>` only. Word «VERNATUN» / «ARMENIAN CLUB» live **inside the PNG**, not as separate HTML text.

---

## Smoke path

`docs/карусель тест/phase1-logo-html-smoke/`

- Source bg plates: embedded data URIs from `vision-style-copy-smoke-A-in-image-6/slide_*.html`  
- Logo: `public/brand/vernatun-logo.png` (data URI in Playwright)  
- Asserts: 0 FAIL; `brandNameHits: 0`  
- Spot-check slide_01: wordmark bottom-RIGHT, no duplicate HTML name chrome  

---

## Handoff

→ **Tester** step 3: guards G1–G6 → `guards.md`  
→ Admin with custom data-URL logo keeps their upload until they reset Brand to factory default PNG.
