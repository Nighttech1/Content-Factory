# Wave W-2026-09-21-ig-hashtag-competitors

| Field | Value |
|-------|-------|
| **Focus** | Auto-discover competitor carousels by topic via IG Hashtag top_media (no manual competitor links) |
| **Max tickets** | 3 |
| **Status** | client_accepted_with_remarks |
| **Client verdict** | ПРИНЯТО С ЗАМЕЧАНИЯМИ (2026-09-21) |
| **Depends on** | W-2026-09-20-live-ig-carousels (ПРИНЯТО С ЗАМЕЧАНИЯМИ) |
| **Ticket order** | C-38 → C-39 → C-40 |
| **before_sha** | N/A |
| **Architect** | 2026-09-21 — all three tickets **specced** |

## Tickets

| ID | P | Folder | Scope | Result |
|----|---|--------|-------|--------|
| C-38 | P0 | `tickets/C-38-topic-hashtag-agents/` | Researcher: topic→hashtags; deprecate manual competitor list as primary | **done** — guards GREEN; Client OK w/ remarks |
| C-39 | P0 | `tickets/C-39-ig-hashtag-feed/` | Backend: Hashtag Search + top_media; no topic → niche defaults | **done** — guards GREEN; soft-fail mock; LIVE_SKIP |
| C-40 | P0 | `tickets/C-40-competitors-by-topic-ui/` | Frontend: right column refreshes by topic; empty topic = all niche | **done** — guards + HTTP GREEN; Client OK w/ remarks |

## Locked decisions (Architect)

1. Primary competitors = Hashtag `top_media` (topic-derived); BD/`IG_COMPETITOR_USERNAMES` = optional fallback only.
2. Topic→hashtags = deterministic mapper (Backend util + Researcher contract); LLM later optional.
3. Empty topic → `IG_DEFAULT_HASHTAGS` or `armenianclub,yerevan,armenianfood,guestnight`.
4. Prefer `CAROUSEL_ALBUM`; rank by `like_count`; cache topic+hashtags TTL ~10m; max 3 hashtags/request; max ~12 posts; Hashtag API `user_id=IG_USER_ID`.
5. No Instagram HTML scraping.

## Safety

- No Instagram HTML scraping — Graph Hashtag API only.
- No DB wipe / Redis wipe / media delete.
- Secrets only in `.env`.
- Soft-fail → mock if token missing.

## Deployer notes (2026-09-21)

- Localhost: `npm run dev` → http://127.0.0.1:3000 healthy.
- `GET /api/studio/carousel-engine/feed` → **200**, `competitors` array (mock **n=22** without topic).
- `GET .../feed?topic=гостевой` → **200** (mock fixture substring filter may return 0 for Cyrillic — not a crash).
- `GET /studio/carousel-engine` → **200**.
- No VPS. No DB wipe. Deployer [x] on C-38 / C-39 / C-40 chains.

## Client remarks (keep open as notes, not new P0)

1. **Live hashtag path** still needs `IG` token + `IG_USER_ID` — until set, badge stays «Демо-данные» / mock (acceptable per wave).
2. Mock topic filter is Latin title/tag substring — Cyrillic «гостевой» can empty the competitors column until live Graph or richer fixtures.
3. Full Playwright click-through (topic Apply / Сбросить) not run via MCP this pass — contract + HTTP + HTML spot-check used; Orchestrator may re-verify with Playwright if available.

## Next

Wave closed for engineering chain. Prod/VPS only after user explicit OK + no open P0/P1.
