# Chain — C-118 / C-119 (retry2 feed stack sizes)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **ticket_limit:** default ≤3 (ровно 2 тикета).  
> **ID lock:** C-118, C-119.  
> **No Apify re-scrape.**

**One-liner:** Frontend → Tester → Deployer localhost → Client (Playwright only)

| # | Role | Ticket | Paths | Done | Notes |
|---|------|--------|-------|------|-------|
| 1 | Frontend | **C-118** | `VerticalPostCarousel.tsx`, `FeedPostCard.tsx` | [x] | stack → `flex flex-col gap-3`; removed inner 2-up; metrics visible |
| 2 | Tester | C-118 | `guards.md` | [x] | Covered by Playwright Client eval: flex-col, live metrics, badge |
| 3 | Fixer | _(если красное)_ | — | [ ] | not needed |
| 4 | Deployer | — | localhost | [x] | HMR / already Ready; feeds 200 |
| 5 | Client | **C-119** | Playwright MCP @1440 | [x] | ПРИНЯТО — carousel + reels screenshots + evaluate |

Skills: `content-factory-ui`, `tester`, `fixer`, `deployer`, `client-scenarios`, `client-review`.

**Не звать:** Backend, AI Bridge, Motion, Coder monolith.

**Path lock:** Frontend finish before Tester; Client only after localhost green + Playwright.
