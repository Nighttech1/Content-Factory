# Chain — C-128 (Retention 15s fraction)

> **Path lock #5b** — сразу после C-127. Не parallel с C-127 на overlapping analytics files.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/analytics/RetentionChart.tsx`, `types/analytics.ts`, `lib/analytics/self-learning-mock.ts` | [x] | %@15s `(n/m)` + keep/add 3s |
| 2 | Backend | — | [ ] | optional |
| 3 | Motion | — | [x] | не нужен |
| 4 | Tester | `guards.md` | [x] | static PASS; visible fraction → Client S34 |
| 5 | Fixer | _(если красное)_ | [ ] | |
| 6 | Deployer | localhost | [ ] | wave end after green |
| 7 | Client | S34 retention | [ ] | Playwright |

**После C-128 FE:** wave **Motion** (mesh dashed/density/barbell) → Tester (все C-122…C-128) → Fixer → Deployer → Client.
