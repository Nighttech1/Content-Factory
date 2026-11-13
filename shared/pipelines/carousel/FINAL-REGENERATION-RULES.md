# Final regeneration rules — carousel type 1

- Use the current logo assets from `projects/vernatun/brand/assets/`, never an older crop.
- Default logo placement is equal safe-zone offsets from top and right; current template is 1.5× the former logo size.
- If neither dark nor light wordmark is readable on the local patch, add a small dark semi-transparent contrast patch only beneath the wordmark in the top-right logo zone, then use the light logo. It must not become a general background plate, cover the emblem, or sit under any content card.
- For dialogue scenes, eye-line is a hard acceptance gate: the heroine must look at the other person's face/eyes. Ceiling/empty-space gaze returns the background to generation.
- **Scene exclusion:** this is a modern conversation club, not a classroom. Reject whiteboards, chalkboards, lecture layouts, lesson desks, school furniture, teaching props and classroom compositions.
- **Pose registry gate:** every slide gets a pose ID, gaze direction, camera angle and main gesture. No pose ID, silhouette, camera angle or main gesture may repeat within one carousel. Three near-duplicates is an automatic return to Art Director.
- Type 1 cards use exactly three visible lines with no blank lines: Armenian, transliteration, Russian translation.
- Cards must be orange/terracotta with white text. No white cards, grey cards, grey shadows, nested cards, translucent panels under cards, or extra empty padding rows.
- Card height is calculated from the actual three text lines plus compact padding; unused vertical space greater than one line-height is a bake failure.
- Card positions may vary rhythmically, but cards must not form a rigid stack and may not cover the heroine's face, hands or key gesture.
- Add a clear swipe arrow in the bake layer to every slide except the final CTA. The arrow is its own small navigation element, never a grey panel underneath a text card.
- Final CTA typography must be a strong editorial composition across the upper-middle/central visual field, not a small top-left caption.
- The Art Director must inspect each slide full-size and at mobile scale before `CLIENT_DESIGN_ACCEPTED`.

## Canonical typography

- Main Vernatun font: **Noto Serif Display Black 900**.
- Load only `shared/brand/fonts/NotoSerifDisplay[wdth,wght].ttf` and set `font-weight: 900` for hook, headline and final CTA.
- Dates/subheads use the same family at `600–700`.
- Missing primary font or silent system fallback = `FONT_PRIMARY_MISSING` and mandatory return to Bake.

## Mandatory reject conditions

Reject and return to the responsible stage if any of the following is found: classroom/whiteboard scene; repeated pose; heroine looking into empty space during dialogue; logo without approved asset; logo unreadable; grey or white dictionary cards; nested or secondary translucent panel; excessive empty card space; blank lines; stacked cards; missing swipe arrow; CTA trapped in the top-left corner.