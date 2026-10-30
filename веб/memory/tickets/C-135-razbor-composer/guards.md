# Guards — C-135 Razbor composer: long input + 3 actions + red X

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Composer row: `flex-1` textarea + `MultiButton` with **exactly 3** items (send · mic · handoff) | `AgentChatComposer.tsx` |
| static | Testids: `agent-chat-composer`, `agent-chat-input`, `agent-chat-actions` | `AgentChatComposer.tsx` |
| static | Close = circular red X (`rounded-full`, terracotta); **not** rectangular «Закрыть» | `RazborModal.tsx` `data-testid="razbor-modal-close"` |
| static | Razbor uses `AgentChatComposer` when `showComposer` | `RazborModal.tsx` |
| localhost | S38: long input + 3 buttons right; circular red X close | Playwright S38 step 2 |
| regression | C-134 titles unchanged (`cf-system-title` on header) | grep |

## Static asserts (grep)

1. `grep 'id: "send"' AgentChatComposer.tsx` + mic + handoff → 3 action items.
2. `grep 'flex-1 grow' AgentChatComposer.tsx` on textarea.
3. `grep razbor-modal-close RazborModal.tsx` → `rounded-full` + terracotta + `<X`.
4. `grep AgentChatComposer RazborModal.tsx` → composer mounted in agent pane.

## Localhost asserts (Playwright / Client — pending)

1. Open Razbor → agent tab with composer
2. `expect(page.getByTestId('agent-chat-input')).toBeVisible()`
3. `expect(page.getByTestId('agent-chat-actions').locator('button')).toHaveCount(3)`
4. `expect(page.getByTestId('razbor-modal-close')).toHaveClass(/rounded-full/)`

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | Long flex-1 input | **PASS** |
| G2 | Exactly 3 action buttons | **PASS** |
| G3 | Circular red X close | **PASS** |
| G4 | Playwright live S38 | **pending Client** |

## Mirror in Client skill

`| C-135 | Razbor composer chrome | long input + 3 actions + circular red X S38 | memory/tickets/C-135-razbor-composer/guards.md |`
