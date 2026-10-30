# Chain — C-carousel-css-vars-builder

> **Канон пачки:** `memory/waves/W-2026-10-13-visual-deconstructor/chain.md`  
> Этот файл — pointer. Backend owns `carousel-html-renderer` → `carouselHtmlBuilder`; FE binds Create preview after.

**One-liner:** CSS vars + cover/body/cta kits; sliced 4:5 PNG ≤40; alias carouselHtmlBuilder; artifacts folder.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | AI Bridge | create-carousel prompts: vars + kits + sliced-only | [ ] | Wave step 1 |
| 2 | Backend | `lib/studio/carousel-html-renderer.ts` evolve | [ ] | Wave step 2 |
| 3 | Frontend | Create preview N×4:5 bind | [ ] | Wave step 3b |
| 4 | Deployer | copy PNGs → `generatedMedia/wave-visual-deconstructor/` | [ ] | Wave step 6 |
| 5 | Tester / Fixer / Client | wave chain | [~] | Tester PASS; Fixer done (CTA pill + role unify + regen PNGs) — Client S44.B pending |
