# Guards — C-s9-09-smoke (Sprint 9.9)

**Class of defect:** pipeline break / soft-mock success / critic bypass / Create not starting Scriptwriter / S44–S46 contract drift.

## Executable guards (do not weaken)

| # | Guard | Command / assert |
|---|-------|------------------|
| G1 | Golden fixtures pass critic; weak fixtures reject | `npx tsx scripts/smoke-sprint9-fixtures.ts` → `ALL_OK` |
| G2 | STRICT + critic + handoff static + no-mock | `npx tsx scripts/assert-sprint9-contracts.ts` → `CONTRACT_ASSERT_OK` |
| G3 | S46 swipe META + CTA 1–4 + hint UI | `npx tsx scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts` → `SMOKE_…_OK` |
| G4 | S45 models + panorama→slice + colors-only | `npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts` → all PASS (**currently FAIL captions** → Fixer F-s9-11-a) |
| G5 | S44 sliced Embla + reels contract units | `npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts` → all PASS (**currently FAIL Embla** → Fixer F-s9-11-b) |
| G6 | Playwright Create @1440 | Navigate `http://localhost:3001/studio/carousel-engine` → click Create → modal with **Сценарист** selected + handoff to Designer control. Evidence: `playwright-create-1440.png` |
| G7 | No soft-mock on Create | `CREATE_CAROUSEL_NO_MOCK === true`; agent-chat critic fail → `source: "error"` |
| G8 | No social publish in Create Draft path | Publish/handoff persists `status: "unpublished"` draft only |

## Pipeline still present (static)

- Create: `handoffToDesigner`, start step `scriptwriter`, people tabs, `ScriptwriterCtaHint`.
- Razbor: `handoffNextForTab` scriptwriter→designer.
- API: `critiqueCarouselHandoff` / `critiqueReelsScript` before success Draft path.

## Skipped this run (not a pass)

- Full live LLM draw → sliced Draft preview.
- Live custom-reels generate → Draft.

Re-run G1–G6 after Fixer; do not mark Client ПРИНЯТО on API-only.

## Regression registry

`.cursor/skills/client-review/regression-guards.md` → section **W-2026-10-15 sprint9-carousel-reels**.
