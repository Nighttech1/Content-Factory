# Guards — C-29 Carousel feed grid 3×7 + mocks + Drafts

Date: 2026-09-20  
Role: Tester  
Result: **GREEN** (fixtures + UI source + live HTTP)

Executable smoke:
```bash
npx tsx scripts/smoke-c29-feed-grid.ts
# with localhost:
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c29-feed-grid.ts
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Fixtures: carousel-engine `ours` ≥21, `competitors` ≥21; every `thumbUrl` is `https://` picsum seed | GREEN | `SMOKE_C29_FIXTURES_OK` |
| G2 | UI source: `grid-cols-3`; aspect `3/5`; drafts btn `ours-drafts-btn` (or `carousel-drafts-btn`); workspace wires carousel-engine grid + drafts | GREEN | `SMOKE_C29_UI_SOURCE_OK` |
| G3 | Live `GET /api/studio/carousel-engine/feed` 200; ≥21+21; all thumbs https | GREEN | `SMOKE_C29_LIVE_OK` |
| G4 | Live page `/studio/carousel-engine` HTTP 200 | GREEN | Deployer probe `:3000` |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map

| AC | Verdict |
|----|---------|
| CSS grid 3 columns (7 rows / 21 cards scrollable) | GREEN (source `grid-cols-3` + ≥21 fixtures) |
| Card aspect 3:5 | GREEN (`aspect-[3/5]` / `aspectRatio="3/5"`) |
| Real mock photos via stable https URLs | GREEN (picsum seeds on all posts) |
| Ours «Черновики» CTA (testid) | GREEN (`ours-drafts-btn` + stub panel) |
| Guard + regression mirror | GREEN |

## Client scenario / Playwright honesty

- Full Playwright MCP visual pack (S1-style click Drafts / grid layout at 1440) **not** re-run in this Tester pass.
- Covered by: smoke C-29 (fixtures + UI source + live feed) + HTTP 200 page.
- **Gap acknowledged** — Client may re-verify visually on localhost `/studio/carousel-engine`.

## Mirror in Client skill

Дублируй строку в `.cursor\skills\client-review\regression-guards.md`

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
