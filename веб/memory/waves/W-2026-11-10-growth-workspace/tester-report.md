# Independent Tester report — growth workspace

Date: 2026-11-10. Source readiness: PASS. Independent Tester final verdict: PASS on actual CI evidence below. Independent Client owns its final visual/ticket acceptance. No production actions performed.

## Executed checks

| Check | Actual result |
| --- | --- |
| `node --import tsx scripts/test-growth-workspace-boundaries.ts` (web cwd) | PASS: 13 independent groups |
| `node node_modules/typescript/bin/tsc --noEmit` (web cwd) | PASS |
| Targeted ESLint for independent boundaries and seed TS scripts | PASS, no errors or warnings |
| `node --check` for browser CLI and HTTPS fixture module | PASS |
| Seed script in an isolated temporary directory | PASS: 24 cards, 4 historical snapshots including one correction |
| `git diff --check` | PASS |

Independent boundary groups exercise fail-closed configuration and authorization; real session cookie/CSRF/origin/expiry/revocation; rate and body limits; strict commands and public proof URLs; two durable store clients with CAS conflict and idempotency; backwards moves for every seeded format without manufactured publication; corrupt state refusal; Moscow week and exact Sunday cutoff; rejection of closed-week facts; nullable missing history, late-event exclusion and immutable corrections; manual Scout queue and sanitized backups; mixed backup/Scout outbox status; and injected Git partial failures/retry with branch separation and no duplicate commits. Git transport is mocked; no external provider was contacted.

## Browser gate prepared, not executed locally

`scripts/growth-workspace-browser-qa.mjs` uses the actual production server through the local HTTPS lifecycle helper `scripts/growth-workspace-qa-fixture.mjs`, explicit temporary state and owner configuration. It covers widths 1440/412/390/360, six stages, four navigation links, stage board filtering, one nonempty weekly graph with correction tooltip and unknown gaps, arbitrary backwards moves, desktop drag and keyboard/modal interactions, shared reload, real API security/conflicts/replay, and a dropped response after actual Scout command commit followed by idempotent retry. Legacy chat/studio remain regression targets.

`веб/scripts/seed-growth-workspace-qa.ts` prepares historical data before server start using an injected clock. Its values are clearly marked isolated QA data. It cannot write an existing state or a directory outside the permitted temporary roots. The HTTPS helper does not bypass application authentication. Client imports lifecycle only and owns separate acceptance assertions.

Local browser execution is unavailable because Chromium launch is blocked by socket EPERM. Therefore browser scripts and screenshots require the QA-only GitHub Actions run; syntax checks are not UI acceptance. The immutable application bundle, real browser report, screenshots and independent Client verdict remain the final gate.

## Scope and ownership

Tester changed only independent tests, fixture/seed helpers and wave reports. Application fixes remained with Backend/Frontend. No production/VPS mutation, release marker, remote Git operation, paid API, real Scout execution or runtime credential disclosure was performed by Tester. Existing canonical growth content was not replaced with fixtures.

## First actual CI attempt

Run `42795772848` (application source `c03f2d7d`, QA marker `2765c92`) passed unit/type/build checks and skipped deployment. Browser execution reached the desktop native drag / keyboard return sequence, then timed out waiting for the return to `task`. Failure evidence shows the card in `shooting`; browser errors and external requests were empty. This attempt is FAILED and is not browser acceptance.

Tester corrected the physical keyboard protocol: explicitly wait for the real select to become enabled, verify focus, use ArrowUp and Tab, then require the matching successful API mutation, DOM column and persisted server column. This retains the keyboard acceptance criterion. Added failure diagnostics for focus, select state, card columns, alerts and last mutation status. Script syntax and diff checks passed. The evidence did not establish an application defect; rerun remains required.

## Second actual CI attempt

Run `42797132824`, source `80dcf085ec12083c1e842f54919f8c516f972a1e`, artifact `13753583207`: browser reached the committed-Scout-response interruption test and FAILED on an early queue assertion. Prior desktop physical keyboard mutation returned 200 and persisted `task`. Actual geometry: board 634px within 1000px viewport; five columns all 620px; chart immediately below with 30px gap; last card focused and visible after independent column scrolling. Errors and external requests were empty. This partial evidence does not constitute a full browser PASS.

The generic alert selector could match the framework route announcer before the application completed the POST. Tester now waits for the actual request, upstream commit receipt, completed response abort, specific application transport error text, and enabled control before asserting the durable queue count. Diagnostic before/committed/after counts and receipt were added. Same-command replay and no duplicate manual request remain mandatory. Syntax/diff checks passed; full rerun and Client acceptance remain pending.


## Final actual CI verdict — PASS

Run `42798584220`, application source `a1f83cfe792a074fdae0fbac27d2051ad45a6385`, QA marker `dc01033e837309f2196b9abdc5be6fc974d6cf6f`. Application artifact: `13754898158`; evidence artifact: `13754528476`. Tester independently read both extracted JSON reports from `growth-workspace-evidence/run-42798584220/qa-evidence/` and inspected the 360px full board and 1440px card modal PNGs. Both reports passed all four widths, with empty unexpected error and external-request arrays.

- Actual physical ArrowUp/Tab produced HTTP 200 and persisted `task` at 1440/412/390/360. Native desktop drag passed.
- Board geometry: desktop 634px with all five columns 620px; mobile 534px with all columns 520px. Last card reachable through focus and independent vertical scrolling; chart directly below with 30px/22px gaps. No body horizontal overflow.
- Dropped Scout response: upstream committed HTTP 200, receipt recorded, response abort completed, durable queue count 0→1. Same-command replay passed without a second request. Queued manual work did not claim Git delivery or worker execution.
- Stage filtering, one nonempty selected-stage graph, immutable correction tooltip and null gap, all-format backwards movement, secure sessions, real API origin/CSRF/CAS/idempotency, two-client reload and preserved legacy routes passed.
- Independent Client browser report additionally passed facts Save/Cancel/reload, explicit unknown versus zero, script edits, denied unsafe/future proof, publication-only Fact mode and manual Scout behavior.

All measured data was isolated QA fixture data. Real Git transport remains covered through injected mocks, not a production integration claim. This verdict accepts the tested application artifact for the QA scope; it does not authorize or claim production deployment, operational configuration, an actual Scout research run, or owner acceptance.
