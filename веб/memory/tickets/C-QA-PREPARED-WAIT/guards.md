# C-QA-PREPARED-WAIT — deferred keyboard cross-column acceptance

Current status: **OUT OF SCOPE / NON-BLOCKER**, by explicit Root scope adjustment. Physical keyboard cross-column commit is not claimed PASS. Earlier CI failures and diagnostic work below are retained in the Tester report.

Current executable browser gate `node scripts/growth-prepared-browser-qa.mjs` retains keyboard handle Space/Escape cancellation with unchanged server revision, all-format arbitrary and backwards movements through the accessible selector, and mandatory physical desktop mouse and four-width touch dragging. The blocking physical keyboard cross-column POST assertion is removed; its deferred status is explicitly recorded in browser JSON. Independent Client applies the same declared scope.

The original failure was a harness destination wait: a column isOver flag can omit card collisions, and original-card geometry does not prove DragOverlay destination. These signals remain diagnostic only. The prior offline diagnostic utility is historical, not proof of functional keyboard movement. Future restoration of physical keyboard cross-column acceptance requires an explicit scenario and actual matching POST, receipt and durable two-client outcome.

No application code or production data changed for this scope adjustment. Four-width CI and independent Client acceptance of the remaining gate are still required. This is a declared exclusion, not closure of a proven keyboard product defect by passing a weaker test.
