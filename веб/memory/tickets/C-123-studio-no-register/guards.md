# Guards — C-123

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | `ModuleSelectorGrid` без Add tile / `RegisterModuleModal` import | `components/studio/ModuleSelectorGrid.tsx` |
| localhost | `/studio`: нет «[+ Добавить модуль]»; нет `[data-testid="register-module-modal"]`; только `[data-testid="module-card"]` | Playwright S32 Launchpad |
| regression | `RegisterModuleModal.tsx` может остаться на диске; API register не удалён | grep components |

## Localhost asserts (Playwright / Client)

1. `navigate` → `http://127.0.0.1:8787/studio`
2. `expect(page.getByText('[+ Добавить модуль]')).toHaveCount(0)`
3. `expect(page.getByTestId('register-module-modal')).toHaveCount(0)`
4. `expect(page.getByTestId('module-card').first()).toBeVisible()`
5. Клик по любой `module-card` → href workspace; modal register не открывается

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | No register-module / Добавить модуль in ModuleSelectorGrid | PASS |
| G2 | RegisterModuleModal not imported by grid | PASS |
| G3 | module-card testids present | PASS |
| G4 | Playwright live Launchpad | pending Client |

## Mirror in Client skill

`| C-123 | Launchpad RegisterModule CTA | no register in ModuleSelectorGrid | memory/tickets/C-123-studio-no-register/guards.md |`
