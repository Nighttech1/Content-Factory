# Status — C-10

| Field | Value |
|-------|-------|
| **Status** | `done` |
| **Owner** | — |
| **Updated** | 2026-09-18 |

## Log

- Ticket opened for Sprint 4 wave.
- Architect: `architect-spec.md` + `chain.md` + `decisions.md` ready. Next: Frontend C-10.
- Frontend: route `/studio/inspect/[id]`, left MediaDeck (Reels + Carousel DnD), full mock/store, C-11/C-12 stubs. Next: Motion.
- Motion: shell entrance, Reels↔Carousel viewport crossfade, toggle pill spring, slide stage fade; `useReducedMotion` honored. Next: Tester (or Orchestrator defers QA to end of wave).
- Tester: `scripts/sprint4-guards.mjs` GREEN; `guards.md` written; anti-slop OK; localhost optional skipped (not up). Fixer not needed. Next: Deployer.
- Deployer: Next.js already up on `http://127.0.0.1:3000` (not killed). `/studio/inspect/demo` → 200; `/studio` → 200. `node scripts/sprint4-guards.mjs` GREEN with HTTP assert. Separate local API: N/A (Next-only). Ready for Client.
- Client: ПРИНЯТО. HTTP 200; guards GREEN; `--font-hy` + Armenian unicode in seed/SSR; left deck contract OK. Playwright MCP недоступен — по wiring + guards (как Sprint 3).
