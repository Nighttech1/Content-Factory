# Independent Tester report — growth workspace

Date: 2026-11-10. Source readiness: PASS. Real browser acceptance: PENDING GitHub Actions QA evidence and independent Client review. No production actions performed.

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
