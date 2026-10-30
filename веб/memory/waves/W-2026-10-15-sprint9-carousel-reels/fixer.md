# Fixer — W-2026-10-15-sprint9-carousel-reels (9.11 F-s9-11-a/b)

**Role:** Fixer · **Date:** 2026-10-15  
**Constraints:** `shell_freeze` / `no_pipeline_break` / surgical restore only  
**Did not touch:** AppShell / nav / agent-chat pipeline / smoke scripts

## Failures → cause → fix

### F-s9-11-a (S45 colors-only captions)

| Item | Detail |
|------|--------|
| **Commands** | `npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts` |
| **Was** | 22/24 FAIL — missing exact string `Только цвета — разметку придумает Дизайнер` in Settings Design UI + QuickThemeTuner |
| **Cause** | S51 Design cleanup dropped the S45 colors-only caption from `SettingsShell` / `QuickThemeTuner` |
| **Fix** | Restored caption under Design panel (`data-testid=settings-design-colors-only-caption`) and inside Tuner header (`data-testid=tuner-colors-only-caption`) |
| **Paths** | `components/settings/SettingsShell.tsx`, `components/settings/QuickThemeTuner.tsx` |
| **Result** | **PASS** 24/24 · `SMOKE_W_2026_10_13_DESIGNER_MODELS_COLORS_HOOK_OK` |

### F-s9-11-b (S44 Embla sliced preview)

| Item | Detail |
|------|--------|
| **Commands** | `npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts` |
| **Was** | FAIL ×2 — Embla must use `SlicedSlotPreview` + «Создать из референса»; panorama not sole preview |
| **Cause** | Brandbook-only drift: Embla slides rendered only `BrandbookBoard` @ 3:5; CTA label was short «референс» |
| **Fix** | Import + mount `SlicedSlotPreview` as **primary** slot preview; keep `BrandbookBoard` secondary; toolbar CTA → «Создать из референса»; comment + `data-preview=sliced-not-panorama` (never panorama sole) |
| **Paths** | `components/settings/DesignLibraryCarousel.tsx` (component already at `SlicedSlotPreview.tsx`) |
| **Result** | **PASS** · `SMOKE_W_2026_10_13_VISUAL_DECONSTRUCTOR_OK` |

## Re-run matrix (same commands)

| Script | Result |
|--------|--------|
| `npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts` | **PASS** |
| `npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts` | **PASS** |
| `npx tsx scripts/smoke-sprint9-fixtures.ts` | **PASS** (`ALL_OK`) |
| `npx tsx scripts/assert-sprint9-contracts.ts` | **PASS** (`CONTRACT_ASSERT_OK`) |

## Open (not this Fixer pass)

- **F-s9-11-c** (P2): live STRICT sample sizes + HITL / likeness rows — still open after a/b green.
- Chain step 12 remains **ongoing** until F-s9-11-c or Client closes 9.11; a/b smoke regressions closed.

## Pipeline / shell

- AppShell / nav: **untouched**
- `app/api/studio/agent-chat/route.ts`: **untouched**
- Smoke scripts: **not weakened**
