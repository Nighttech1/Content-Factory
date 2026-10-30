# Guards — 2026-10-17 carousel correct pipeline (Tester step 5)

**Date:** 2026-10-17  
**Role:** Тестировщик  
**Verdict:** **GREEN** for chain step 5 (unit/smoke). HTTP live skipped — localhost server was **DOWN** (Deployer). No Fixer tasks for wave paths.  
**Do not weaken.** Client S55 Playwright still required later (not this step).

---

## Commands run

| # | Check | Result |
|---|--------|--------|
| 1 | `npx tsx scripts/smoke-sheet-preflight.ts` | **PASS** `ok: true`, sampleTopic `«Кумовство»`, meetings pickable=1, useful ok |
| 2 | Critic ⊃ zod + `SCRIPTWRITER_CRITIC_MAX_RETRIES=2` | **PASS** (source + `scripts/smoke-correct-pipeline-guards.ts`) |
| 3 | Vision `MAX_VISION_GENS_PER_SLIDE=2` | **PASS** |
| 4 | Brand / Landscapes / Logs stores | **PASS** unit (JSON SoT). GET HTTP **SKIP** — server down |
| 5 | Create path imports | **PASS** (`create-carousel-prompts`, contract, critic, `correct-pipeline-job`, `carousel-html-renderer`) |
| 6 | `npx tsc --noEmit` | Wave files: **0 errors**. Pre-existing unrelated: see § TSC |
| 7 | CTA 1–4 + `swipe_trigger` meta KEEP | **PASS** (contract + prompts + critic-05) |

**Reusable smoke:** `npx tsx scripts/smoke-correct-pipeline-guards.ts` → `{ ok: true, SCRIPTWRITER_CRITIC_MAX_RETRIES: 2, MAX_VISION_GENS_PER_SLIDE: 2, … }`.

---

## Assert matrix (product contracts)

### G1 — Sheet preflight visibility

- Public CSV readable for sheet `1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls`.
- Meetings headers include `Тема`,`Статус`; sample pickable when status `1`.
- Useful headers include `topic`,`СТА`,`hero`.
- Write-back off → local mirror only (`writeEnabled: false`).

### G2 — Critic supplements zod (not replaces)

- `critiqueCarouselHandoff` calls `parseAndAssertCarouselJsonStrict` **first**, then `runCarouselCritic05`.
- `SCRIPTWRITER_CRITIC_MAX_RETRIES === 2` in `lib/studio/carousel-critic-05.ts` (re-exported from `carousel-quality-critic.ts`).
- `shouldRetryScriptwriterAfterCritic(0|1) === true`; `(2) === false`.
- Backend loop in `lib/intake/correct-pipeline-job.ts`: `for (attempt = 0; attempt <= SCRIPTWRITER_CRITIC_MAX_RETRIES; …)`.

### G3 — Vision ≤2 gens → needs_review

- `MAX_VISION_GENS_PER_SLIDE === 2` in `lib/studio/carousel-vision-text-check.ts`.
- `canRetryVisionSlideGen(gensUsed)` true only while `gensUsed < 2`.
- `visionDecideRetryOrReview` with fail + `shouldRetry: false` → `needsReview: true`.
- Draw loop: `while (gens < MAX_VISION_GENS_PER_SLIDE)` in `carousel-html-renderer.ts`.

### G4 — Brand / Landscapes / Logs APIs (unit SoT)

| Surface | Module | Assert |
|---------|--------|--------|
| Brand | `lib/settings/brand-store.ts` + `app/api/settings/brand/route.ts` | get/put persist `brandName` |
| Landscapes | `lib/settings/landscapes-store.ts` + `app/api/settings/landscapes/route.ts` | upsert by number + photos |
| Logs / RED | `lib/agents/agent-run-log-store.ts` + `app/api/agents/logs/route.ts` | append error → `getAgentErrorFlag.hasError` |

FE wiring (static): Settings order Design → Brand → Landscapes (`SettingsShell` / `SettingsQuickNav`); testids `settings-brand-panel`, `settings-landscapes-panel`, `agent-inspector-tab-logs`, `data-agent-error`.

### G5 — Create chat path still loads

Imports without throw:

- `lib/studio/create-carousel-prompts.ts`
- `lib/studio/carousel-json-contract.ts`
- `lib/studio/carousel-quality-critic.ts`
- `lib/intake/correct-pipeline-job.ts`
- `lib/studio/carousel-html-renderer.ts`

### G6 — CTA / swipe KEEP (S46 spirit)

- zod: `swipe_trigger` required on slides; `cta_type` 1–4 catalog checks in contract.
- Prompts: «CTA catalog 1–4», «swipe_trigger = META only / never paint».
- Critic-05: empty swipe / swipe==on-slide copy → fail.

### G7 — shell_freeze

- Diff scope: no AppShell / left-nav IA edits claimed by Frontend; Tester did not open AppShell churn (static report OK). Live UI = Client S55.

---

## TSC — new wave files

**0 errors** matching:

`lib/intake/**`, `lib/settings/brand*`, `lib/settings/landscapes*`, `carousel-critic-05`, `carousel-vision-text-check`, `carousel-quality-critic`, `BrandPanel`, `LandscapesPanel`, `PublicistSettingsPanel`, agent logs routes, `correct-pipeline-job`.

### Pre-existing (out of wave — do **not** block step 5; optional later cleanup)

```
components/ui/animated-file-tree.tsx(175,7): TS2322 drag handler vs framer PanInfo
lib/db/boards-repository.ts(221,59): TS1501 regex flag needs es2018+
scripts/smoke-c32-ours-tabs.ts(52,19): TS2339 draft on RazborCascadePayload
scripts/smoke-c53-workspace-mesh.ts(79,10): TS2367 9 vs 7
scripts/smoke-sprint8-postgres-sot.ts(202,41)/(210,43): TS2367 draft vs SCHEDULED
```

---

## Fixer tasks

**None** for wave paths. Do not weaken guards.

### Deployer note (not Fixer)

1. Bring localhost up so Client can hit:
   - `GET /api/intake/sheet/preflight`
   - `GET/PUT /api/settings/brand`
   - `GET/PUT/POST /api/settings/landscapes`
   - `GET /api/agents/logs` (+ RED)
2. Re-run HTTP smoke after up (optional): curl/preflight + brand PUT roundtrip.

---

## Files under guard

| Path | Role |
|------|------|
| `scripts/smoke-sheet-preflight.ts` | Sheet visibility |
| `scripts/smoke-correct-pipeline-guards.ts` | Critic/vision/stores/imports |
| `lib/studio/carousel-critic-05.ts` | retry=2 + quality rules |
| `lib/studio/carousel-quality-critic.ts` | zod then critic-05 |
| `lib/studio/carousel-vision-text-check.ts` | max 2 gens |
| `lib/intake/correct-pipeline-job.ts` | SW retry loop + draft flags |
| `lib/settings/brand-store.ts` | Brand SoT |
| `lib/settings/landscapes-store.ts` | Landscapes SoT |
| `lib/agents/agent-run-log-store.ts` | Logs + RED signal |
| `components/settings/BrandPanel.tsx` | S55.A Brand |
| `components/settings/LandscapesPanel.tsx` | S55.A Landscapes |

---

`🧪 **ТЕСТИРОВЩИК:** sheet preflight OK; critic⊃zod retry=2; vision≤2; brand/landscapes/logs unit OK; create imports OK; wave tsc 0; guards: memory/waves/2026-10-17-carousel-correct-pipeline/guards.md · Fixer: none · Deployer: start localhost for Client S55`
