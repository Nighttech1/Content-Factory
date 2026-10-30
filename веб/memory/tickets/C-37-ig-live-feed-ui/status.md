# Status — C-37

| Field | Value |
|-------|-------|
| **Status** | client-accepted-with-remarks |
| **Wave** | W-2026-09-20-live-ig-carousels |
| **Depends** | C-36 |
| **Tester** | [x] GREEN — smoke-c37 + C-30/C-36/C-35 mock |
| **Deploy** | `/studio/carousel-engine` 200; feed `sourceMode:mock`; no VPS |
| **Deployer** | [x] 2026-09-20 — page + feed smoke OK |
| **Client** | **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (2026-09-20) |
| **Next role** | — (visual re-check with live badge after credentials) |

## Client verdict (2026-09-20)

- Code-contract: dual columns (`workspace-dual-carousels` / Ours + Competitors), badge `feed-source-badge` → «Демо-данные» when mock, Razbor button preserved — **accepted**.
- Razbor API regression (C-30): `analyze` + `script` **200** with `competitorId=comp-ce-01`; `SMOKE_C30_HTTP_OK`.
- Live UI (real thumbs / «Онлайн · Instagram» badge) **not verified** — credentials empty by design.
- No crash on mock path. No new P0/P1 C-*.
- Limitation: Playwright MCP unavailable — no accessibility snapshot / click scenario on live Studio; relied on HTTP 200 page + UI source + smoke-c37.

Spec: `architect-spec.md` · Chain: `chain.md` · Decisions: `decisions.md` · Guards: `guards.md`
