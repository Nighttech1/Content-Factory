# Apify Instagram scraper — Scout-only + cost discipline (S51 → **S52 Scout bind**)

**Symptom (legacy S51):** Apify bill jumps while the user believes they scraped once.  
**Cause class:** many `run-sync-get-dataset-items` (TTL miss, dual module, remount/refetch, **feed GET on Competitors open**).

**Canon (S52 Scout bind — supersedes “scrape on feed GET”):** Apify is **bound only to Scout**. Competitors feed **never** pays Apify.

Secrets (`IG_SCRAPER_API_KEY`) — **never** in this file, tickets, or chat logs.

## Who may call Apify (HARD)

| Trigger | Apify? |
|---------|--------|
| Manual Scout CTA **«Разведать»** (Team → Scout panel) | **YES** — one Scout run → write **snapshot** |
| Scheduled **auto-scout** (Scout settings frequency) | **YES** — same Scout run path |
| `GET` Studio feed / Competitors open / focus / remount / SWR refetch / topic search UI | **NO** — return **last Scout snapshot** only (or empty/mock soft-fail) |
| Mesh bootstrap / Razbor / agent-start / AI Bridge tools / Settings | **NO** |

## Call-volume audit (Backend)

1. Grep / log counters (dev-only): each Apify POST → `apify_run_count` with `moduleId` + `trigger=manual|schedule` + `cache=HIT|MISS` (no token).
2. Trace: Studio Competitors mount / feed GET must show **0** Apify POSTs (network or counter).
3. Confirm AI Bridge / agent-start / Razbor **do not** call scraper (HARD).
4. Report in ticket: runs / day before vs after; assert feed-open runs = 0.

## Cost controls (must)

| Control | Canon |
|---------|--------|
| **Scout snapshot SoT** | Paid scrape writes durable/server snapshot consumed by feed; feed reads snapshot **without** Apify |
| **Server TTL / reuse** | Still dedup in-flight Scout runs; raw fetch → filter CAROUSEL vs REEL from same raw when topic identical |
| **resultsLimit** | Keep **≤50** |
| **No feed-paid path** | Competitors page load / focus / remount / SWR = **0** CU |
| **No tool spam** | LLM tools must not “refresh Instagram” / call Scout scrape without Architect + HITL |

## Auto-scout filters + schedule (Scout settings → Backend)

Scout settings (Team inspector) drive the **only** paid path:

| Field group | Examples (Architect schema) |
|-------------|-------------------------------|
| **Virality / engagement filters** | min likes, min views/plays, min comments, composite score / top-N |
| **Frequency schedule** | daily / weekly / cron-like interval; next-run persisted |

Scheduled job calls the **same** Scout run entrypoint as «Разведать» — not a separate feed scrape.

## Monthly estimate (ops — Scout-driven)

| Mode | Runs / day | Notes |
|------|------------|-------|
| **Disciplined** (manual + ≤1–2 schedules/day, snapshot feed) | **1–2** paid | Target after Scout bind |
| **Spam** (Apify on every Competitors open / remount) | **20–100+** | **FORBIDDEN** |

Rough $: `runs × CU_per_run × $per_CU`. Document range in ticket notes — **no API keys**.

## Soft-fail

Missing key / 4xx / empty → keep previous snapshot or mock/empty per S50; **never** retry-storm Apify; **never** scrape from feed GET as fallback.

## Related

- `backend/SKILL.md` § Live Instagram scraper + Scout-only
- `ai-bridge/SKILL.md` Scout / no-scraper bar
- `xyflow-agent-mesh` Scout «Разведать» + auto-scout settings
- `content-factory-ui` Competitors = last snapshot
- Client Playwright **S52.D**
