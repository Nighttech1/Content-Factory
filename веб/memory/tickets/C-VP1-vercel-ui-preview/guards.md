# C-VP1 Vercel UI preview guards

Status: offline backend/source checks PASS; root build, live mobile/desktop and Vercel acceptance pending. Do not mark full preview delivery complete from these fixtures alone.

Invariant: preview never uses production keys/storage, initializes Prisma, runs models, writes application data, migrates browser storage or publishes. Preview data is visibly test data and returned as isolated copies. Normal production mode is unchanged.

Executable guards:

- `scripts/test-vercel-preview.ts` under network-denial preloader.
- `scripts/test-vercel-preview-read-coverage.ts` under network-denial preloader, with `TSX_DISABLE_CACHE=1` to prevent compiler temporary-cache writes affecting the readonly measurement.
- `python plugins/frontend/anti_slop_scan.py components/shell` and `git diff --check`.

Actual route coverage includes list/individual drafts, boards, designs, schedule, settings/brand kit, forced-fast feeds and labelled mock analytics; unknown APIs and mutation/ingest/generation paths reject before handlers. Cookie/header actor switching and an accidentally configured dummy DATABASE_URL cannot escape preview fallback.

Root browser guard: on390px, sidebar is closed initially and main content has no256px desktop padding; menu opens/closes via button/backdrop/Escape, focus returns, navigation closes menu. Desktop sidebar resize and widths remain; readonly notice visible only for preview; no fake save success.

Operational guard: keep dependencies, partial node_modules, env and runtime data out of the preview source commit. Publication remains dependent on owner Vercel login and actual deployment verification.
