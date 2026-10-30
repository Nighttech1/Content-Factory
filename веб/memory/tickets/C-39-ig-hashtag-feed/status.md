# Status — C-39

| Status | done |
| Wave | W-2026-09-21-ig-hashtag-competitors |
| Updated | 2026-09-21 |
| Deploy | localhost http://127.0.0.1:3000 — wave Deployer [x] |

## Deployer notes

- Soft-fail mock feed 200; topic query 200; no VPS; no DB wipe.
- Live Graph hashtag path still env-gated (`SMOKE_C39_LIVE_SKIP`).

## Files (done — Backend)

- `lib/studio/topic-hashtags.ts` — deterministic mapper (C-38 contract)
- `lib/studio/ig-live-feed.ts` — hashtag primary + BD fallback
- `lib/studio/ig-feed-config.ts` — `defaultHashtags` + BD fallback docs
- `lib/studio/ig-feed-cache.ts` — cache key topic + hashtags
- `.env.example` — `IG_DEFAULT_HASHTAGS`; competitor usernames = optional fallback
- `scripts/smoke-c39-ig-hashtag-feed.ts`

## Client

- Verdict: **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (wave) — mock soft-fail OK; live needs token + `IG_USER_ID`

