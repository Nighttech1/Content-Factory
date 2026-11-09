# Read-only Vercel preview audit — 2026-11-09

Scope: source inspection only in isolated `codex/vercel-preview-20261109` worktree. No app source edits, installation, builds, network/model calls, secrets, VPS access, Git pushes, or Vercel operations were performed by this audit. Existing eleven local build fixes were already present before the audit.

## Verdict

The existing Next.js UI can be deployed as a clearly labelled **read-only UI preview**, but a plain GitHub import with no environment keys is insufficient. The first API GET can still attempt filesystem writes. A full writable production factory should not be claimed compatible with Vercel as currently implemented.

### Concrete blockers

1. `lib/db/actor.ts` → `resolveActor` calls `ensureFallbackUser` when no DATABASE_URL exists. `lib/db/sprint8-fallback.ts` then writes `data/local/sprint8-sot.json` for a missing actor. GET drafts, boards, brand, design slots and other APIs use this actor resolver. Fresh read-only deployment can therefore return500 even for basic reads.
2. `lib/db/sprint8-fallback.ts` has an otherwise read-only fallback reader; `listDrafts`, `listBoards`, `listDesignSlots`, and schedule read paths can reuse this existing repository contract when backed by an immutable fixture. Their write methods must not execute in preview.
3. `lib/settings/{brand-store,landscapes-store,design-active-server,publicist-settings-store}.ts` and `lib/db/analytics-fallback.ts` use `process.cwd()/data/local`. Most pure reads tolerate missing files and return defaults. Writes/uploads cannot persist on Vercel's application filesystem. No shared configurable data-root abstraction currently covers these stores.
4. `lib/studio/sprint8-migrate.ts` automatically POSTs `/api/studio/migrate-local` on hydration, including an empty body. Draft/board hydration awaits it but proceeds to GET afterwards even if it returns false. Preview should explicitly skip this migration; do not claim migration succeeded or clear browser data for a rejected write.
5. `lib/analytics/resolve-insights.ts` may invoke a model on a GET cache miss and tries to write a cache. Unset keys currently avoid the paid model path, but explicit preview mode must force existing mock insights and skip cache persistence. A GET is not universally free of side effects.
6. `app/api/studio/[moduleId]/feed/route.ts` explicitly never calls Apify; it uses Scout snapshots or existing fixtures. No scraper/social keys should be attached to preview. Existing fixture metadata already distinguishes mock source. `app/api/settings/agent-packs/route.ts` reads optional tracked markdown and tolerates missing files.
7. `lib/db/boards-repository.ts` and rendering code write images under `public/generatedMedia`; FFmpeg/Chromium render pipelines are outside this UI-preview milestone. A static deploy is also insufficient because the UI relies on Next route handlers.
8. Mobile layout is **not already accepted**: `components/shell/AppShell.tsx` always applies inline paddingLeft equal to sidebar width; `SidebarNavigation.tsx` is fixed and always visible. Default sidebar width is256 (`lib/shell/sidebar-width.ts`), leaving134px at390px before page padding. A bounded mobile navigation fix is needed for useful phone viewing.

## Proposed bounded implementation

Use opt-in `CONTENT_FACTORY_PREVIEW=1` (and a public UI flag) exclusively in the preview project/branch. No production environment copying.

- Add one server-safe preview configuration/helper and one immutable typed fixture, reusing `Sprint8FallbackStore`/existing API mappers. A small representative draft/design set is acceptable only when visibly labelled preview data. If owner wants the existing48drafts, root must separately prepare a reviewed/sanitized read-only snapshot with public media URLs; do not copy the entire production settings/data directory or credentials.
- `lib/db/actor.ts`: preview returns a fixed fixture actor without DB/file upsert and ignores arbitrary actor header/cookie for that mode.
- `lib/db/sprint8-db.ts`: preview always selects fallback, even if a DATABASE_URL is accidentally present.
- `lib/db/sprint8-fallback.ts`: preview reads a deep copy of the immutable fixture; write entrypoint rejects a named preview-read-only error. This gives drafts/boards/designs/schedule existing shapes without inventing a parallel backend.
- Add a preview-only API middleware gate: allow safe reads, reject mutation/generation/ingest/upload/render/publish methods with an explicit read-only response before handler execution. Do not proxy to the live production API. Review any GET routes with side effects separately, especially analytics.
- `lib/analytics/resolve-insights.ts`: preview forces the existing mock result and skips cache write; ensure its aggregate reads also remain fallback-only. Alternatively show the analytics preview unavailable explicitly rather than silently claim live analytics.
- `lib/studio/sprint8-migrate.ts`: public preview mode skips migration without modifying legacy localStorage. Existing read hydration continues. No fake successful server save responses.
- Root shell: clearly visible “Тестовая версия интерфейса · сохранение и генерация отключены” notice; mutating controls should communicate that scope. No redesign.
- Frontend scope if authorized: `AppShell.tsx` and `SidebarNavigation.tsx` only for a mobile menu/drawer, retaining desktop layout. Test actual390px navigation and the key Studio panels; no blanket claim every editor is mobile-ready.
- Build/deploy: root directory `веб`, standard Next.js framework, Node22 for consistency with existing production validation, existing corrected lockfile/tsconfig. Ensure any immutable fixture/markdown loaded with fs is included in output tracing or imported statically. No Chromium installation, seed/migrate, cron, Redis or production provider keys.

## Acceptance checks before publication

1. Production build using preview flags; imported local build fixes remain intact.
2. Actual GET drafts/boards/design slots/brand/schedule in a temporary nonwritable app directory returns200 with expected preview source and fixture actor; file hashes unchanged, no DB client requests.
3. Mutation and paid/generation/ingest endpoints reject without executing handler/model/filesystem write. Migrate-local does not erase localStorage.
4. Studio→module→drafts, Settings, Team navigation on desktop and390px, including visible preview notice and public image loading. No fake save success.
5. Vercel access starts owner-protected; owner login/project creation is root's separate task. The audit does not claim a deployed URL exists.

Readonly audit complete; source implementation awaits root specification refinement and ownership assignment.

## Authorized implementation and local checks

After root refined the specification, the bounded backend changes were implemented in the isolated preview worktree: opt-in helper/typed3draft fixture, fixed actor, forced fallback, rejected fallback writes, API middleware with inspected read allowlist, fixture-only feed rewrite, explicitly mock analytics, and browser migration skip without localStorage cleanup. Desktop/mobile shell is owned by the separate Frontend agent.

`scripts/test-vercel-preview.ts` passed using the verified dependency junction prepared by root. It exercises the actual GET handlers for drafts, boards, brand, design slots and schedule; all return200 with the fixed preview actor while filesystem mutations throw. It verifies isolated fixture copies, mutation/unknown/paid API rejection, no fetch/model/backend calls or Prisma initialization despite a synthetic DATABASE_URL, mocked analytics, preserved localStorage, and unchanged production middleware pass-through when preview flags are off. TypeScript imports are preloaded before the write guard so tsx's own compile cache is not confused with application writes.

Scoped ESLint over all nine backend/fixture files exited0, with no errors. Two existing unused `eslint-disable no-console` warnings remain in `resolve-insights.ts` and `sprint8-db.ts` on untouched statements. `git diff --check` passed. Root owns the final build, independent verification, browser acceptance, Git push and Vercel publication; those outcomes are not claimed here.
