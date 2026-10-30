# Tester report — 2026-10-18 Phase 1 · Vernatun wordmark HTML logo

**Role:** Тестировщик (step 3)  
**Date:** 2026-10-18  
**Wave:** `2026-10-18-phase1-logo-html`  
**Guards file:** `memory/waves/2026-10-18-phase1-logo-html/guards.md`  
**Verdict:** **PASS** (G1–G6 all green) · **Fixer needed: NO**

---

## Summary table

| Guard | Result |
|-------|--------|
| G1 `public/brand/vernatun-logo.png` exists | **PASS** |
| G2 `DEFAULT_LOGO_REF` = `/brand/vernatun-logo.png` | **PASS** |
| G3 `logoUrl` → no `.brand-name` element in emitted HTML | **PASS** |
| G4 without `logoUrl` → `brandName` text still possible | **PASS** |
| G5 smoke dir has 6 PNG | **PASS** |
| G6 prompt hints no longer HARD «name right of icon» for wordmark | **PASS** |

**Score: 6/6 PASS**

---

## What was run

1. Read `architect-spec.md`, `backend-report.md`, `chain.md`, tester skill.  
2. **G1:** filesystem — PNG present, 238444 bytes.  
3. **G2:** grep + `defaultBrandSettings()` via `_verify-g234.ts` → `/brand/vernatun-logo.png`.  
4. **G3/G4:**  
   - Code branch in `carousel-layered-composite.ts` (~1295–1300): `logoUrl` → `<img>` only; else `.brand-name`.  
   - Unit: `npx tsx memory/waves/2026-10-18-phase1-logo-html/_verify-g234.ts` → **ALL PASS**.  
   - Smoke HTML `slide_01…06.html`: 0× `<div class="brand-name">`; all `data-placement="bottom-right"`; `asserts.json` = 13 PASS lines + `brandNameHits: 0`.  
5. **G5:** 6 PNG under `docs/карусель тест/phase1-logo-html-smoke/`.  
6. **G6:** `create-carousel-prompts.ts` LOGO hint supersedes name-right for wordmark; grep found **no** remaining HARD «name right of logo icon» requirement.

---

## Notes (non-blocking)

### P2 — Logo corner: product BR vs vision TL (not Phase 1 FAIL)

- **Architect HARD keep:** `placement_br` → default **bottom-RIGHT** (not top-left).  
- **Backend / Phase1 smoke:** wordmark at **bottom-right** — correct for this wave.  
- **Vision-style-copy source plates** (`vision-style-copy-smoke-A-in-image-6/slide_*.html`) still show brand `data-placement="top-left"` (etalon/vision hard-copy era).  
- Per Orchestrator instruction: flag as **P2 note only** — do **not** FAIL Phase 1 unless Architect locked top-left (they did not).

### P2 — Stale composite CSS comments

Comments near `.brand` / `.brand-name` CSS still mention «name RIGHT of icon». Runtime emit is Phase1-correct. Optional comment cleanup — not a guard FAIL.

### CSS rule vs element

`.brand-name { … }` may remain in stylesheet for fallback — guards assert **absence of the HTML element** when `logoUrl` is set (Backend note confirmed).

---

## Fixer

| Needed? | Targets |
|---------|---------|
| **NO** | — |

No product code failures on G1–G6. Chain step 4 (Fixer) → **skip**.

---

## Handoff

→ Orchestrator: Phase 1 Tester **GREEN**. Optional Deployer/Client only if separately armed.  
→ Next product phases (fonts / characters) out of this wave.

`🧪 **ТЕСТИРОВЩИК:** G1–G6 PASS · guards.md + tester-report.md · Fixer skip · P2: vision TL vs product BR`
