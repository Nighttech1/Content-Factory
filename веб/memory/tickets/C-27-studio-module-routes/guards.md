# Guards — C-27 Studio module routes

Date: 2026-09-20  
Role: Tester  
Result: **GREEN** (source + live HTTP when BASE_URL set)

Executable smoke:
```bash
npx tsx scripts/smoke-c27-studio-routes.ts
# with localhost:
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c27-studio-routes.ts
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | `/studio` (`app/studio/page.tsx`) has **no** `FloatingCommandBar` / `GenerationDrawer` / `command-input` | GREEN | `SMOKE_C27_LAUNCH_CLEAN_OK` |
| G2 | `ModuleSelectorGrid` uses `next/link` + `studioModuleHref` → `/studio/{id}` for core cards | GREEN | `SMOKE_C27_MODULE_LINKS_OK` |
| G3 | `app/studio/[moduleId]/page.tsx` exists; `inspect` reserved via `isReservedStudioSegment`; inspect page intact | GREEN | `SMOKE_C27_MODULE_ROUTE_OK` |
| G4 | Sidebar Studio expandable; `nav-studio-children` + `nav-studio-module`; same `mergeStudioModules` / `studioModuleHref` as grid | GREEN | `SMOKE_C27_SIDEBAR_CHILDREN_OK` |
| G5 | Live HTTP: `/studio`, `/studio/carousel-engine`, `/studio/inspect/demo` → 200; launch HTML without `command-input` | GREEN | `SMOKE_C27_LIVE_STUDIO_OK` / `MODULE_OK` / `INSPECT_OK` on `:3000` |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map

| AC | Verdict |
|----|---------|
| Launch without topic / FloatingCommandBar / Generate | GREEN |
| Module card → `/studio/{canonicalId}` | GREEN |
| Sidebar Studio children for core 4 | GREEN |
| `/studio/inspect/:id` intact | GREEN |
| Guard + regression mirror | GREEN |

## Client scenario note

- **S1 (Generate on launch)** — **ожидаемо отсутствует** до C-28: topic/Generate живут на module workspace, не на `/studio`.
- Smoke C-25 still asserts `FloatingCommandBar.tsx` / `GenerationDrawer.tsx` **files** exist (components retained for C-28); they must **not** mount on launch.

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`

## Honesty

- Unknown custom `moduleId`: soft empty state in `StudioModuleWorkspace` (not hard 404) after hydrate — acceptable per architect.
- HTTP live checks require `BASE_URL`; source guards always run.
