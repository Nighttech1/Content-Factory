# Guards — Wave 2026-10-18 Phase 1 · Vernatun wordmark HTML logo

**Role:** Тестировщик · chain step 3  
**Date:** 2026-10-18  
**Spec:** `architect-spec.md` §8 / Orchestrator G1–G6  
**Backend:** `backend-report.md` (DONE)  
**Executable (companion):**  
- `npx tsx memory/waves/2026-10-18-phase1-logo-html/_verify-g234.ts` → **ALL PASS**  
- Smoke asserts: `docs/карусель тест/phase1-logo-html-smoke/asserts.json` → **0 FAIL**, `brandNameHits: 0`  
**Client Playwright:** omit (Architect / chain)

## Verdict: GREEN

| Guard | Result | Evidence |
|-------|--------|----------|
| **G1** PNG asset | **PASS** | `public/brand/vernatun-logo.png` exists · 238444 bytes |
| **G2** DEFAULT_LOGO_REF | **PASS** | `lib/settings/brand-store.ts`: `DEFAULT_LOGO_REF = "/brand/vernatun-logo.png"`; `defaultBrandSettings().logoRef` same |
| **G3** logoUrl → no `.brand-name` element | **PASS** | Composite branch `logoUrl ? <img> : brandName ? .brand-name`; unit `_verify-g234.ts`; smoke `slide_01…06.html` — 0× `<div class="brand-name">` (CSS rule `.brand-name {` may remain — assert **element**, not stylesheet) |
| **G4** no logoUrl → brandName OK | **PASS** | Unit + smoke assert `PASS fallback: .brand-name when no logoUrl` |
| **G5** smoke 6 PNG | **PASS** | `docs/карусель тест/phase1-logo-html-smoke/slide_01.png` … `slide_06.png` (6 files) |
| **G6** prompt omit name-right HARD | **PASS** | `create-carousel-prompts.ts` LOGO hint: wordmark/`logoRef` → **logo image only**; name-beside / name-right-of-icon **only when no logo file**. Grep: no remaining HARD «name right of logo icon» as required chrome for wordmark |

**Score: 6/6 PASS · Fixer: NO**

---

## Permanent asserts (class of defect)

### G1 — Install wordmark PNG (`C-phase1-logo-png-install`)

1. File exists at `public/brand/vernatun-logo.png`.  
2. Legacy `public/brand/vernatun-logo.svg` may remain on disk (not asserted as default).

**Paths:** `public/brand/vernatun-logo.png`

### G2 — Brand default PNG (`C-phase1-logo-png-install`)

1. Source string `DEFAULT_LOGO_REF === "/brand/vernatun-logo.png"`.  
2. `defaultBrandSettings(userId).logoRef` returns that path.

**Paths:** `lib/settings/brand-store.ts`

### G3 — Composite logo-only when `logoUrl` (`C-phase1-logo-composite-omit-name`)

1. When `brand.logoUrl` truthy, emitted HTML inside `.brand` is `<img …>` only.  
2. **No** `<div class="brand-name">` element (CSS selector rule for fallback OK).  
3. No standalone HTML «Vernatun» / club name next to the mark when logo resolves.

**Paths:** `lib/studio/carousel-layered-composite.ts` (`buildLayeredSlideHtml` brand branch)  
**Smoke:** `docs/карусель тест/phase1-logo-html-smoke/slide_*.html`

### G4 — Name fallback without logo (`C-phase1-logo-composite-omit-name`)

1. Empty/absent `logoUrl` + non-empty `brandName` → `<div class="brand-name">…</div>` still emitted.

**Paths:** same composite · smoke fallback assert in `asserts.json`

### G5 — Phase1 re-smoke artifacts (`C-phase1-logo-resmoke`)

1. Directory `docs/карусель тест/phase1-logo-html-smoke/` contains **exactly 6** `slide_*.png` (01–06).  
2. Companion HTML + `asserts.json` document 0 brand-name hits with logoUrl.

**Paths:** `docs/карусель тест/phase1-logo-html-smoke/` · `scripts/smoke-phase1-logo-recomposite.ts`

### G6 — Prompt hint supersede name-right (`C-phase1-logo-prompt-hint`)

1. Designer/FULL DESIGN brand chrome instructions must **not** require «name right of icon» when Brand logo / wordmark present.  
2. Acceptable wording: logo image only; name-beside only when no logo file.

**Paths:** `lib/studio/create-carousel-prompts.ts` (LOGO / brandChrome hint block)

---

## How to re-run

```bash
# G1
Test-Path public/brand/vernatun-logo.png

# G2 + G3 + G4 unit
npx tsx memory/waves/2026-10-18-phase1-logo-html/_verify-g234.ts

# G5
(Get-ChildItem "docs/карусель тест/phase1-logo-html-smoke/*.png").Count
# expect 6

# G3/G4 smoke artifact check
Get-Content "docs/карусель тест/phase1-logo-html-smoke/asserts.json"

# Optional full re-smoke (no paid gen)
npx tsx scripts/smoke-phase1-logo-recomposite.ts

# G6
rg -i "name right of logo|name-right-of-icon|logo image only" lib/studio/create-carousel-prompts.ts
```

---

## P2 notes (NOT Phase 1 FAIL)

1. **Placement BR vs vision etalon TL:** Architect lock `placement_br` = default **bottom-RIGHT**. Backend smoke Phase1 uses `data-placement="bottom-right"`. Prior vision-style-copy smoke HTML used **`top-left`**. Do **not** FAIL Phase 1 for BR — Architect did **not** lock top-left. Optional later wave: align vision hard-copy / etalon slot map with product BR default if Client wants etalon parity.  
2. **Stale CSS comments** in `carousel-layered-composite.ts` (~1134 / ~1156) still say «name RIGHT of icon» — comments only; runtime branch is logo-only when `logoUrl`. Cosmetic cleanup OK for Fixer/chore, not G6 FAIL.

---

## Regression class (do not reopen)

- Dual-path `logoRef` / `logoRefRaw` KEEP (`lib/intake/placeholders.ts`).  
- S57 layered HTML only — no logo bake into image-model bg this phase.  
- shell_freeze: no AppShell / nav chrome.  
- No Phase 2 fonts / Phase 3 character.

`🧪 **ТЕСТИРОВЩИК:** G1–G6 GREEN · guards.md · Fixer skip`
