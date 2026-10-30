# Guards — C-s54-anchor-draw

- [x] Cover drawn before slides 2–N (sequential loop)
- [x] Live continuity: `image_ref_generations` (Path A2)
- [x] `isCarouselAnchorRef` / `CAROUSEL_DRAW_MODE=anchor_ref` gates mode
- [x] Default Create one-shot unchanged when mode unset
- [x] Writes under `pipeline=anchor_ref_pipeline/{theme}/slide_0N.png`
- [x] `html_overlay: none` / E2E type-in-pixels
