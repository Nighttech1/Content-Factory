# Guards — C-37 Studio UI live IG feed + badge

Date: 2026-09-20  
Role: Tester (re-verify)  
Result: **GREEN**

Executable smoke:
```bash
npx tsx scripts/smoke-c37-ig-feed-ui.ts
```

Regression (mock / no-token):
```bash
npx tsx scripts/smoke-c30-razbor.ts
npx tsx scripts/smoke-c36-ig-feed.ts
npx tsx scripts/smoke-c35-ig-agents.ts
```

Re-run evidence (2026-09-20 ~22:33):
```
SMOKE_C37_BADGE_OK
SMOKE_C37_SLIDES_OK
SMOKE_C37_NO_SECRETS_OK
SMOKE_C37_OK
SMOKE_C30_PIPELINE_OK / SMOKE_C30_OK
SMOKE_C36_MOCK_OK / SMOKE_C36_LIVE_SKIP / SMOKE_C36_OK
C-35 smoke OK
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Badge `data-testid="feed-source-badge"` in `StudioModuleWorkspace`; live/mock copy | GREEN | `SMOKE_C37_BADGE_OK`; source ~L276 |
| G2 | `buildCompetitorSlides`: `slideUrls` win (no picsum); live thumb single; mock synthetic picsum | GREEN | `SMOKE_C37_SLIDES_OK`; `razbor-pipeline.ts` L54+ |
| G3 | Without token mock still works (C-30 pipeline + C-36 mock path + C-35 analyst) | GREEN | `SMOKE_C30_OK` + `SMOKE_C36_MOCK_OK` + C-35 OK (`SMOKE_C36_LIVE_SKIP`) |
| G4 | No secrets / Graph / token helpers in client Studio UI files | GREEN | `SMOKE_C37_NO_SECRETS_OK`; grep clean on `components/studio` |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map (architect-spec / ticket)

| AC | Verdict |
|----|---------|
| 1. Live ours + badge live (env-gated) | SKIP / env — UI wires `sourceMode`; live Graph covered by C-36 when configured |
| 2. Competitors live carousels (env-gated) | SKIP / env — same |
| 3. Razbor uses `slideUrls` not picsum when present | GREEN (unit smoke) |
| 4. Without token: mock + demo badge path; no crash | GREEN (C-36 mock + badge source + C-30) |
| 5. No tokens in client / consumed UI | GREEN (client source scan) |

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-37** (present).

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
- No social publish.
- Tokens only server-side (C-36); client never imports `ig-live-feed` / `readIgToken`.
