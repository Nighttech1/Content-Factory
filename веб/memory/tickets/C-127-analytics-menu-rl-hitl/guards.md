# Guards — C-127

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Menu-first flow; module tiles like Studio | `components/analytics/AnalyticsShell.tsx`, `AnalyticsModuleMenu.tsx` |
| static | RL author trainer + HITL «Согласовано» / «Отклонить» | `components/analytics/RlFeed.tsx`, `types/analytics.ts` |
| localhost | `/analytics` → `[data-testid="analytics-module-menu"]`; pick module → `[data-testid="analytics-dashboard"]`; RL approve without auto-apply | Playwright S34 |

## Localhost asserts (Playwright / Client)

1. `navigate` → `http://127.0.0.1:8787/analytics`
2. `expect(page.getByTestId('analytics-module-menu')).toBeVisible()`
3. Click first module tile → `analytics-dashboard` with `data-module-id`
4. `expect(page.getByTestId('analytics-back-menu')).toBeVisible()`
5. `[data-testid="analytics-rl-feed"]` heading contains «предложения Тренера»
6. Pending card: `[data-testid^="rl-proposal-"]` + `[data-testid^="rl-approve-"]` label **Согласовано**
7. Click **Согласовано** → badge «Согласовано» / toast `[data-testid="rl-toast"]`; no silent apply without click
8. Author ≠ Scout (mock `author: "trainer"`)

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | analytics-module-menu testid | PASS |
| G2 | menu → dashboard view switch | PASS |
| G3 | rl-approve / rl-reject testids | PASS |
| G4 | RlProposal author trainer in mock | PASS |
| G5 | Playwright S34 clicks | pending Client |

## Mirror in Client skill

`| C-127 | analytics flat dashboard / RL no HITL | module menu + Trainer Согласовано | memory/tickets/C-127-analytics-menu-rl-hitl/guards.md |`
