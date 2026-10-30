# Decisions — C-38

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | N/A | Spec 2026-09-21 |
| **after_sha** | | После закрытия |

## Product / tech decisions (locked — wave)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary competitor source | Hashtag `top_media` by topic-derived hashtags | User must not paste competitor links |
| `IG_COMPETITOR_USERNAMES` | Optional BD fallback only; deprecate as primary | Soft migration; empty OK |
| Topic→hashtags | Deterministic mapper; LLM later optional | Ship without LLM key |
| Empty topic | `IG_DEFAULT_HASHTAGS` env OR hardcoded `armenianclub,yerevan,armenianfood,guestnight` | Niche-wide discovery |
| Mapper owner in code | Backend util (C-39); C-38 documents identical contract | AI Bridge can finish without TS |
| `instagramHashtags.source` | `"deterministic_mapper"` for this wave | Future LLM = separate value |
| Scrape | Forbidden | Official Graph only |
| Rate (documented for pack) | Backend queries max 3 hashtags; ≤12 posts | Graph quota |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-21 | Architect | spec+chain+decisions | status → specced |
| 2026-09-21 | AI Bridge | researcher@v3 + skill hashtag contract | status → ai-bridge-done |
| 2026-09-21 | Tester | smoke-c38 + guards.md | status → tester-green |
| 2026-09-21 | Tester | guards + smoke-c38; pack contract checks | status → tester-green |

## Rollback plan

1. Revert Researcher / skill wording to C-35 BD-primary docs.
2. `status.md` → `rolled_back`.
3. Keep ticket folder.
