---
name: carousel-visual-design
description: Senior visual design and pre-ship QA for Vernatun carousels: composition, pose variety, typography, card density, logo contrast and mobile readability.
---

# Carousel visual design

Use this skill after the script map and before background generation, then again after bake.

## Design-first rules

- Design the final slide composition before writing the generation prompt.
- Treat whitespace as an intentional compositional element, not a default empty panel.
- Use one visual hierarchy: focal heroine, reading path, text, then logo.
- Keep text containers compact and content-led; never stack a card inside another card.
- Reserve a clear reading path around the heroine. Never cover face, hands or key gesture.
- Track poses and camera angles in a registry; avoid repeated pose language in the same carousel.
- Lock brand typography: Century Gothic for Russian/Latin, Noto Sans Armenian for Armenian.
- Select black or white logo derivative by local contrast and inspect the wordmark at phone scale.

## Pre-ship visual QA

1. View the whole contact sheet for rhythm and repeated poses.
2. View every slide at full resolution.
3. Check hierarchy, alignment, spacing, contrast, typography, line breaks and mobile readability.
4. Check background-to-bake integration: no generated cards, pseudo-text or duplicated panels.
5. Check that every defect has a disposition: fix, regenerate or explicit accepted exception.
6. Ship only after `CLIENT_DESIGN_ACCEPTED`.

## External design references used

- Microsoft frontend-design-review quick checklist: https://github.com/microsoft/skills/blob/main/.github/skills/frontend-design-review/references/quick-checklist.md
- Designer-to-dev-handoff design QA checklist: https://github.com/SkillMedev/designer-to-dev-handoff/blob/main/skills/design-qa-checklist/SKILL.md
- Claude design standards and pre-ship checklist: https://github.com/rampstackco/claude-skills/tree/main/skills/design-standards
- Social media graphic skill: https://github.com/ArnavPuri/designskills/blob/main/skills/social-media-graphic/SKILL.md
- Taste skills for hierarchy, typography and spatial rhythm: https://github.com/Dragoon0x/taste-skills

These references are design inputs, not replacements for Vernatun brand/design.md or the carousel pipeline.