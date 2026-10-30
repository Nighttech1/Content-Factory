# C-154 — Carousel live images (Polza aggregator)

**Goal:** When `AGGREGATOR_API_KEY` is set, Designer for `carousel-engine` generates real Instagram 4:5 slide images via Polza. Soft-fail to picsum mock otherwise.

**Default model:** `google/gemini-2.5-flash-image` (env override `CAROUSEL_IMAGE_MODEL`).

**Proven Polza flow:**
1. `POST {base}/images/generations` → 201 `{ requestId }` (or sync `data[0].url`)
2. Poll `GET {base}/media/{requestId}` until `completed` → `data.url`
