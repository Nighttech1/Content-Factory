---
name: carousel-storycraft
description: Designs Vernatun carousels with a gated Art Director → Generation → Bake → Art Director acceptance chain.
---

# Carousel storycraft

## Non-negotiable production chain

No production without ID, approved script, references and brief.

1. Script approval by Art Director.
2. Art Director writes the visual system and generation prompt.
3. Generate the background/AI-art with the heroine reference.
4. Art Director accepts or returns the generated frame.
5. Bake receives only accepted frames and adds the extracted logo plus HTML/CSS/SVG elements.
6. Art Director accepts or returns the baked frame.
7. QA/editor checks export.
8. Client explicitly accepts before publication.

Any failed gate blocks the next stage.

## Asset rules

- The supplied example image is used only to crop the official Vernatun logo. Never use its whole scene as a background or silently copy its people/text.
- Every generated background must include the Vernatun heroine from the approved reference set. Record the exact heroine reference and pose.
- Generated art must contain no logo, pseudo-text or UI. Add the cropped logo during bake.
- Hook/final may contain AI-generated typography, but the logo still comes from the extracted reference asset.
- Middle dictionary slides contain exactly three Armenian phrases with Russian translations in HTML/CSS/SVG.

## Art Director return criteria

Return immediately for missing heroine, wrong pose, whole-reference reuse, wrong/generated logo, wrong logo position, AI pseudo-text, poor composition, mismatch between background and bake, unsafe margins, incorrect phrase count, weak contrast or any divergence from the reference.

## Validation

Check 1080×1350, 7–8% safe-zone, mobile readability, font/fallback, heroine reference/pose, extracted logo source and position, asset rights, exact copy and export. Never report acceptance without evidence.