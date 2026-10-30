# Status — C-142

| Field | Value |
|-------|-------|
| **Status** | Frontend done |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Updated** | 2026-10-10 |

## Root cause (Frontend)

Cold open `/studio/[moduleId]` blocked perceived first paint on:

1. **Blocking feed fetch** — `feedLoading=true` with empty arrays until `/api/studio/.../feed` (Apify/Graph) returned → dual-carousel skeletons / empty chrome.
2. **Eager client chunk** — `GenerationDrawer` synced into workspace graph (Razbor/Create already dynamic).

## Frontend [x]

- `lib/studio/feed-client-cache.ts` — `bootstrapFeed` (fixtures), `cf.studio.feed.cache.v1:<moduleId>`, `FEED_FETCH_TIMEOUT_MS=8000`
- `StudioModuleWorkspace.tsx` — paint fixtures immediately; `useLayoutEffect` applies last-known cache; live fetch in background; swap in place (no blank); soft-fail on timeout/network keeps fixtures/cache; soft refetch hint via `feedRefreshing`
- Dynamic: RazborModal, CreateCarouselModal (existing) + **GenerationDrawer** (C-142). `VerticalPostCarousel` kept sync (first-viewport cards).
- API `?fast=1` — fixtures/empty without Apify (optional helper)

## Rough before / after (perceived)

| Metric | Before (observed behavior) | After (expected) |
|--------|---------------------------|------------------|
| First paint with title + cards | Waited on Apify/network (often multi-second blank/skeleton) | **Immediate** fixtures or localStorage cache — **first paint no longer waits Apify** |
| Live «Онлайн» / usernames | Same as first paint (gated) | Background swap when feed returns (&lt;8s); else keep demo/cache |
| Workspace JS on open | Drawer in initial graph | GenerationDrawer code-split |

Exact cold-click ms → Tester `guards.md` (chrome-devtools / Playwright). Do not claim numeric win here without measure.

## Next

Backend (skip if contract OK) → Tester → Fixer → Deployer → Client
