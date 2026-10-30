# C-competitors-snapshot — Studio feed FE

## Behavior

- Mount / focus / remount / topic clear: `GET /api/studio/.../feed` — **snapshot only** (Backend guarantees 0 Apify)
- FE must NOT call `/scout/run` from StudioModuleWorkspace or VerticalPostCarousel
- Empty snapshot → empty competitors column (soft-fail), not mock when scraper configured
- After successful Scout «Разведать», Studio may refetch feed once (event `cf.scout.snapshot-updated` or manual refetch) — optional polish

## Done when

- Code grep: no `scout/run` from studio workspace/carousel
- Client S52.D: open competitors → no new Apify spend (Backend smoke + UI)
