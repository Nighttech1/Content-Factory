# Guards — logo-placement-v2 (2026-10-18)

**Wave:** `2026-10-18-logo-placement-v2`  
**Tester:** live re-verify (asset sample + SoT import + smoke HTML/PNG + asserts.json)  
**Verdict:** **ALL PASS** · Fixer **not** required

| ID | Guard | How | Result |
|----|-------|-----|--------|
| **G1** | `public/brand/vernatun-logo.png` exists; corners near-transparent (alpha) | `existsSync` + sharp raw sample TL/TR/BL/BR (+2 inset) | **PASS** — 462 601 B · 1024×682 · `hasAlpha` · corner `a=0` · ~475 202 transparent px |
| **G2** | `BRAND_LOGO_SIZE_PX === 176` | Import `carousel-layered-composite.ts` + CSS in smoke HTML `max-width/height: 176px` | **PASS** |
| **G3** | Cover+last → `top-left`; body → `bottom-left` | `defaultLogoPlacementForRole` SoT + smoke `data-placement` on `.brand` | **PASS** — 01/06 `top-left`; 02–05 `bottom-left` |
| **G4** | `logoUrl` → no `.brand-name` element | Smoke HTML: 0× `<div class="brand-name"`; asserts `brandNameHits: 0` | **PASS** |
| **G5** | Smoke folder 6 PNG | `docs/карусель тест/logo-placement-v2-smoke/slide_01…06.png` | **PASS** — 6 files |
| **G6** | `asserts.json` 0 FAIL | Parse asserts array | **PASS** — 26× `PASS` · 0× `FAIL` |

## Evidence pointers

- Asset: `public/brand/vernatun-logo.png`
- SoT: `lib/studio/carousel-layered-composite.ts` (`BRAND_LOGO_SIZE_PX`, `defaultLogoPlacementForRole`, `resolveLogoPlacement`, logo-only branch)
- Smoke: `docs/карусель тест/logo-placement-v2-smoke/` (`asserts.json`, `slide_*.html`, `slide_*.png`)
- Backend handoff: `memory/waves/2026-10-18-logo-placement-v2/backend-report.md`

## Re-run

```bash
npx tsx scripts/smoke-logo-placement-v2.ts
# then re-check asserts.json + corner alpha sample
```
