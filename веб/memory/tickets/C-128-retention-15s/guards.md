# Guards — C-128

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | `retention-at-15` callout; format `{pct}% ({retained}/{total})` | `components/analytics/RetentionChart.tsx` |
| static | `at15` in `RetentionSummary` + mock 62% (31/50) | `types/analytics.ts`, `lib/analytics/self-learning-mock.ts` |
| localhost | After C-127 module pick: Retention shows **На 15-й секунде** + fraction; 3s callout retained | Playwright S34 |

## Localhost asserts (Playwright / Client)

1. `/analytics` → select module → scroll/find `[data-testid="analytics-retention"]`
2. `expect(page.getByTestId('retention-at-15')).toBeVisible()`
3. `expect(page.getByTestId('retention-at-15')).toContainText('На 15-й секунде')`
4. Text matches `/\d+% \(\d+\/\d+\)/` (e.g. `62% (31/50)`)
5. `expect(page.getByTestId('retention-at-3')).toBeVisible()` — 3s gate not removed
6. total=0 → shows `n/a` (formatCohort guard)

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | retention-at-15 testid | PASS |
| G2 | formatCohort fraction pattern | PASS |
| G3 | at3 + at15 in mock summary | PASS |
| G4 | RU label «На 15-й секунде» | PASS |
| G5 | Playwright visible text | pending Client |

## Mirror in Client skill

`| C-128 | retention no %@15 fraction | retention-at-15 pct (n/m) | memory/tickets/C-128-retention-15s/guards.md |`
