# Scorecard 9.10 — Sprint 9 Carousel + Reels quality

**Wave:** `W-2026-10-15-sprint9-carousel-reels`  
**Tickets:** C-s9-09 (smoke) → C-s9-10 (this file)  
**Measured:** 2026-10-15 · Tester  
**Localhost:** `http://localhost:3001` (Next; port 3000 also responds — treat 3001 as CF app)

## Architect thresholds (wave §7) vs measured

| Metric | Threshold (GREEN) | Measured | Status |
|--------|-------------------|----------|--------|
| **STRICT JSON pass** (carousel handoff/draw) | ≥ **90%** on sample ≥**10** live/smoke runs | Fixture critic+STRICT: **4/4 (100%)** golden carousel; reject paths (bad JSON, COUNT_MISMATCH, flat+purple) = fail as designed. **Live LLM draw sample = 0** (skipped — cost). Effective live n=0 ≪ 10 | **NOT MET** (sample size) |
| **Reels schema pass** (hook+beats+CTA) | ≥ **90%** on ≥**5** runs | Fixture critic+STRICT: **3/3 (100%)**; weak/soft-intro + carousel-on-reels reject OK. Live generate sample = **0** | **NOT MET** (sample size; fixtures OK) |
| **HITL reject rate** («слабо / не Vernatun») | ≤ **30%** | **Not measured** — no human HITL pass this Tester run | **UNKNOWN** |
| **Golden likeness** | ≥ **70%** carousel; ≥ **70%** reels | Fixture golden **pass critic** = 4 carousel + 3 reels. Manual likeness vs visual golden refs **not scored** this run | **PARTIAL** (schema/critic only) |
| **S44–S46 HARD** (automatable smokes) | All relevant **PASS** | S46 swipe/CTA smoke: **PASS** (16/16). S45 models/hook/slice: **22/24** — **FAIL** colors-only captions. S44 visual-deconstructor: **FAIL** Embla `SlicedSlotPreview` + create-from-ref (2 asserts). Playwright Create @1440: Scriptwriter start + handoff chrome **PASS** | **FAIL** |
| **No soft-mock** | **0** success-on-parse-fail | `CREATE_CAROUSEL_NO_MOCK === true`; agent-chat maps critic/STRICT fail → `source: "error"`; assert script green | **PASS** |

## Pipeline / shell (C-s9-09)

| Check | Result |
|-------|--------|
| Razbor → Scriptwriter → Designer handoff present (static) | **PASS** — `RazborModal` `handoffNextForTab`; Create `handoffToDesigner`; route critic before Draft |
| Create starts on Scriptwriter (Playwright @1440) | **PASS** — dialog «Создать карусель», tab «Сценарист» selected, CTA «?», «Передать задание дизайнеру» |
| Sliced preview contract (testid / no panorama-as-preview) | **PASS** static (`create-carousel-preview-sliced`); live draw to Draft **SKIPPED** |
| custom-reels Scriptwriter contract | **PASS** fixtures + `critiqueReelsScript` + route gate; full UI→Draft LLM **SKIPPED** |
| Social publish side-effect | **PASS** — Create publish path writes `status: "unpublished"` draft; no Instagram publish in smoke |
| Shell freeze | **PASS** (this Tester pass: no AppShell/nav edits; upgrade_only docs/scripts only) |

## Commands run

```text
npx tsx scripts/smoke-sprint9-fixtures.ts          → ALL_OK
npx tsx scripts/assert-sprint9-contracts.ts        → CONTRACT_ASSERT_OK
npx tsx scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts → OK
npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts → 22/24 FAIL captions
npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts → FAIL Embla sliced
Playwright MCP @1440 → /studio/carousel-engine → Create → Scriptwriter
```

## Skipped (documented)

1. **Full live LLM** Scriptwriter→Designer→draw→Draft (carousel) — expensive image/LLM; prefer API/fixture STRICT+critic.  
2. **Live custom-reels generate→Draft** — same cost reason; fixture STRICT+critic covers schema.  
3. **HITL / golden likeness manual scoring** — needs Client visual pass after Deployer.

## Gate: Sprint 22 / autonomy

### **NOT GREEN**

Reasons (honest):

1. Live STRICT sample &lt; Architect n≥10 / n≥5.  
2. Automating S44 Embla sliced + S45 colors-only caption smokes **FAIL** (regression vs prior HARD).  
3. HITL reject % and visual golden likeness **unmeasured**.

**Do not** start Sprint 22 autonomy on this scorecard alone.

## 9.11 Fixer targets (do not weaken tests)

| ID | Severity | Target | Evidence |
|----|----------|--------|----------|
| **F-s9-11-a** | P1 | Restore Settings + QuickThemeTuner caption string `Только цвета — разметку придумает Дизайнер` (S45) | `smoke-w-2026-10-13-designer-models-colors-hook.ts` FAIL ×2 |
| **F-s9-11-b** | P1 | Embla Design library: mount `SlicedSlotPreview` + create-from-ref CTA; panorama not sole preview (S44) — or Architect-locked alternative that keeps Client S44 HARD | `smoke-w-2026-10-13-visual-deconstructor.ts` FAIL ×2 (`DesignLibraryCarousel` brandbook-only drift) |
| **F-s9-11-c** | P2 | After F-a/b: run ≥10 carousel STRICT live/fixture draws + ≥5 reels generates; fill HITL + likeness rows | wave §7 sample sizes |

## Overall ticket status

| Ticket | Verdict |
|--------|---------|
| **C-s9-09** | **PASS WITH GAPS** — pipeline handoff + critic + Create Scriptwriter UI smoke green; full Draft LLM skipped; S44/S45 sibling smokes red |
| **C-s9-10** | **NOT GREEN** for Sprint 22 — see table above |
