# Guards — C-reels-scriptwriter-upgrade

Wave: `W-2026-10-13-visual-deconstructor` · Scenario: **S44.C** (reels script)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `PIPELINE_COPY["custom-reels"]` agent = **Сценарист**; prompt requires hook **0–2s**, beats, CTA, `promptForMontage`. |
| G2 | Forbidden as primary deliverable: carousel `slides[]` 4:5 / `promptForDesigner`. |
| G3 | `lib/studio/reels-script-contract.ts` — `parseReelsScriptArtifact` rejects carousel-shaped payloads without hook. |
| G4 | Artifact shape: `contentType: "reels"`, `hook`, `beats[]` (≥2), `cta` (+ captionLine), `promptForMontage`. |
| G5 | Handoff target = **Монтажёр рилсов** (not Designer carousel paint). |
| G6 | **Razbor freeze**. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts
# Expect: SMOKE_W_2026_10_13_VISUAL_DECONSTRUCTOR_OK
```

Live Client: **S44.C** — `/studio/custom-reels` Сценарист → script with hook 0–2s + CTA.

## Class of defect

Carousel Dramaturgy JSON from reels agent; missing hook window / CTA / promptForMontage; wrong agent label.
