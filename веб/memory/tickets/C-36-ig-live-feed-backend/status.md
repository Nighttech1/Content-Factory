# Status — C-36

| Field | Value |
|-------|-------|
| **Status** | client-accepted-with-remarks |
| **Wave** | W-2026-09-20-live-ig-carousels |
| **Depends** | C-35 |
| **Next role** | — (re-verify live after `.env` credentials) |
| **Deploy** | Localhost OK — feed 200, `sourceMode:mock` (empty IG tokens); no VPS |
| **Tester** | GREEN (`guards.md`, `scripts/smoke-c36-ig-feed.ts`) |
| **Fixer** | N/A |
| **Deployer** | [x] 2026-09-20 — smoke feed endpoint; reused healthy `:3000` |
| **Client** | **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (2026-09-20) |

## Client verdict (2026-09-20)

- HTTP `GET /api/studio/carousel-engine/feed` → **200**, root `sourceMode: "mock"`, ours+competitors with metrics — **accepted**.
- Soft-fail without token, cache TTL contract, other modules stay mock — guards GREEN; live AC SKIP/env-gated as expected.
- Live Graph / Business Discovery path **not verified** until user sets token + `IG_USER_ID` (+ optional `IG_COMPETITOR_USERNAMES`).
- No secrets in JSON response. No new C-*.
- Limitation: no Playwright MCP; HTTP + smoke + code-contract.

Spec: `architect-spec.md` · Chain: `chain.md` · Decisions: `decisions.md` · Guards: `guards.md`
