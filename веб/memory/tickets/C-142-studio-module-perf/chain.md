# Chain — C-142 (studio module perf)

> Path lock **2**. After C-141+C-140. **No** mesh file overlap.

**One-liner:** Frontend (measure→fix) → Backend? → Tester → Fixer → Deployer → Client

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | Measure root cause; skeleton/fixtures first; Apify background; dynamic import split; write before/after in status | [x] | fixtures+cache paint; bg fetch+8s soft-fail; GenerationDrawer dynamic; `?fast=1`; see status.md |
| 2 | Backend | _(only if RSC/API awaits Apify)_ | [ ] | non-blocking fetch contract |
| 3 | Tester | `memory/tickets/C-142-studio-module-perf/guards.md` with ms | [ ] | cold click timing |
| 4 | Fixer | _(если красное)_ | [ ] | surgical |
| 5 | Deployer | localhost + local API refresh if needed | [ ] | |
| 6 | Client | scenario: open module, see UI then live | [ ] | Playwright @1440 |

**Next:** C-144 → C-143.
