# Status — C-40

| Status | done |
| Wave | W-2026-09-21-ig-hashtag-competitors |
| Updated | 2026-09-21 |
| Deploy | localhost http://127.0.0.1:3000 (npm run dev) |

## Client

- Verdict: **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (wave)
- Remarks: live IG token + `IG_USER_ID` still needed for real hashtag path; mock OK
- **Fixer (2026-09-21):** Cyrillic `topic=гостевой` no longer empties mock competitors — `matchesTopic` uses `mapTopicToHashtags` aliases (`guestnight` ↔ `guest-night`)
- Guards: `guards.md` + `scripts/smoke-c40-competitors-by-topic-ui.ts` + regression-guards C-40

## Files (done — Frontend)

- `components/studio/StudioModuleWorkspace.tsx` — empty topic clear → niche refetch; copy; competitorsLoading
- `components/studio/workspace/ModuleIdeaBar.tsx` — clear «Сбросить»; auto-topic hint; empty commit allowed

## Deployer notes

- Feed niche: 200, competitors n=22 mock
- Topic + page: 200; no VPS; no DB wipe
