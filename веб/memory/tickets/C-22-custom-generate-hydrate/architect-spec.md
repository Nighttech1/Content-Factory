# Architect spec — C-22 (surgical)

## Goal
After `POST /api/modules/register`, immediately `POST /api/modules/{customId}/generate` returns 200 mock (not `module_not_found`).

## Root cause (Client evidence)
One-shot `ensureCustomModulesHydrated()` + possible dual Next.js module instances for `registry.ts` Map: Register writes one Map; Generate hydrates once from older disk snapshot and never re-reads.

## Fix (Backend only)
1. Store `modulesById` + hydrate state on `globalThis` singleton (survive route bundle splits / HMR).
2. `ensureCustomModulesHydrated({ force?: boolean })` — force re-reads disk and upserts all custom records.
3. `requireModule` / `getModule` path: if id starts with `custom-` and missing → `force` hydrate once, then lookup again.
4. After successful `registerModule` in register route, optionally `force` hydrate is unnecessary if singleton Map shared — still call force hydrate on generate miss.

## Out of scope
M1–M4 adapter bodies, Plugin Slot UI, HeyGen secrets.

## Acceptance
POST register → POST generate same id → 200 `ok` + mock. Guard in C-22 guards.md.
