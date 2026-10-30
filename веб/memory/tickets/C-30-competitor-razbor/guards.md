# Guards — C-30 Competitor «Разбор» modal + Drafts

Date: 2026-09-20  
Role: Tester  
Result: **GREEN** (pipeline + UI source + live HTTP)

Executable smoke:
```bash
npx tsx scripts/smoke-c30-razbor.ts
# with localhost:
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c30-razbor.ts
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Pipeline: Analyst analysis + Scriptwriter→Designer cascade; ≥4 competitor slides; Vernatun scenario; draft `unpublished` + `sourceCompetitorId`; logo note on slide; deterministic URLs; missing id → null | GREEN | `SMOKE_C30_PIPELINE_OK` |
| G2 | UI source: `razbor-modal`, `razbor-btn`, `competitor-razbor-btn` (architect testid on card), `ours-drafts-panel`, `upsertDraft` in drafts store; modal must **not** navigate to CapCut; store isolated from generate (`no drawerOpen`) | GREEN | `SMOKE_C30_UI_SOURCE_OK` + source: `FeedPostCard` `data-architect-testid="competitor-razbor-btn"` |
| G3 | Live `POST /api/studio/carousel-engine/razbor` analyze + script → 200, `ok: true`, draft unpublished | GREEN | `SMOKE_C30_HTTP_OK` @ `BASE_URL=http://127.0.0.1:3000` |
| G4 | Live page `GET /studio/carousel-engine` HTTP 200 | GREEN | Deployer probe `:3000` → `PAGE_STATUS=200` |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map

| AC | Verdict |
|----|---------|
| Competitor card «Разбор» button | GREEN (`razbor-btn` + `competitor-razbor-btn`) |
| Modal: left agent chats + right competitor carousel | GREEN (`razbor-modal` + panes Analyst/Scriptwriter/Designer) |
| Analyst auto-analyzes on open (deterministic) | GREEN (`runRazborAnalysis` / analyze API) |
| Scriptwriter action cascades → Designer → branded draft | GREEN (`runRazborCascade` / script API) |
| Result in Черновики unpublished; upsert on edit path | GREEN (`upsertDraft` + `status: unpublished`) |
| No CapCut navigation from razbor modal | GREEN (source assert) |
| Guard + regression mirror | GREEN |

## Client scenario / Playwright honesty

- Full Playwright MCP visual pack (open Разбор → watch Analyst → Write script → Drafts list) **not** re-run in this Tester pass.
- Covered by: smoke C-30 (pipeline + UI source + live API) + HTTP 200 page.
- **Gap acknowledged** — Client may re-verify visually on localhost `/studio/carousel-engine`.

## Mirror in Client skill

Дублируй строку в `.cursor\skills\client-review\regression-guards.md`

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
- Mock LLM / deterministic pipeline only; no social publish.
