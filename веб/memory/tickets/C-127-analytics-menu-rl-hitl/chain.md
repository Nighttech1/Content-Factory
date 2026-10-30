# Chain — C-127 (Analytics menu + RL HITL)

> **Path lock #5a** — после C-126. Затем **C-128** на analytics (не parallel overlap).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/analytics/AnalyticsShell.tsx`, `AnalyticsPageClient.tsx`, `RlFeed.tsx`, optional `AnalyticsModuleMenu.tsx`, `types/analytics.ts`, `lib/analytics/self-learning-mock.ts` | [x] | Menu like Studio; Trainer RL + «Согласовано» |
| 2 | Backend | optional API approve | [ ] | mock OK in FE |
| 3 | Motion | — | [ ] | optional tile hover |
| 4 | Tester | `guards.md` | [x] | static PASS; S34 clicks → Client |
| 5 | Fixer | _(если красное)_ | [ ] | |
| 6 | Deployer | localhost | [ ] | after C-128 too |
| 7 | Client | S34 | [ ] | Playwright |

**Wave order:** … → C-126 → **C-127** → **C-128** → Motion → Tester → …
