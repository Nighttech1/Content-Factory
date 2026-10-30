# Guards — C-35 IG agents upgrade (Researcher + Analyst)

Date: 2026-09-20  
Role: Tester  
Result: **GREEN**

Executable smoke:
```bash
npx tsx scripts/smoke-c35-ig-agents.ts
npx tsx scripts/smoke-c30-razbor.ts
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | `agents/researcher.md` describes live IG: handles env, metrics as facts, no scrape, no tokens | GREEN | Live Instagram rules + Handle config (`IG_OURS_USERNAME`, `IG_COMPETITOR_USERNAMES`); ban HTML scrape / unofficial API; token names only |
| G2 | `agents/analyst.md` describes live IG: cite real likes/views/comments/slideCount; no scrape/tokens; mock = C-30 | GREEN | Live mode + Mock mode sections; `analyst@v2` |
| G3 | `workers/analyst/prompt.md` + `VERSION.md` = `analyst@v2`; live must cite real numbers | GREEN | SYSTEM rules `sourceMode: "live"` MUST cite; VERSION table **analyst@v2** |
| G4 | `workers/researcher/VERSION.md` exists as `researcher@v2` | GREEN | File present; pack `researcher@v2` (+ `workers/researcher/SKILL.md`) |
| G5 | Skill `content-pipeline-agents` documents Graph/Business Discovery only + env key names + soft-fail → mock + wave C-35→C-36→C-37 | GREEN | Section «Live Instagram discovery» |
| G6 | Secret scan on changed packs (no `EAA`/`IGQ`/`sk-…` / long token literals) | GREEN | ripgrep clean on `agents/*`, `workers/analyst/*`, `workers/researcher/*`, skill, `razbor-pipeline.ts`, ticket folder |
| G7 | `buildAnalystMessages` live cites metrics/slideCount/handle/permalink; mock keeps C-30 wording | GREEN | `SMOKE_C35` via `scripts/smoke-c35-ig-agents.ts` |
| G8 | Mock Razbor regression (C-30 pipeline contract) | GREEN | `SMOKE_C30_OK` (HTTP skipped without BASE_URL — file asserts green) |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| 1. Researcher + Analyst packs describe live IG (handles, metrics, no scrape) | GREEN |
| 2. Analyst prompt + VERSION require real numbers when live | GREEN (`analyst@v2`) |
| 3. Skill documents Graph/Business Discovery + env keys | GREEN (+ soft-fail mock + wave order) |
| 4. Mock Razbor still meaningful deterministic (C-30) | GREEN (smoke-c30 + mock branch in smoke-c35) |
| 5. No secrets / real token examples in changed files | GREEN |

## Extra (ticket verify list)

| Item | Verdict |
|------|---------|
| `workers/researcher/VERSION.md` / `researcher@v2` | GREEN |
| Optional smoke `buildAnalystMessages` live cites numbers | GREEN (`scripts/smoke-c35-ig-agents.ts`) |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md` → **C-35**.

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
- No Graph fetch (out of scope C-36); no social publish.
- Secrets: only env **key names** documented; no values in packs.
