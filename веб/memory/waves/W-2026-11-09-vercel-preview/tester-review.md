# Independent Tester — Vercel read-only preview

## Verified scope

Backend pre-deploy verdict: **PASS**. The existing UI is retained; preview-only flags select a fixed fixture actor and immutable representative data rather than production storage. Source review found no DB initialization, paid model invocation or mutation on the inspected preview read paths. Both `CONTENT_FACTORY_PREVIEW=1` and `NEXT_PUBLIC_CONTENT_FACTORY_PREVIEW=1` are required for matching server/client mode and the notice.

Executed with the existing network-denial preloader (HTTP/HTTPS/TCP/TLS/UDP/fetch forbidden):

- `scripts/test-vercel-preview.ts` — PASS: actual drafts/boards/brand/design/schedule GET handlers, actor-header/cookie isolation, forced fallback even with a dummy DATABASE_URL, immutable fixture, blocked write entrypoint, labelled mock analytics, API gate and storage-preserving migration skip.
- Tester-owned `scripts/test-vercel-preview-read-coverage.ts` with `TSX_DISABLE_CACHE=1` — PASS: actual landscapes/publicist/design-active/design-md/agent-packs/brand-kit and individual draft/board/design GETs; actual carousel/reels feed handlers behind forced `fast=1`; unsafe methods and cron/ingest/models/media-proxy/unknown GET paths reject before handlers. Zero application filesystem mutation and no Prisma initialization.

The second test initially counted tsx compiler temporary-cache writes under AppData/Temp/tsx-alexk. These were not product data writes. Disabling the compiler cache for the final run removes that measurement interference while retaining the strict zero-write assertion. No application assertions were weakened.

Source checks: non-preview middleware still passes through; fixed actor ignores arbitrary header/cookie; fallback selection precedes cached Prisma use; mutation routes and unknown APIs fail closed; snapshot/insights APIs use explicitly labelled existing mock data rather than executing aggregate/model/cache handlers. The feed rewrite forces `fast=1`, whose existing handler path uses fixtures/empty data and has no scraper or Graph network request. No server actions or startup instrumentation/scheduler invocation were found in the primary page/layout path.

## Mobile source review

The two assigned shell components use zero mobile sidebar padding, a hidden-until-open drawer, a backdrop, a close button and Escape, focus cycling, restored trigger focus and body overflow restoration. Desktop width/resize and existing navigation remain. Root must verify the compiled CSS and actual 390px/desktop browser behavior; this source review does not prove every editor is mobile-ready.

Scoped `python plugins/frontend/anti_slop_scan.py components/shell` — PASS. `git diff --check` — PASS. Full-project anti-slop scanning was not used: the task changes the shell, while the checkout contains a large untracked partial dependency directory from interrupted npm installation.

## Remaining acceptance owned by root

- Build with both preview flags after backend/frontend freeze.
- Actual desktop/390px browser navigation and fixture image rendering, notice visibility, drawer interactions and console review.
- Vercel owner sign-in and deployment/access verification. No live Vercel URL is claimed here.
- Do not stage `node_modules.partial-20261109/`; it is untracked and not covered by the ordinary node_modules ignore rule.

Tester made no product edits. No production data/env, real DB/model, VPS, Telegram, Git push or Vercel operation was used. Tests restore environment and instrumentation. Screenshots/Lighthouse/live deployment were not executed by this tester; browser QA belongs to root per chain.

## Final source freeze / build boundary

Root confirmed Frontend's two shell files frozen. Independent source verdict: PASS for the reviewed backend/mobile shell scope. `reviewed-source-hashes.json` records the exact10sourcefiles reviewed; compare it before publication if files change. The fixture's tracked emblem exists. Root owns compiled desktop/mobile acceptance.

Local Turbopack build failed because this worktree reuses a dependency junction outside its filesystem root. Root switched to the existing Next.js Webpack production build; compilation completed and typecheck was still running at this report update. This is a local dependency-layout/build-method limitation, not evidence that a clean Vercel Turbopack build passes. Do not claim a Vercel deployment or complete phone compatibility from these offline checks.
