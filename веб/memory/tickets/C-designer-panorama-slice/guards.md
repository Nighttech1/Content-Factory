# Guards — C-designer-panorama-slice (+ Scriptwriter captivating hook)

Wave: `W-2026-10-13-designer-models-colors-hook` · Scenario: **S45.B**

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `CREATE_CAROUSEL_DESIGNER_*` overlays: panorama→slice HARD; NEVER panorama-only Create preview. |
| G2 | Scriptwriter overlay: captivating curiosity-gap hook; FAIL flat hooks list. |
| G3 | `export function assertSlicedCreatePreview` in `lib/studio/carousel-media-urls.ts`. |
| G4 | `app/api/studio/agent-chat/route.ts` calls assert; rejects with `panorama_preview_rejected`. |
| G5 | `CreateCarouselPreview` documents sliced-only (no panorama strip as product preview). |
| G6 | Runtime: N distinct URLs OK; shared URL / count mismatch → reject. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts
# Expect: assertSlicedCreatePreview* PASS + SMOKE_…_OK
```

Live Client: **S45.B** — Create draw preview = N×4:5 sliced; cover hook captivating.

## Class of defect

Panorama-only Create preview; missing assert/reject path; flat cover hooks in Scriptwriter prompts.
