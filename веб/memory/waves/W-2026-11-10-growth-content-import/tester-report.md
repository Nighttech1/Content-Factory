# Independent Tester — prepared content import

2026-11-10. Local source checks: PASS, except the separately identified pre-existing anti-slop finding below. Real browser acceptance: PENDING QA-only CI and independent Client. Production was not started or changed.

## Actual executed checks

| Check | Result |
| --- | --- |
| Backend `test-growth-prepared.ts` | PASS, 14 groups |
| New independent `test-growth-prepared-boundaries.ts` | PASS, 6 groups |
| Existing `test-growth-workspace.ts` | PASS, 24 groups |
| Existing real-handler `test-growth-workspace-api.ts` | PASS |
| Existing independent `test-growth-workspace-boundaries.ts` | PASS, 13 groups |
| Full project TypeScript | PASS, including new independent test and seed |
| ESLint for changed Backend/Frontend and new test/seed files | PASS, zero errors/warnings |
| New browser script Node syntax; git diff whitespace | PASS |
| Historical seed followed by prepared seed in actual temporary storage | PASS, 24 cards retained, 6 synthetic active units, 4 historical snapshots |

The new independent guards check empty catalog archive retention; missing director approval and tampered signed content with no persistent writes; stale CAS after import; journal recovery before state write, after metadata write and after state write with durable idempotent repeat; mixed import quarantining one owner-edited unit while accepting clean units; and local adaptation versus unchanged signed provenance across rollback to an empty application catalog. All runtime directories are temporary; synthetic approvals are labelled fixtures, not actual research or role execution.

## Browser gate prepared

Root entry: `node scripts/growth-prepared-browser-qa.mjs`. Web seed, after the existing historical seed and before Next starts: `node --import tsx scripts/seed-growth-prepared-qa.ts`.

The browser guard uses the existing local HTTPS lifecycle only and real session API fixture login. At 1440/412/390/360 it checks approved-only active cards and honest empty stage, removed Update/service text, all five blue headings, bounded equal column geometry, complete inline brief/script/shots/concrete source/Scout-department-director trail, publication-only Fact, unknown counts, actual nonempty weekly correction graph and stage-specific values, arbitrary backwards select moves for every active format, reload/shared state and real API 409 refusal. Desktop mouse movement uses the handle and physical pointer events; all widths use CDP physical touch (including the specified hold activation) and keyboard handle Space/Arrow/Space plus Escape cancellation. No HTML drag event substitutes for physical gestures. Legacy chat/studio/schedule/settings remain browser regressions.

Local Chromium launch is still blocked by socket EPERM; no local UI PASS or Lighthouse measurements are claimed. Actual physical touch/keyboard behavior requires CI evidence. The empty canonical catalog is tested at the store boundary; nonempty browser content comes from isolated sidecar injection, never canonical application JSON.

## Existing finding outside this wave

`python веб/plugins/frontend/anti_slop_scan.py веб` returned FAIL at unchanged `lib/studio/vernatun-carousel/mode-b-brand-chrome.ts:80` for pure `#000` background. This known studio finding was not modified or presented as an overall anti-slop PASS. No new growth finding was emitted.

Tester changed only independent tests, fixture seed, browser guard and this report. Application fixes remain with their owners. No paid provider, real Scout execution, live import, VPS mutation, production write or release action was performed.

QA-only workflow handoff: `.github/workflows/growth-center-release.yml` now runs both prepared guard suites, the historical seed followed by prepared seed after artifact packaging, then `growth-prepared-browser-qa.mjs` and the independently owned `growth-prepared-client-qa.mjs`. YAML parsing and `bash -n` for each QA shell block passed. Semantic comparison with HEAD confirmed gate/deploy jobs, permissions and concurrency unchanged. Client confirmed its new filename; its source readiness and actual CI remain separate gates. Tester did not create a QA/release marker or dispatch a run.
