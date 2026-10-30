# Decisions — C-21 Plugin Slot

## Persistence: hybrid (Backend owns JSON)

**Chosen:** hybrid — not localStorage-only.

| Layer | Role |
|-------|------|
| **Source of truth (SSR / Generate)** | `data/local/custom-modules.json` (gitignored via `data/local/*`) |
| **Write path** | `POST /api/modules/register` → upsert JSON + `registerModule` on server registry |
| **Read path for FE tiles** | `GET /api/modules/register` → `{ manifests }` (no `node:fs` on client) |
| **Optional FE mirror** | `localStorage` key `cf.customModules.v1` — Frontend syncs after Register / on boot for snappy UI; Generate still hits server registry |

### Why not localStorage-only

Studio Generate uses `POST /api/modules/[moduleId]/generate` → server `getModule`. Pure client registry would 404 `custom-*` after refresh. JSON + boot hydrate keeps Generate working after restart.

### Client / server boundary

- Studio tiles: `@/modules/manifests` (core 4) + FE merge of custom from GET/localStorage.
- Never import `@/modules/registry` or `custom-remote/persist` into Client Components.

### Id rules

- `custom-{slug}` from title; optional `id` must start with `custom-`.
- Reject reserved core ids: `carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`.

### Worker contract

HTTP POST JSON `{ action, … }` only — no remote code eval. Timeout → mock `{ mock: true }`.

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-19 | Architect | spec+chain | Done |
| 2026-09-19 | Backend | factory + register API + hydrate + persist | Done — see chain |
| 2026-09-19 | Frontend | modal + Add + GET/localStorage hydrate + store | Done — see chain |

## Rollback plan

1. Remove `app/api/modules/register/`, `src/modules/custom-remote/`, revert `registry.ts` / `run-module.ts` hydrate hooks.
2. Delete local `data/local/custom-modules.json` if present (safe; gitignored).
3. `status.md` → `rolled_back`; keep ticket folder.
