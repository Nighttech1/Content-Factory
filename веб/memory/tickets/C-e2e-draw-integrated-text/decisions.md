# Decisions — C-e2e-draw-integrated-text

| Lock | Implementation |
|------|----------------|
| `isCarouselE2eTextInImage()` | `CAROUSEL_E2E_TEXT_IN_IMAGE !== "0"` (default ON) |
| Primary path | `buildE2eIntegratedSlidePrompt` → `generateAggregatorImage` → download PNG |
| Skip overlay | No `carouselHtmlBuilder` / Playwright on E2E success |
| Result | `renderMode: "e2e_diffusion"`, `htmlFirst: false`, `e2eTextInImage: true` |
| sanitize | E2E: no «ABSOLUTELY NO readable text» suffix |
| Fallback | `CAROUSEL_E2E_FALLBACK_HTML=1` → `legacy_html_overlay` |

Documented in `.env.example`.
