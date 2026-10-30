# Guards — C-carousel-quality-etalon (S52.C)

## Class of defect

Product theme locked to coffee/jazz/club ritual; missing `generatedMedia/эталон карусели/`; live smoke exceeds 9 PNG or ships text-only slides.

## Permanent checks

1. **Static / smoke** (`scripts/smoke-w-2026-10-16-design-razbor-quality.ts`) — Tester owns:
   - `COMBAT_USER_BRIEFS["carousel-engine"]`: **TOPIC LOCK (HARD)** = user-only; explicit forbid coffee/jazz as default topic.
   - `create-carousel-prompts.ts`: `TOPIC = user only (HARD)`; forbid coffee/jazz default.
   - Folder `generatedMedia/эталон карусели/` exists + README + ≥9 reference PNGs (seed).
   - Script prepared: `scripts/live-gen-s52-armenian.ts` (Deployer runs LIVE).

2. **LIVE 9 PNG (Deployer owns — not Tester this pass):**
   - Budget ≤9 PNG (3×3); Armenian random pool; backgrounds via `openai/gpt-5.4-image-2`; overwrite `draft-s52-etalon-a|b|c`; no social publish.
   - After Deployer: assert `_png_budget.json` ≤9 + slides have images (not text-only).

3. **Client S52.C** — side-by-side vs etalon (Playwright + visual), not API-only.

## Evidence

- Smoke green (static + etalon seed): ticket **PASS** for Tester scope (2026-10-16).
- LIVE 9 PNG: **deferred to Deployer** — not run by Tester.
- Wave: `memory/waves/2026-10-16-design-razbor-quality/`
- Regression row: `.cursor/skills/client-review/regression-guards.md` (S52 section).

## Rerun

```bash
npx tsx scripts/smoke-w-2026-10-16-design-razbor-quality.ts
# LIVE (Deployer):
# npx tsx scripts/live-gen-s52-armenian.ts
```
