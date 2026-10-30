# Tester report — logo-placement-v2 (2026-10-18)

**Role:** Тестировщик  
**Spec:** `architect-spec.md` · Backend: `backend-report.md` · Chain: `chain.md`  
**Status:** **PASS** (G1–G6) · Fixer skipped

## Summary

Wave locks hold on disk: transparent Vernatun logo, size 176, role placement (cover/cta top-left · body bottom-left), logo-only chrome (no `.brand-name` when `logoUrl`), smoke 6 PNG with asserts all PASS.

## Guard results

| Guard | Status | Notes |
|-------|--------|-------|
| G1 logo exists + corner alpha | **PASS** | Sampled 8 corner/inset pixels — all `a=0`; ~475k transparent of 698k |
| G2 `BRAND_LOGO_SIZE_PX === 176` | **PASS** | Exported const = 176; smoke CSS max 176px |
| G3 placement cover/last/body | **PASS** | SoT + HTML `data-placement` match asserts map |
| G4 no `.brand-name` with logoUrl | **PASS** | 0 elements in all 6 HTML; `brandNameHits: 0` |
| G5 smoke 6 PNG | **PASS** | `slide_01.png` … `slide_06.png` present |
| G6 asserts.json 0 FAIL | **PASS** | 26 PASS lines, failCount 0 |

## Placement matrix (verified)

| Slide | Role (smoke) | `data-placement` |
|-------|--------------|------------------|
| 01 | cover | top-left |
| 02–05 | body | bottom-left |
| 06 | cta (last) | top-left |

## Artifacts

- Guards table: `memory/waves/2026-10-18-logo-placement-v2/guards.md`
- Smoke asserts: `docs/карусель тест/logo-placement-v2-smoke/asserts.json`

## Handoff

→ **Deployer** (localhost if needed)  
→ **Client** Playwright HARD GATE @1440 → «согласовано»  
→ **Fixer:** not invoked (0 FAIL)
