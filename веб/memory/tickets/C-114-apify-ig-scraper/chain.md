# Chain — C-114…C-117 (W-2026-10-09-ig-scraper-live)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **ticket_limit:** full-queue — не резать на пачки по 3.  
> **ID lock:** C-114…C-117 (не C-107…C-110).

**One-liner:** Backend → Frontend (badge/metrics if needed) → Tester → Fixer → Deployer localhost → Client

| # | Role | Ticket | Paths | Done | Notes |
|---|------|--------|-------|------|-------|
| 1 | Backend | C-114 → C-115 → C-116 | `lib/studio/ig-apify-scraper.ts` (new) or equiv., map/sort util, `ig-live-feed.ts` (`resolveStudioFeed`), `ig-feed-cache.ts`, optional `ig-scraper-config.ts`, `.env.example`, `scripts/smoke-c114-apify-ig-scraper.ts` / probe; feed route only if wire needed | [x] | Actor `apify/instagram-scraper`; limit 50; map+split+sort; wire carousel-engine + custom-reels; clear mock on live OK; soft-fail; **never log API key**. Done 2026-10-09. |
| 2 | Frontend | C-117 | `components/studio/StudioModuleWorkspace.tsx`, `FeedPostCard` / competitors chrome as needed | [x] | Consume live `sourceMode` + metrics; dual-feed for custom-reels; **no** browser Apify; **no** mock merge when API live. Done 2026-10-09: custom-reels → 9/16 + reels empty copy; badge/metrics already OK. |
| 3 | Tester | C-114…C-117 | `memory/tickets/C-114-apify-ig-scraper/guards.md` (+ smoke) | [x] | Soft-fail smoke OK earlier. **Live retest 2026-10-09:** carousel live N=21 CAROUSEL/IMAGE; reels live N=27 VIDEO; metrics OK; no token leak → G-live-1…8 PASS. |
| 4 | Fixer | _(если красное)_ | same as failing step | [ ] | Surgical; no architecture change — not needed (live green) |
| 5 | Deployer | — | localhost | [x] | Restart #2 2026-10-09: kill :3000 → `npm run dev` Ready 5.2s (`.env` + scraper); feeds live 200; **no VPS**. |
| 6 | Client | приёмка | Playwright scenarios / badge + metrics | [x] | **2026-10-09 live re-accept:** ПРИНЯТО. Playwright 1440: carousel «Онлайн» + likes; reels «Онлайн» + views/likes; API live 21/27. Verdict → `client-verdict.md`. |

Skills: `backend`, `content-pipeline-agents` (path B), `content-factory-ui`, `tester`, `fixer`, `deployer`, `client-scenarios` / `client-review`.

**Не звать:** Motion, AI Bridge, WebGL, Coder monolith.

**Path lock:** Backend feed files finish before Frontend workspace; do not parallelize.
