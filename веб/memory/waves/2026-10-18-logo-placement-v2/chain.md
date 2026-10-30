# Chain — logo-placement-v2

```text
Trainer ✅ (grade C→B · plugins/trainer/logo-placement-v2.md)
  → Architect ✅ (this wave: architect-spec.md + chain.md)
  → Backend (PNG+alpha · BRAND_LOGO_SIZE_PX=176 · role placement · thin prompts · smoke 6)
  → Tester (guards: alpha; cover/cta top-left; body bottom-left; size 176; no .brand-name)
  → Deployer (localhost if needed)
  → Client (Playwright HARD GATE @1440 → cycle until «согласовано»)
```

## Path lock (Backend)

1. Install source → `public/brand/vernatun-logo.png` (strip near-black → alpha)
2. `lib/studio/carousel-layered-composite.ts` — size + role placement SoT
3. `lib/studio/designer-variant-a-pack.ts` — vision hardcopy role slots
4. `lib/studio/create-carousel-prompts.ts` + `carousel-json-contract.ts` — thin align
5. Smoke script → `docs/карусель тест/logo-placement-v2-smoke/`

## Overlap

Do **not** parallel Frontend / Motion / AI Bridge / Phase2 / Phase3.

## ticket_limit

`full-queue` — cycle Client C-* until «согласовано».
