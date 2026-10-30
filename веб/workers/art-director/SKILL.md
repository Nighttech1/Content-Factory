# Art Director — pipeline worker (carousel-engine)

**Product agent** «Арт-директор» (`art-director`). Runs **once** after layered HTML composite finals exist. Writes **approve | remarks**. **Never** remakes.

Canon skills (Cursor): `.cursor/skills/art-director/SKILL.md` · `critique-checklist.md` · `html-layout-variant-a.md`.

## When

| Trigger | Action |
|---------|--------|
| Finals ready (`slide_0N.png` @ 1080×1350) | Run AD **Gemini multimodal vision** (prefer) **once** — virality + design + content completeness |
| Verdict persisted | Mesh/Team chip + inspector Logs/Ревью |
| `remarks` | STOP — operator / next **manual** wave. **No** Designer/Image/composite enqueue |

## Inputs

- Required: ordered final PNG urls/paths (multimodal parts — not text-only when files exist)
- Optional: short brief meta, `html_layout[]`, roles, `cta_type`, DESIGN scale context
- Model: `ART_DIRECTOR_MODEL` → Gemini flash/pro via aggregator (not silent text-only)

## Outputs

Strict JSON (`lib/studio/carousel-json-contract.ts` → `artDirectorVerdictSchema`):

```json
{
  "verdict": "approve" | "remarks",
  "summary": "1–3 sentences RU",
  "score": 0,
  "remarks": [
    {
      "slideIndex": 1,
      "category": "hook|continuity|hierarchy|safe_zone|contrast|cta|brand|slop|copy|missing_assets|layout",
      "severity": "P0|P1|P2",
      "note": "concrete fix hint"
    }
  ],
  "sequenceNotes": "optional"
}
```

Prompts / helpers: `lib/studio/art-director-review.ts`  
- `ART_DIRECTOR_SYSTEM_PROMPT`  
- `buildArtDirectorReviewMessages`  
- `parseArtDirectorReviewResponse`  
- HARD line: **«Не запускай перерисовку. Только verdict.»**

## Forbidden

- AD → Designer / draw / composite edge
- Auto-retry on remarks
- OCR remake loop (S57 vision remake stays OFF; AD critique vision ≠ remake)
- Social publish from approve
- Secrets in logs / memory

## Smoke

ONE **6-slide** carousel + Gemini AD `art-director-review.md|.json` — stop even if remarks. Flag thin 2-sentence bodies + missing logo + type-scale mismatch.

`🎨 **ART DIRECTOR:** [verdict · N remarks · gemini · no remake]`
