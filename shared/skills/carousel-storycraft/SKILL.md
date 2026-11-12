---
name: carousel-storycraft
description: Designs Vernatun carousels with an end-to-end composition plan and gated Art Director → Generation → Bake → internal Client Design Acceptance chain.
---

# Carousel storycraft

## Non-negotiable production chain

No production without ID, approved script, references and brief.

1. Script approval by Art Director.
2. Architect + Art Director define the final slide composition before prompting: text amount, heroine placement, visual focal point, typography zone, logo contrast and intended density.
3. Art Director writes the visual system and generation prompt from that final composition. A prompt may not request a generic empty panel or a blank left half unless the composition explicitly uses that space.
4. Generate the background/AI-art with the heroine reference.
5. Art Director accepts or returns the generated frame.
6. Bake receives only accepted frames and adds the extracted logo plus HTML/CSS/SVG elements.
7. Art Director accepts or returns the baked frame.
8. QA/editor checks export.
9. Internal Client Design Acceptance checks the finished contact sheet and every slide against the criteria below.
10. External client receives only a result marked CLIENT_DESIGN_ACCEPTED.

Any failed gate blocks the next stage.

## Asset and composition rules

- The supplied example image is used only to crop the official Vernatun logo. Never use its whole scene as a background or silently copy its people/text.
- Every generated background must include the Vernatun heroine from the approved reference set. Record the exact heroine reference and pose.
- Maintain a pose registry. No identical pose, camera angle or gesture may repeat inside one carousel. Prefer not to reuse a pose from recent jobs; if reuse is unavoidable, record the reason.
- Generated art must contain no logo, pseudo-text, UI, cards, panels or decorative text containers. Bake owns all text blocks.
- Hook/final may contain AI-generated typography, but it must be composed as a complete visual, not placed into an accidental empty zone. The logo still comes from the extracted reference asset.
- Middle dictionary slides contain exactly three Armenian phrases with Russian translations in HTML/CSS/SVG.
- Text cards are compact: padding is proportional to the text, line lengths are intentional, and a card may not be 1.5× larger than its content without a documented composition reason.
- No nested blocks: a text card may not sit inside a second translucent panel. One text block = one deliberate visual container.
- Text cards may never cover the heroine's face, hands or main gesture. The composition must reserve the reading path around the heroine, not on top of her.
- Typography follows design.md and brand-kit: Century Gothic for Russian/Latin, Noto Sans Armenian for Armenian. System fonts are not an acceptable primary fallback.
- Logo contrast is selected per background: black or white approved derivative, whichever passes readability. Logotype must remain fully legible.
- Empty space is not a design requirement. It must be intentionally used by typography, a visual motif, architecture or atmosphere; otherwise the background composition is rejected.

## Internal Client Design Acceptance criteria

- Contact sheet and every slide reviewed at full size.
- No repeated pose/angle within the carousel.
- No card/panel over the heroine's face, body focal point or gesture.
- No unexplained empty half of canvas.
- No nested panels and no cards generated into the background.
- Card padding, text scale and line breaks look intentional on a phone.
- Exact font or approved Armenian fallback is loaded.
- Logo wordmark is readable against its local background; switch black/white derivative when necessary.
- Hook, middle slides and CTA are visually balanced as one system.
- Any failure returns to Fixer; no `CLIENT_DESIGN_ACCEPTED` is issued.

## Art Director return criteria

Return immediately for missing heroine, repeated pose, wrong pose, whole-reference reuse, wrong/generated logo, low-contrast logo, wrong logo position, AI pseudo-text, generated cards/panels, unexplained empty space, text covering heroine, oversized cards, nested blocks, poor composition, mismatch between background and bake, unsafe margins, incorrect phrase count, weak contrast or any divergence from the reference.

## Validation

Check 1080×1350, 7–8% safe-zone, mobile readability, font/fallback, heroine reference/pose registry, extracted logo source and contrast variant, asset rights, exact copy and export. Never report acceptance without visual evidence.