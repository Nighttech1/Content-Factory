# Decisions — C-35

## D1 — Agents before fetch code

Upgrade Researcher/Analyst **before** Backend Graph client so C-36 maps media → `FeedPost` into a known agent contract (live metrics language, handle env names). Avoids rework of prompts after field rename.

## D2 — Razbor copy ownership

AI Bridge may edit **deterministic string templates** in `buildAnalystMessages` for live/mock branching. Fetch, cache, Graph — Backend C-36 only. UI badge — Frontend C-37.

## D3 — No new LLM provider required

Live mode does **not** require a new model slot. Existing Analyst slot (`gpt-4o-mini` / settings) stays; mock deterministic path remains default when no LLM key (C-30).

## D4 — Competitor handles are product data, not secrets

Usernames go in `IG_COMPETITOR_USERNAMES` (env). Tokens stay in existing IG token vars. Agent docs list **key names only**.

## D5 — Additive optional FeedPost fields in C-35 (AI Bridge)

Architect noted full types land in C-36, but Razbor `buildAnalystMessages` needs compile-safe live fields. Added **optional** fields on `FeedPost` in `feed-types.ts`: `sourceMode`, `username`, `externalId`, `permalink`, `mediaType`, `slideUrls`. Fixtures unchanged (omit = mock branch / C-30 regression). No fetch client. C-36 maps Graph → these fields.

## D6 — Prompt pack versions

- `researcher@v2` — live handles / observedPosts / no scrape
- `analyst@v2` — live cite real metrics; mock keeps canned language; `ANALYST_PROMPT_VERSION` bumped to match
- `workers/researcher/PLUGINS.md` left unchanged (no new MCP; Graph stays Backend C-36)
