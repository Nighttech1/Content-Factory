# Runtime and budget

Existing long-lived standalone startup imports reels-scheduler through instrumentation.ts. Production starts one hourly timer; last attempt/next due stored in data/scout-snapshots/reels-schedule.json. >=72h between paid attempts. REELS_SCOUT_ENABLED=0 disables it; development/build do not collect. No ChatGPT reminder: this is application scheduling.

Reuse IG_SCRAPER_API_KEY, APIFY_TOKEN or APIFY_API_KEY from server env (in priority order); GitHub Actions secret presence does not automatically configure /etc/content-factory/app.env. Do not copy credentials into Git. UI /api/studio/reels-discovery is read-only and reports missing binding.

Provider account cap: GET /v2/users/me/limits; if existing maxMonthlyUsageUsd>5, PUT only maxMonthlyUsageUsd:5, then GET read-back. A lower cap is never raised. Unknown fields, no permissions or active runs => fail closed. Every application run reserves30 cents, persisted before paid request; local ceiling450 cents/cycle, provider preflight includes20 cents buffer. Reservations are upper bounds, not actual bills. maxTotalChargeUsd=.30 and maxItems=60 are sent to the official actor only. No automatic refund on timeout, no immediate paid retry. Other clients/schedules can consume the same $5; the account cap applies globally but cannot protect against a human raising it externally.

One run: @mosarmclub plus3 rotating tags, <=12 per URL, resultsType reels,30-day lookback. Up to20 qualifying competitors. No global 'most viral' guarantee. Captions and metrics only; full-video analysis is explicitly delegated to the owner's existing reelmaker chat, no additional model charge.

Persistent account.lock/schedule.lock are conservative. After process crash investigate active provider runs and ledger before manually removing only an orphan lock; never reset ledger to obtain more credit. Last-good snapshots remain on failures. Provider cycle boundary, not calendar month, resets reservation accounting.

Sources checked2026-11-16:
https://docs.apify.com/api/v2/users-me-limits-get
https://docs.apify.com/api/v2/users-me-limits-put
https://docs.apify.com/api/v2/actors-runs-post
https://apify.com/apify/instagram-scraper/input-schema

Existing separate manual scout-data.yml collector is not scheduled or triggered by this implementation. Do not run legacy ad-hoc CLI collectors concurrently or treat their historical caps as this application's budget ledger.
