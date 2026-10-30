# Guards — C-scriptwriter-swipe-cta

Wave: `W-2026-10-13-scriptwriter-swipe-cta` · Scenario: **S46.B** (swipe META + CTA 1–4 + zod)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` states `swipe_trigger = META only (HARD)` and never into `primary_copy` / `secondary_copy`. |
| G2 | Overlay CTA catalog **1–4** exact senses + ask if N missing; user N → `cta_type: N`. |
| G3 | Designer describe/draw overlays: **do not render** `swipe_trigger` as on-slide text. |
| G4 | Zod `carouselCtaTypeSchema` = literals 1\|2\|3\|4 on **root** and **slide**; rejects 5. |
| G5 | `CAROUSEL_JSON_SCHEMA_HINT` documents META swipe + optional `cta_type`. |
| G6 | `lib/mesh/agent-defaults.ts` copywriter: swipe META + CTA catalog HARD. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts
# Expect: SMOKE_W_2026_10_13_SCRIPTWRITER_SWIPE_CTA_OK
```

Live Client: **S46.B** — Scriptwriter artifact has meta `swipe_trigger` + correct `cta_type` when user names N.

## Class of defect

`swipe_trigger` treated as on-slide copy; invent 5th CTA; silent CTA without ask; zod accepts `cta_type` outside 1–4.
