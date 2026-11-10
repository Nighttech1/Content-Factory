# C-QA-PREPARED-WAIT — keyboard drop must prove durable outcome

Status: harness fixed, offline diagnostics check PASS; real four-width browser retest and independent Client acceptance PENDING.

CI `42845380733` timed out waiting for exact `growth-column-shooting[data-drag-over=true]`. A column flag is not a general readiness signal: collision may identify a sortable card instead. A subsequent geometry-based pre-drop wait was also incorrect: the visible DragOverlay has no `data-card-id`, so the original article's rectangle cannot establish overlay destination.

Current guard uses physical handle Space → ArrowRight → Space with NO destination pre-drop wait. The executable browser guard must then receive the exact real `move_card` POST (correct card and intended column `shooting`), HTTP 200, a matching request receipt, the DOM column change, and fresh API reads from both contexts confirming `shooting`. This durable proof is the acceptance criterion. Original-card/column rectangles, dragging flag, column flag and active element are diagnostics only. Failure captures current card/column/focus states; it does not invent a successful destination.

Executable acceptance guard: `node scripts/growth-prepared-browser-qa.mjs` in the configured isolated HTTPS production-bundle CI fixture, at 1440/412/390/360. Offline diagnostics check: `node scripts/test-growth-prepared-keyboard-state.mjs`; it verifies that observed missing/inactive/stale flag states do not become readiness verdicts. No selector fallback, synthetic drag event or sleep replaces physical keyboard proof. Application code and production data are unchanged.
