# Guards — C-28 Content workspace

Date: 2026-09-20  
Role: Tester  
Result: **GREEN** (fixtures + live HTTP + source wiring)

Executable smoke:
```bash
npx tsx scripts/smoke-c28-feed.ts
# with localhost:
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c28-feed.ts
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Feed fixtures: core modules `{ ours, competitors }` shape; topic filters competitors; ours unchanged; no prisma in feed route | GREEN | `SMOKE_C28_FIXTURES_OK` |
| G2 | Live `GET /api/studio/carousel-engine/feed` + `?topic=wedding`; custom empty; unknown 404 `module_not_found` | GREEN | `SMOKE_C28_LIVE_OK` |
| G3 | Source: `ModuleIdeaBar`, `VerticalPostCarousel`, `DraftEmptyBlock` under `components/studio/workspace/`; wired in `StudioModuleWorkspace` | GREEN | imports + `data-testid` module-idea-bar / workspace-dual-carousels / draft-empty-block |
| G4 | Source: `CapCutEditorShell` + route `app/studio/[moduleId]/edit/[draftId]/page.tsx` | GREEN | `data-testid="capcut-editor"`; page returns shell |
| G5 | HTTP 200: `/studio/carousel-engine`, `/studio/carousel-engine/edit/draft-demo`, feed API | GREEN | live probe `:3000` |
| G6 | C-27 regress: launch `/studio` HTML has **no** `command-input` | GREEN | launch clean (idea on module page) |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map

| AC | Verdict |
|----|---------|
| Idea bar on module page (not launch) | GREEN |
| Dual vertical carousels ours + competitors | GREEN |
| Topic → competitor refetch (API + workspace commit) | GREEN |
| Empty draft block after topic | GREEN (testid + workspace wiring) |
| CapCut-like editor route/shell | GREEN (shell + timeline/preview testids) |
| Mock feed, no DB migrate | GREEN |
| Guard + regression mirror | GREEN |

## Client scenario / Playwright honesty

- Full Playwright MCP scenario pack for idea → draft → editor **not** re-run in this Tester pass (MCP playwright not in this subagent toolset).
- Covered by: smoke C-28 + HTTP 200 pages + source/`data-testid` contract.
- **Gap acknowledged** — acceptable for wave close per Orchestrator brief; Client may re-verify visually on localhost.

## Mirror in Client skill

Дублируй строку в `.cursor\skills\client-review\regression-guards.md`

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
