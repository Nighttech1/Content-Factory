# Tester report — C-s9-09-smoke

**Role:** Тестировщик  
**Date:** 2026-10-15  
**Localhost:** `http://localhost:3001` (Next running; Deployer note: keep 3001 if 3000 is Grafana/other)

## Verdict

**PASS WITH GAPS** (pipeline + critic + Create Scriptwriter UI OK; live Draft LLM skipped; sibling S44/S45 smokes FAIL).

## Evidence

### 1. Fixtures smoke — PASS

```text
npx tsx scripts/smoke-sprint9-fixtures.ts
carousel bento_glass_metrics,bold_poster_invite,dark_editorial_night,dark_notes_coffee
reels ig_coffee_ritual,ig_mute_proof_cta,yt_shorts_club_paradox
flat_hook_reject carousel_quality_reject
carousel_on_reels_reject reels_carousel_forbidden
ALL_OK
```

### 2. Contract assert — PASS

```text
npx tsx scripts/assert-sprint9-contracts.ts
→ CONTRACT_ASSERT_OK
```

Includes: NO_MOCK, fixture critic pass, bad JSON / COUNT_MISMATCH reject, weak carousel/reels reject, Create handoff + Razbor handoff static, sliced preview testid, route critics, S46 CTA hint.

### 3. Playwright @1440 — PASS (entry)

- Navigate `/studio/carousel-engine`
- Click «Создать карусель»
- Dialog open; tab **Сценарист** selected; tabs Дизайнер / Публикация present
- CTA «?» + «Передать задание дизайнеру» present
- Screenshot: `memory/tickets/C-s9-09-smoke/playwright-create-1440.png`

**Skipped:** live Scriptwriter JSON + Designer draw (LLM/image cost). Prefer G1–G2 + agent-chat STRICT.

### 4. custom-reels

- Module page `/studio/custom-reels` loads (title «Рилс»).
- Schema/critic covered by fixtures; live generate skipped.

### 5. S44–S46 automatable — MIXED

| Smoke | Result |
|-------|--------|
| scriptwriter-swipe-cta (S46) | **PASS** |
| designer-models-colors-hook (S45) | **FAIL** — Settings/Tuner missing caption `Только цвета — разметку придумает Дизайнер` |
| visual-deconstructor (S44) | **FAIL** — Embla not wiring `SlicedSlotPreview` + create-from-ref / panorama-not-sole |

## Fixer targets (do not weaken)

1. **F-s9-11-a** — restore colors-only captions (Settings + QuickThemeTuner).  
2. **F-s9-11-b** — restore Embla sliced preview contract or Architect-approved Client S44-equivalent.  
3. Optional **F-s9-11-c** — live STRICT sample ≥10 / reels ≥5 for scorecard green.

## Next

C-s9-10 scorecard → **NOT GREEN** (see wave `scorecard-9.10.md`). Deployer keepalive 3001 → Client after Fixer on F-a/b.

`🧪 **ТЕСТИРОВЩИК:** smoke-sprint9 + assert-sprint9 PASS; Playwright Create→Scriptwriter @1440 PASS; S46 PASS; S44/S45 FAIL → Fixer; scorecard NOT GREEN`
