# Guards — C-audit-02 prompts / Phase1

Wave: `2026-10-16-carousel-audit-fix` · Spec: `architect-spec.md`

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `COMBAT_USER_BRIEFS["carousel-engine"]` has **CTA catalog 1–4** keywords (комментарии / подписка / TG·профиль / лайк+сохранить). |
| G2 | COMBAT carousel **absent** «бронь стола» and «запись в сторис». |
| G3 | `SPRINT9_CAROUSEL_FEWSHOT_BLOCK` embeds **≥3 full JSON** bodies with `"slides": [` arrays (not name-only bullets). |
| G4 | `buildCreateCarouselAgentBundle(scriptwriter)` includes those full few-shots. |
| G5 | `buildRulesBlock` / agent-start: paired invariants once + overlay delta + short mesh identity — **no** full HARD triple-spam. |
| G6 | Designer overlay wording = HTML/CSS-first (not panorama-only as sole truth) — covered by S45 smoke prompts asserts. |

## Commands

```bash
npx tsx scripts/smoke-c-audit-01-routing.ts
# Expect: SMOKE_C_AUDIT_01_ROUTING_OK  (COMBAT + few-shot asserts)

npx tsx scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts
# Expect: SMOKE_W_2026_10_13_SCRIPTWRITER_SWIPE_CTA_OK  (overlay CTA 1–4 + COMBAT)

npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts
# Expect: HTML/CSS-first prompt language still green
```

## Class of defect

Combat CTA drift to club-booking copy; few-shots = fixture names only; agent-start triple-repeats HARD blocks; Designer still promises panorama→slice as sole path.

## Out of scope this guard

LIVE LLM Scriptwriter generation quality → Client.
