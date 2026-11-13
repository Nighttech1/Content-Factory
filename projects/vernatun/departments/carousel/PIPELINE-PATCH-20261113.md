# Pipeline patch — 2026-11-13

This patch is mandatory before the next carousel generation. No asset generation is authorized until these gates pass.

## Art Director background gate

Reject any frame that resembles a classroom: whiteboard, chalkboard, lecture layout, school desk, lesson props or teacher-facing composition. Vernatun scenes are modern social conversation spaces.

## Pose gate

Before generation, create a pose registry:

| slide | pose ID | camera | gaze target | gesture |
|---|---|---|---|---|

A repeated silhouette, camera angle, head direction or main gesture counts as a repeated pose. Three similar poses are never allowed. During dialogue, gaze target must be a person's face/eyes; ceiling/empty-space gaze is a hard reject.

## Bake gate

- Approved cards are orange/terracotta with white text.
- One card has one background shape. No white card, grey card, grey shadow plate, nested panel or second translucent layer beneath it.
- A type 1 card contains exactly three non-empty lines: Armenian, transliteration, Russian translation.
- Card height is derived from the text line count plus compact padding. Excess empty space returns to Fixer.
- Cards can be rhythmically offset but must not be a rigid vertical stack.
- Logo contrast patch is a separate, small top-right-only operation under the wordmark; it cannot appear under dictionary cards.
- Swipe arrow is a separate navigation element on slides 1–6 only.

## Final acceptance

Art Director checks every slide at full size and mobile scale. Any one failure returns the whole carousel to the responsible stage; it is not passed to Client Review.
