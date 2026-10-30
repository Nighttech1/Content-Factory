# C-s54-anchor-draw — decisions

## Probe (Path A vs B)

| Attempt | Endpoint / shape | Result |
|---------|------------------|--------|
| A1 | `POST /images/edits` multipart (`image` + prompt) | Tried first on slides 2–N; if 2xx+URL → `continuity=image_edit` |
| A2 | `POST /images/generations` JSON with `image` / `image_url` / `images[]` | Second try → `continuity=image_ref_generations` |
| B | `POST /images/generations` prompt-only | Fallback → `continuity=prompt_only` + MASTER STYLE restated in prompt |

**Live bakeoff result (2026-10-17):** slides 2–N used **`image_ref_generations`** — `POST /images/generations` accepted cover as `image` / `image_url` data-URL (edits multipart not required). Recorded in bakeoff `README.md` + `C-s54-bakeoff-pack/decisions.md` (no secrets).

## Code

| Item | Lock |
|------|------|
| Helper | `generateAggregatorImageWithOptionalRef` (+ `generateAggregatorImageEdit` alias) |
| Gate | `opts.drawMode: "anchor_ref"` or `CAROUSEL_DRAW_MODE=anchor_ref` via `isCarouselAnchorRef()` |
| Default Create | unchanged one-shot Phase4 when mode unset |
| Model | `openai/gpt-5.4-image-2` |
| Algorithm | cover first → persist PNG → 2–N with ref path + MASTER STYLE prompts |
| html_overlay | none (E2E type-in-pixels) |
