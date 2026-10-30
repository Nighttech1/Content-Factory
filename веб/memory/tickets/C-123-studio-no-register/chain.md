# Chain — C-123 (Studio no register)

> **Path lock #2** — после C-122, до mesh. Не overlap `ModuleSelectorGrid` с другими FE paths.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/ModuleSelectorGrid.tsx` (± stop import `RegisterModuleModal`) | [x] | Remove Add tile + modal entry; API keep |
| 2 | Motion | — | [ ] | не нужен |
| 3 | Backend | — | [ ] | не удалять API |
| 4 | Tester | `memory/tickets/C-123-studio-no-register/guards.md` | [x] | static PASS; Launchpad live → Client |
| 5 | Fixer | _(если красное)_ | [ ] | |
| 6 | Deployer | localhost | [ ] | wave end |
| 7 | Client | S32 / Launchpad | [ ] | Playwright |

**Wave order:** … → C-122 → **C-123** → C-124+C-125 → …
