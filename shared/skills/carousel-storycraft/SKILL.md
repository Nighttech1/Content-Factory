---
name: carousel-storycraft
description: Designs Vernatun carousels with a gated Art Director → Generation → Bake → Art Director acceptance chain.
---

# Carousel storycraft

## Non-negotiable production chain

No production without ID, approved script, references and brief.

1. Script approval by Art Director.
2. Art Director writes the visual system and generation prompt.
3. Generate the background/AI-art.
4. Art Director accepts or returns the generated frame.
5. Bake receives only accepted frames and overlays HTML/CSS/SVG elements.
6. Art Director accepts or returns the baked frame.
7. QA/editor checks export.
8. Client explicitly accepts before publication.

Any failed gate blocks the next stage.

## Dictionary class

- Hook: one strong AI-typographic phrase in the approved brand style, using the supplied visual reference. The hook is not replaced with a generic HTML card.
- Middle slides: exactly three Armenian phrases per slide, with Russian translations in HTML/CSS/SVG.
- Final: one AI-typographic invitation phrase in the approved brand style plus the approved logo treatment.
- Logo: use the supplied logo reference; never invent, redraw or silently substitute it.
- Background generation prompt must forbid random letters, pseudo-text, extra logos and UI.
- Every accepted asset gets a status and reason in the manifest.

## Art Director return criteria

Return immediately for wrong logo/position, AI pseudo-text, poor composition, wrong heroine pose, unreadable text area, mismatch between background and bake, unsafe margins, incorrect phrase count, weak contrast or any divergence from the reference.

## Validation

Check 1080×1350, 7–8% safe-zone, mobile readability, font/fallback, logo source, asset rights, exact copy and export. Never report acceptance without evidence.
