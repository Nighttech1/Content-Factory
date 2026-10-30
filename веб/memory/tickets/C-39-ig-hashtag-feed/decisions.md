# Decisions — C-39

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | N/A | Spec 2026-09-21 |
| **after_sha** | | После закрытия |

## Product / tech decisions (locked — wave)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary competitor source | `ig_hashtag_search` + `/{id}/top_media` | Auto-discover by topic |
| Fallback media | `recent_media` if top empty | Resilience |
| BD / `IG_COMPETITOR_USERNAMES` | Optional fallback only when hashtag yields 0 | Deprecate primary |
| Topic→hashtags | Deterministic util `topic-hashtags.ts`; no LLM | Ship without key |
| Empty topic | `IG_DEFAULT_HASHTAGS` or `armenianclub,yerevan,armenianfood,guestnight` | Niche-wide |
| Media prefer | `CAROUSEL_ALBUM` then `IMAGE`; skip `VIDEO` | Product carousels |
| Rank | `like_count` desc when present | «Top» signal |
| Cache | Key = igUserId + topic + sorted hashtags; TTL ~10 min | Match C-36 TTL |
| Rate | Max 3 hashtags / request; max ~12 competitor posts | Graph quota |
| Hashtag `user_id` | Always `IG_USER_ID` | API requirement |
| Ours feed | Unchanged `/{IG_USER_ID}/media` | Scope |
| Soft-fail | Fixtures; no 500; never log token | C-36 pattern |
| Competitor `username` display | Prefer Graph owner if available; else `#hashtag` / `hashtag:{tag}` | Hashtag media may lack owner |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-21 | Architect | spec+chain+decisions | status → specced |
| 2026-09-21 | Backend | mapper + hashtag feed + smoke-c39 | status → backend-done |

## Username display (implement-time)

| Case | Choice |
|------|--------|
| Graph returns owner/username | Use that handle |
| Hashtag media without owner | `#${tag}` display handle |

## Rollback plan

1. Restore competitors branch to Business Discovery-only + prior cache keys.
2. Remove `topic-hashtags.ts` / revert `.env.example`.
3. `status.md` → `rolled_back`.
4. Localhost sync; keep ticket folder.
