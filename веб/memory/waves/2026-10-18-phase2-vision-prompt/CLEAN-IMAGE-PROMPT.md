# CLEAN IMAGE prompt — user review artifact (Phase 2)

**Status:** CANON for `buildVisionRefBackgroundImagePrompt` (from `IMAGE-PROMPT-AUDIT.md`)  
**Reviewed:** wave implement turn 2026-10-18 (Architect locked Path A; user asked implement after audit)

---

## Final text → IMAGE LLM

**Input:** text below + **one attached etalon PNG** (slot cover/midA/midB/cta).  
**Output:** background plate only, 4:5, no letters/logos.

```text
You are generating ONE Instagram carousel BACKGROUND plate (vertical 4:5).

ATTACHED IMAGE = STYLE + COMPOSITION source of truth (etalon slide for this slot).
HARD-COPY from the attached image:
- overall layout balance and empty vs filled zones
- how much of the frame is solid plate / color field vs photo or object
- object placement and scale (inset / partial / full-bleed ONLY if the etalon does that)
- lighting mood and material language of the etalon (do NOT invent a new design system)

OUR CONTENT (subject only — not layout):
- Topic object / scene subject: {{VISUAL_SUBJECT}}
- Slide {{N}} of {{TOTAL}}
{{CONDUCTOR_BLOCK}}

STRICT BANS (pixels):
- NO text, letters, numbers, captions, watermarks
- NO logos, brand marks, UI badges, buttons
- NO slideshow chrome

DO NOT:
- force a stock orange/white palette table
- force “always solid plate + one 3D house-like object” if the etalon shows otherwise
- force photoreal/CGI/Pixar restyle against the etalon’s drawing language
- expand the subject into a busy full-room lifestyle set unless the etalon is that set

Return a single background image that a human would recognize as the SAME layout grammar as the attached etalon, with our subject swapped in.
```

### Placeholders

| Token | Rule |
|-------|------|
| `{{VISUAL_SUBJECT}}` | ≤120 chars from visual_prompt/primary; strip full-room kitchen invent when etalon is object-on-plate |
| `{{N}}` / `{{TOTAL}}` | 1-based slide index / total |
| `{{CONDUCTOR_BLOCK}}` | If `character_paint=in_image` AND cover|cta: `optional conductor matching catalog identity — same drawing language as etalon, not 3D Pixar invent`. Else omit or `no character on this plate`. |

### Must NOT appear (scrub list)

- `#FF5A1F` / forced `idx % 2` orange/white plate lines  
- `Photoreal/CGI single object` / house-object lock  
- Manrope / Cormorant / `typography.scale` / FULL DESIGN TOKEN (Designer path)  
- Bake logo / wordmark into pixels  
- Forced Pixar / toy-3D character language  

### After sanitize

`sanitizeBackgroundImagePrompt` appends HARD NO TEXT / NO LOGO (KEEP).
