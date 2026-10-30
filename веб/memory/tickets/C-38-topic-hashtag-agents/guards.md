# Guards — C-38 Topic → hashtags (Researcher upgrade)

Date: 2026-09-21  
Role: Tester  
Result: **GREEN**

Executable smoke:
```bash
npx tsx scripts/smoke-c38-topic-hashtags.ts
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | `instagramHashtags` contract in agent + worker + pipeline skill (`topic`, `hashtags`, `source: deterministic_mapper`, `emptyTopic`) | GREEN | Packs + `SMOKE_C38` |
| G2 | Empty topic defaults: `IG_DEFAULT_HASHTAGS` else `armenianclub,yerevan,armenianfood,guestnight` | GREEN | All three pack surfaces |
| G3 | `IG_COMPETITOR_USERNAMES` / Business Discovery marked **optional fallback only** (not primary) | GREEN | researcher.md, SKILL.md, content-pipeline-agents |
| G4 | No HTML scrape instructions; scrape forbidden; Graph Hashtag Search + `top_media` primary | GREEN | Forbidden wording in packs; no «Business Discovery only» as primary |
| G5 | Worker pack version `researcher@v3` | GREEN | `workers/researcher/SKILL.md` + `VERSION.md` |
| G6 | Secret scan — no token-like literals in pack surfaces | GREEN | smoke secretRe clean |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| 1. Researcher / skill: competitors via topic hashtags, not manual nick list | GREEN |
| 2. Empty topic → documented niche defaults (env override allowed) | GREEN |
| 3. Output has `instagramHashtags` with contract fields | GREEN |
| 4. `IG_COMPETITOR_USERNAMES` optional fallback only | GREEN |
| 5. No HTML scrape Instagram instructions | GREEN |
| 6. Guard: pack/skill smoke, no Graph call | GREEN (`scripts/smoke-c38-topic-hashtags.ts`) |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md` → **C-38**.

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
- No Graph fetch (out of scope — C-39); no social publish.
- Secrets: only env **key names** documented; no values in packs.
