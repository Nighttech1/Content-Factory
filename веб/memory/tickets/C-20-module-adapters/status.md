# Status — C-20

| Field | Value |
|-------|-------|
| **Status** | done |
| **Wave** | W-2026-09-19-sprint6-sdk |
| **Architect** | Done 2026-09-19 — `architect-spec.md` + `chain.md` |
| **Backend** | Done 2026-09-19 — mock adapters M1–M4, gateway stub, API facade; smoke `scripts/smoke-c20-adapters.ts` SMOKE_OK |
| **AI Bridge** | Done 2026-09-19 — live `heygen-gateway` + prompt packs + heygen-reels wire; mock without key |
| **Frontend** | Done 2026-09-19 — Studio Generate → module generate facade (`render: true`); drawer UX kept |
| **Tester** | RED then Fixer — G7 GREEN |
| **Fixer** | Done 2026-09-19 — client-safe manifests; `/studio` 200 |
| **Deployer** | Done 2026-09-19 — localhost `:3000`; GET `/studio` 200; smoke SMOKE_OK; POST generate 200 mock |
| **Client** | **ПРИНЯТО** 2026-09-19 — carousel/heygen generate 200 mock; `smoke-c20` SMOKE_OK (incl. no HeyGen key); Studio store opens drawer + POST generate. Gap: Playwright MCP — no live click snapshot. |
| **Next** | — closed |
