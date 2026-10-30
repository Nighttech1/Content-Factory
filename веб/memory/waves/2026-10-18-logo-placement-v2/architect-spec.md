# Architect spec — logo-placement-v2 (2026-10-18)

**Wave:** `2026-10-18-logo-placement-v2`  
**Trainer:** `memory/trainer/2026-10-18-logo-placement-v2-grade.md` (C→B)  
**Canon:** `plugins/trainer/logo-placement-v2.md`  
**ticket_limit:** `full-queue`  
**shell_freeze:** AppShell / left nav — **true**

## Goal (plain language)

Put the **new** Vernatun logo into the brand folder with a **clear background** (no black plate). On carousel slides: logo **only as image** (no extra name text). On the **title** and **last** slide — logo **top-left**; on **middle** slides — **bottom-left**. Make the logo **twice as big** as today (88→176). Do **not** touch fonts or characters.

## HARD locks

| # | Lock | Acceptance |
|---|------|------------|
| 1 | Source PNG (Cursor assets path in brief) | File exists; used as install input |
| 2 | Install → `public/brand/vernatun-logo.png` with alpha (strip near-black matte) | PNG has transparent pixels; no opaque black plate behind mark |
| 3 | `DEFAULT_LOGO_REF` stays `/brand/vernatun-logo.png` | brand-store path unchanged |
| 4 | Role placement: cover / last(cta) → `top-left`; body → `bottom-left` | `resolveLogoPlacement` + vision hardcopy + fallback layouts |
| 5 | `BRAND_LOGO_SIZE_PX` = **176**; CSS max-width/height auto (no squash) | Composite CSS uses 176 |
| 6 | Logo-only when `logoUrl` (no `.brand-name`) | KEEP Phase1 |
| 7 | No Phase2 fonts / Phase3 character | Out of scope |

## Surfaces (thin)

| Path | Change |
|------|--------|
| `public/brand/vernatun-logo.png` | Replace bytes; strip black matte via sharp |
| `lib/settings/brand-store.ts` | KEEP `DEFAULT_LOGO_REF` |
| `lib/studio/carousel-layered-composite.ts` | size 176; role-aware `defaultLogoPlacementForRole` + `resolveLogoPlacement`; fallback synth; `.brand img` max-width/height auto |
| `lib/studio/designer-variant-a-pack.ts` | vision hardcopy logo by role (not all top-left) |
| `lib/studio/create-carousel-prompts.ts` | thin text: role defaults (not global bottom-RIGHT) |
| `lib/studio/carousel-json-contract.ts` | comment + zod default → `bottom-left` (body SoT) |
| Smoke | `docs/карусель тест/logo-placement-v2-smoke/` — 6 PNG re-composite from vision/phase1 bgs |

## Non-goals

- Phase 2 fonts / type scale / vision prompt rewrite  
- Phase 3 character / cutout  
- `.brand-name` return  
- Bake logo into image-model bg  
- VPS / publish / DB wipe  
- AppShell redesign  

## Done when

1. Transparent `public/brand/vernatun-logo.png` from lock #1  
2. Cover+last composites `data-placement="top-left"`; body `bottom-left`  
3. Size constant 176; smoke folder has 6 PNGs  
4. Reports: this file + `chain.md` + `backend-report.md`  
