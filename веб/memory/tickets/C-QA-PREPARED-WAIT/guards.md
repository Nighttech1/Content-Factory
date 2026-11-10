# C-QA-PREPARED-WAIT — keyboard target observation

Status: harness fixed, offline guard PASS; actual browser retest and independent Client acceptance PENDING.

CI `42845380733` timed out at the wait for `growth-column-shooting[data-drag-over=true]`. Source contract: `useDroppable().isOver` marks the column only when collision ID is that column; the collision strategy may instead choose a sortable card. Therefore a column flag alone is not proof that keyboard input reached a valid destination.

The browser guard now observes the physically moved active card's horizontal center inside the intended column via `keyboardTargetState` while `data-dragging=true`. This is only an intermediate wait. It must subsequently receive the matching real `move_card` POST with HTTP 200 and confirm both DOM and reread server column `shooting`. Report evidence records exact card/target rectangles, active handle, column flag, response receipt and persisted column. Failure evidence adds all card/column/focus states. The criterion is not weakened to an arbitrary target, selector fallback or sleep.

Executable offline guard: `node scripts/test-growth-prepared-keyboard-state.mjs` from repository root. It accepts card and column collision states, rejects stale column flags without physical placement, wrong column, inactive and missing dragged cards. Actual browser entry: `node scripts/growth-prepared-browser-qa.mjs` in the configured isolated HTTPS CI fixture at all four widths. No application code or production data changes.
