# C-scout-razvedat-ui — Frontend Mesh Scout

## UI

In `ScoutInspectorSettings` (tab «Разведка»):

1. **Авторазведка** block:
   - Platforms, topic, lookback (existing)
   - Filters: minViews (existing), **minLikes**, **minVirality** (0–100 score or ratio label «виральность»)
   - **frequencyHours** (number, e.g. 6 / 12 / 24) when autoRun
   - autoRun checkbox (existing)
2. Bottom sticky CTA **«Разведать»** (`data-testid="scout-razvedat"`) — calls `POST /api/studio/{pipelineId}/scout/run` with saved filters
3. Loading / last-run toast (`data-testid="scout-razvedat-status"`)

## Config (`scout-search-config.ts`)

Extend `ScoutSearchConfig`:
- `minLikes: number` (default 500)
- `minVirality: number` (default 0) — filter by popularity score threshold or views/followers proxy
- `frequencyHours: number` (default 12)

## Auto schedule (client)

When `autoRun` and Scout drawer open OR studio mounted for that module: if `now - lastRunAt >= frequencyHours`, call scout/run once; persist `lastRunAt` in localStorage. **Never** on competitors feed mount alone without autoRun due.

## AgentInspectorDrawer

For scout role: footer can keep Save; **«Разведать»** lives in scout settings bottom (primary CTA).
