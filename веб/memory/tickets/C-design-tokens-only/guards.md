# Guards — C-design-tokens-only (S52.A)

## Class of defect

Settings Design reintroduces COVER/BODY/CTA sliced role kits, button layout kits, or layout markup in agent payload; toolbar returns to `justify-end` under Settings nav.

## Permanent checks

1. **Static / smoke** (`scripts/smoke-w-2026-10-16-design-razbor-quality.ts`):
   - `DesignLibraryCarousel.tsx` — no `SlicedSlotPreview` import/JSX; no `data-testid="sliced-slot-preview"`; no role-kit chrome.
   - Toolbar `data-testid="design-library-toolbar"` has `data-align="left"` + `justify-start` (not `justify-end` under nav).
   - `BrandbookBoard` — no `brandbook-buttons-card` / Primary·Ghost·CTA kit.
   - `QuickThemeTuner` — no `SlicedSlotPreview`.
   - `buildDesignTokensPayload` / `formatActiveDesignMdForPrompt` — token fields only (`colors`, `typography`, `textBlock`, `smallElement`); no COVER/BODY/CTA layout markup keys in payload body; TOKENS ONLY wording + strip filter for role-kit MD lines.

2. **Client S52.A (Playwright @1440)** — `/settings` → Дизайн: brandbook tokens cards only; toolbar left of right nav; no sliced strip.

## Evidence

- Smoke green: `npx tsx scripts/smoke-w-2026-10-16-design-razbor-quality.ts` → ticket **PASS** (2026-10-16).
- Wave: `memory/waves/2026-10-16-design-razbor-quality/`
- Regression row: `.cursor/skills/client-review/regression-guards.md` (S52 section).

## Rerun

```bash
npx tsx scripts/smoke-w-2026-10-16-design-razbor-quality.ts
```
