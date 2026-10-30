# Decisions — C-36

## D1 — No Prisma / no Redis this wave

Feed is ephemeral Studio UX. In-memory singleton cache (TTL 10 minutes, clamp 5–15) is enough. Persist competitor snapshots later only via new ticket.

## D2 — Metrics mapping (locked for this wave)

| Field | Source |
|-------|--------|
| `likes` | `like_count` on media (ours + BD when available) |
| `comments` | `comments_count` |
| `views` | **Always `0` on the Studio feed path this wave** — no per-media insights fetch (would be N+1 Graph calls / rate risk). Likes/comments are primary. Do **not** invent views from likes. Competitors: `0`. UI may show 0 honestly in live mode. |

Analytics cron (`instagram-graph.ts` insights) is unchanged and separate from feed.

## D3 — Partial live

If ours succeeds and competitors fail (or empty usernames): return live ours + empty or fixture competitors. Per-post `sourceMode` accurate; top-level `sourceMode: "live"` if any live post exists.

## D4 — Live only for `carousel-engine`

Other core modules keep fixtures. Avoid surprise live calls and BD quota burn.

## D5 — Competitor seed in `.env.example`

Comment-only placeholders (e.g. niche Armenian club handles). Product owner replaces with real competitors. Empty list is valid.

## D6 — Media preference

Prefer `CAROUSEL_ALBUM` for grid; if fewer than ~8–12, backfill with `IMAGE`. Skip `VIDEO` in carousel-engine grid unless needed for density (default skip VIDEO).

## D7 — Shared token helper

Prefer extracting `readIgToken()` used by analytics adapter + live feed — behaviour of analytics cron unchanged (still soft-fail).

## D9 — Cache keys (locked)

Separate keys (topic applied after fetch for competitors):
- `carousel-engine:ours:{igUserId}`
- `carousel-engine:competitors:{igUserId}:{sortedUsernames}`

TTL **10 minutes** (`IG_FEED_CACHE_TTL_MS`). Partial live allowed; top-level `sourceMode: "live"` if any post is live.
