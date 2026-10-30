# Guards — C-40 Competitors column by topic (UI)

Date: 2026-09-21  
Role: Tester  
Result: **GREEN**

Executable smoke:
```bash
npx tsx scripts/smoke-c40-competitors-by-topic-ui.ts
```

Optional HTTP (after Deployer / localhost up):
```bash
# same script auto-tries BASE_URL (default http://127.0.0.1:3000)
# expects: SMOKE_C40_HTTP_OK (or SMOKE_C40_HTTP_SKIP if server down)
```

Observed this run (source contract):
```
SMOKE_C40_MOUNT_OK
SMOKE_C40_CLEAR_OK
SMOKE_C40_NO_URL_COPY_OK
SMOKE_C40_LOADING_OK
SMOKE_C40_HTTP_SKIP (fetch failed — Deployer to bring localhost)
SMOKE_C40_OK
```

After Deployer (localhost up):
```
FEED_STATUS=200 COMPETITORS COUNT=22 SOURCE=mock
TOPIC_FEED_STATUS=200 topic=гостевой → non-empty mock (hashtag alias guestnight ↔ guest-night)
PAGE_STATUS=200
SMOKE_C40_HTTP_COMPETITORS_OK n=22
SMOKE_C40_HTTP_TOPIC_OK n≥1
SMOKE_C40_HTTP_OK
SMOKE_C40_OK
```

Regression (wave peers):
```bash
npx tsx scripts/smoke-c39-ig-hashtag-feed.ts   # GREEN (LIVE_SKIP OK)
npx tsx scripts/smoke-c38-topic-hashtags.ts    # GREEN
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Mount: `fetchFeed(undefined, "full")` — competitors without topic | GREEN | `SMOKE_C40_MOUNT_OK`; `StudioModuleWorkspace` useEffect |
| G2 | Topic clear / empty commit → `fetchFeed(..., "competitors")` niche; no early-return on `!next` | GREEN | `SMOKE_C40_CLEAR_OK`; `handleTopicCommit` + `module-idea-clear` → `onTopicCommit("")` |
| G3 | No copy asking for competitor URLs / nicks as CTA | GREEN | `SMOKE_C40_NO_URL_COPY_OK`; auto-hint «Конкуренты подбираются по теме автоматически» |
| G4 | Loading: `competitorsLoading` on competitors-mode refresh; column `feedLoading \|\| competitorsLoading` | GREEN | `SMOKE_C40_LOADING_OK` |
| G5 | Empty-topic subtitle / emptyLabel = niche, not «добавьте конкурентов» | GREEN | «Актуальные карусели ниши» / «Пока нет каруселей ниши» |
| G6 | HTTP localhost: feed + topic + page 200; competitors array | GREEN | Deployer smoke; `SMOKE_C40_HTTP_OK` |
| Fixer | Cyrillic topic empty competitors | GREEN | `matchesTopic` + `mapTopicToHashtags`; `SMOKE_C40_GUEST_TOPIC_OK` |

## Fixer notes (2026-09-21)

**Symptom:** `?topic=гостевой` emptied mock competitors (Latin substring only on title/tags).

**Cause:** `matchesTopic` did not use hashtag aliases from `mapTopicToHashtags` (`guestnight` ↔ fixture `guest-night`).

**Fix:** `lib/studio/feed-fixtures.ts` — also match mapped hashtags with hyphen/underscore normalization. Graph live path untouched.

**Guard:** `assertGuestTopicMockCompetitors` in `scripts/smoke-c40-competitors-by-topic-ui.ts`.

## Acceptance criteria map (architect-spec / ticket)

| AC | Verdict |
|----|---------|
| 1. Open carousel-engine → competitors without topic | GREEN (source + C-39 soft-fail mock) |
| 2. Apply topic → competitors refresh | GREEN (commit → mode competitors) |
| 3. Clear topic → niche again | GREEN (clear control) |
| 4. No competitor link/nick prompts | GREEN |
| 5. Without IG token — mock, no crash | GREEN (C-39 soft-fail + UI wiring); HTTP recheck after Deployer |
| 6. Guard executable | GREEN (`scripts/smoke-c40-competitors-by-topic-ui.ts`) |

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-40**.

## Safety

- No DB wipe / migrate / Redis wipe / generatedMedia delete.
- No social publish.
- No secrets in client UI.
- Live Graph optional — CI must not fail without token/server for source asserts.
