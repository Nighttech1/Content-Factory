# Wave — Live IG scraper → Конкуренты

| Field | Value |
|-------|-------|
| **Status** | **accepted** — C-118/C-119 Playwright @1440 (carousel + reels) |
| **Provider** | Apify (`IG_SCRAPER_API_KEY` = apify token; never log) |
| **Ticket limit** | default ≤3 (retry2 = 2 tickets) |
| **Spec (data wave)** | `memory/tickets/C-114-apify-ig-scraper/architect-spec.md` |
| **Spec (retry2 UI)** | `memory/tickets/C-118-feed-stack-sizes/architect-spec.md` |
| **Chain (retry2)** | `memory/tickets/C-118-feed-stack-sizes/chain.md` |
| **Trainer** | `memory/trainer/W-2026-10-09-ig-scraper-live-grade.md` (RETRY2 section) |
| **Client verdict (C-114)** | superseded for accept — Playwright gate failed on user complaint |

## ID lock

**C-114…C-117** — data/scraper path (done; **no re-scrape** in retry2).  
**C-118 / C-119** — retry2 UI density + Playwright Client only.

Former draft ids C-107…C-110 on this wave are **void** — those numbers belong to UX-8 (mesh/schedule).

## Architect plan (original — closed)

| ID | Scope |
|----|--------|
| **C-114** | Apify Instagram Scraper client: fetch ~50 public posts (hashtag niche); cache TTL; no secret logging |
| **C-115** | Map → FeedPost; split CAROUSEL vs REEL/VIDEO; sort by popularity (likes+comments+views) |
| **C-116** | Wire competitors for `carousel-engine` + `custom-reels`; clear mock competitors when live OK |
| **C-117** | Real metrics on cards (likes/comments/views); sourceMode=live; UI badge; no browser Apify |

## Architect plan (retry2)

| ID | Scope |
|----|--------|
| **C-118** | Restore single-column 9/16 stack (remove inner `lg:grid-cols-2`); readable metrics/username under media |
| **C-119** | Client Playwright-only re-acceptance @1440 (HARD GATE) |

## chain.md (retry2)

Frontend → Tester → Deployer localhost → Client (Playwright)

Secrets: never log/print token. **No new Apify scrape.**

## Close (pending retry2)

- C-114…C-117 live feeds remain (carousel-engine N≈21, custom-reels N≈27, `sourceMode=live`) — reuse cache/API
- C-118: cards one-wide per column; metrics readable
- C-119: Client Playwright @1440 proves live look (Онлайн / usernames+metrics)
- Wave re-close only after C-119 ПРИНЯТО with Playwright evidence
