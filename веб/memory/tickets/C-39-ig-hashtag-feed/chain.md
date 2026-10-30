# Chain — C-39

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-38 contract (pack preferred merged).  
> **Порядок волны:** C-38 → **C-39** → C-40.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/studio/topic-hashtags.ts` (new), `lib/studio/ig-live-feed.ts`, `lib/studio/ig-feed-config.ts`, `lib/studio/ig-feed-cache.ts`, `app/api/studio/[moduleId]/feed/route.ts` (wire only if needed), `.env.example`, `scripts/smoke-c39-ig-hashtag-feed.ts` (or extend C-36 smoke) | [x] | Hashtag search + top_media; empty topic defaults; BD optional fallback; cache topic+hashtags; soft-fail; **no scrape** |
| 2 | Tester | `memory/tickets/C-39-ig-hashtag-feed/guards.md` | [x] | Mapper unit; soft-fail without token; cache key; rate caps; live optional — GREEN 2026-09-21 |
| 3 | Fixer | _(если красное)_ | [ ] | Surgical; no architecture change |
| 4 | Deployer | localhost | [x] | 2026-09-21 — localhost healthy; feed + topic smoke 200; no VPS |
| 5 | Client | приёмка | [x] | 2026-09-21 — wave ПРИНЯТО С ЗАМЕЧАНИЯМИ; LIVE_SKIP noted |

Skills: `backend`, `sse-job-stream` N/A, Instagram Graph notes from prior C-36.  
**Не звать:** Frontend (C-40), AI Bridge (done in C-38), Motion, Coder monolith.
