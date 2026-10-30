# Decisions — C-37

## D1 — Server-only IG

Browser never calls Graph / Business Discovery. UI trusts `GET /api/studio/carousel-engine/feed` only.

## D2 — Badge source of truth

Use top-level `FeedResponse.sourceMode` for the workspace badge. Per-post mode used for Razbor copy / optional subtle card hint if mixed.

## D3 — Slides priority

`slideUrls` from feed win over picsum. If live post has empty `slideUrls`, fall back to `thumbUrl` single-slide, then picsum only as last resort (should be rare).

## D4 — Motion default skip

Do not open Motion by default; only if Tester finds broken slide transitions with variable `slideUrls.length`.

## D5 — Frontend (C-37)

- Badge: reuse adapted `NeonBadge` (`21st=reuse`, no new MCP). Copy: live → «Онлайн · Instagram», mock → «Демо-данные»; `data-testid="feed-source-badge"`.
- `buildCompetitorSlides`: `slideUrls` → live thumb single → picsum synthetic (mock).
- Cards: metrics unchanged; optional `@username`; `onError` → gradient placeholder, card stays.
- Motion: skipped (D4).
