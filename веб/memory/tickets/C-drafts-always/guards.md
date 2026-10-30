# Guards — C-drafts-always

Wave: `W-2026-10-13-drafts-design-team` · Scenario: **S43.1**

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | After **successful Designer draw** → `upsertDraft` into `cf.carousel.drafts.v1`, status `unpublished`, **stable draft id** (same id later used on publish). |
| G2 | After **Опубликовать** → `publishCreateCarousel` still `upsertDraft` (same id) + schedule slot. |
| G3 | After draw **and** after publish → `onDraftPersisted` bumps `openDraftsNonce` → Ours toggle switches to **Черновики** (no F5). |
| G4 | Empty Черновики copy mentions **Create** (создайте карусель) **and** **Разбор**. |
| G5 | Draw/publish **error** → no fake draft / no nonce bump. |
| G6 | `RazborModal.tsx` **untouched** by this ticket (freeze). |

## Commands

```bash
# Static + unit/contract (draft upsert helpers, empty copy, nonce wire)
npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
# Expect: SMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK
```

Live Client: **S43.1** Playwright @1440 — Create → draw/publish → Черновики card visible without F5.

## Class of defect

Empty drafts rail after successful Create draw/publish; different draft ids on draw vs publish; empty copy mentions only Разбор; accidental RazborModal edits.
