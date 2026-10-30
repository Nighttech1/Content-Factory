# Architect spec — C-s9-07-strict-contracts (P0)

> DEV_PLAN **9.7** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

Жёсткая валидация: **parse fail = fail job** (HTTP/job error), не soft-mock / empty success. Carousel + reels. Пороги задокументировать в memory.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-07-carousel** | `parseAndAssertCarouselJson` already STRICT — audit all call sites; Create/Razbor/handoff/draw must surface error, never soft-ack success |
| **D-s9-07-reels** | Upgrade `parseReelsScriptArtifact` to **assert** mode (or `parseAndAssertReelsScript`) — missing hook/beats/CTA → fail |
| **D-s9-07-keys** | Prefer strengthen validators; breaking key rename **forbidden** without dual-read migration |
| **D-s9-07-doc** | `memory/waves/W-2026-10-15-sprint9-carousel-reels/strict-thresholds.md` |
| **D-s9-07-create-no-mock** | Keep `CREATE_CAROUSEL_NO_MOCK = true` |

## Exact files

**AI Bridge + Backend may edit:**

- `lib/studio/carousel-json-contract.ts`
- `lib/studio/reels-script-contract.ts`
- `app/api/studio/agent-chat/route.ts` (error mapping only)
- Related job wrappers if any soft-swallow errors

## MUST NOT

- Soft-mock success paths for Create carousel / reels generate
- UI redesign
- Pipeline agent removal

## Acceptance

- [ ] Invalid carousel JSON → non-success response
- [ ] Invalid/missing reels hook/beats/CTA → non-success
- [ ] Carousel-shaped payload rejected on reels path
- [ ] Thresholds doc written

## Skills

`carousel-json-contract` · `reels-scriptwriter` · `backend` § Sprint 9 STRICT · `tester`
