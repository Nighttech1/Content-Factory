# Done — C-s9-07-strict-contracts

**Status:** done  
**Role:** AI Bridge (+ Backend helpers)

## Changes

- `carousel-json-contract.ts` — `assertCarouselCtaCatalog`, `assertCarouselVisualPrompts`, `parseAndAssertCarouselJsonStrict`
- `reels-script-contract.ts` — STRICT assert throws `ReelsScriptParseError`
- `agent-chat/route.ts` — draw uses STRICT; critic+error mapping; custom-reels fail ≠ mock
- Thresholds: `memory/waves/.../strict-thresholds.md`
- Loader validates goldens via STRICT parse

## Acceptance

Invalid carousel / reels / carousel-on-reels → non-success. Soft-mock ban documented.
