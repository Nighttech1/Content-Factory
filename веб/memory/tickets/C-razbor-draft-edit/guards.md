# Guards — C-razbor-draft-edit (S52.B)

## Class of defect

Opening an existing carousel draft still shows «Начать разбор»; RIGHT stays competitor-only; no «Выбрать» / comparison square; draft context missing from chat.

## Permanent checks

1. **Static / smoke** (`scripts/smoke-w-2026-10-16-design-razbor-quality.ts`):
   - `RazborModal.tsx`: `isRazborDraftEditMode` → `draftEditMode`; `showWelcomeCta = !draftEditMode && …`; `data-testid="razbor-start-btn"` only when `showWelcomeCta` (hidden in draft-edit).
   - `RazborCompetitorPickChrome` wired; testids:
     - `razbor-competitor-pick-chrome`
     - `razbor-competitor-vybrat` (label **Выбрать**)
     - `razbor-comparison-square`
   - `lib/studio/razbor-draft-context.ts`: `isRazborDraftEditMode` + `buildRazborDraftCarouselContext` exported.

2. **Client S52.B (Playwright @1440)** — Черновики → open draft: RIGHT = that carousel; no start btn; Выбрать+square; redraw same `draft.id`.

## Evidence

- Smoke green: ticket **PASS** (2026-10-16).
- Wave: `memory/waves/2026-10-16-design-razbor-quality/`
- Regression row: `.cursor/skills/client-review/regression-guards.md` (S52 section).

## Rerun

```bash
npx tsx scripts/smoke-w-2026-10-16-design-razbor-quality.ts
```
