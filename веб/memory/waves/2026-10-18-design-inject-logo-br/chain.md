# Chain — 2026-10-18 FULL DESIGN inject + logo BR + rich SW + layout variety

> **ticket_limit:** `full-queue` (locks 1–8 + smoke / tickets C-* одним проходом)  
> **shell_freeze:** `true` (AppShell / nav freeze)  
> **upgrade_only:** `true`  
> **NO auto-remake:** HARD  
> **Frontend:** **omit** unless architect-spec §9 (Brand / deconstruct UI broken)  
> Wave spec: `memory/waves/2026-10-18-design-inject-logo-br/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-18-design-inject-logo-br-grade.md` (grade **A**)  
> Card: `plugins/trainer/design-inject-logo-br.md`  
> Skills: `carousel-json-contract` Phase 7 · `create-carousel-prompts-notes` § FULL DESIGN · `art-director/html-layout-variant-a` · `critique-checklist` · `ai-bridge` · `content-pipeline-agents` · `backend` · `tester`  
> **plan_then_act:** на каждом шаге роль пишет план → действие  
> **Client:** optional (Orchestrator arms)  
> **VPS checklist:** Orchestrator **after** smoke — not specialist steps

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade A + skills FULL DESIGN / logo BR / secondary_copy / fontFit / variety / deconstruct | [x] | Grade A; Architect may enter |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — **FULL DESIGN TOKENS** positive table every Designer draw; strip/replace «do not assume 64px» as primary guidance; palette→bg mood; Scriptwriter **secondary_copy 2–3× richer** HARD; `visual_prompt` ≥3 elements + motifs **optional** (remove laundry-list force); Designer **layout variety** + **fontFit reduce-only** wording; `lib/studio/art-director-review.ts` — checklist: logo BR + name-inline-right, variety, thin secondary_copy, ignored FULL colors; `lib/agents/deconstructStyle.ts` — parser/prompt ensures **colors + fonts + sizes** in DesignPreset output. Optional: `lib/mesh/agent-defaults.ts` Scriptwriter/Designer deltas if overlays insufficient. Align notes only if runtime reads them. **Не** `carousel-layered-composite.ts` CSS; **не** `design-library.ts` payload shape impl (Backend); **не** AppShell; **не** BrandPanel | [x] | Overlays+deconstruct agent+checklist live; report `ai-bridge-report.md` |
| 3 | **Backend** | `lib/settings/design-library.ts` — expand `buildDesignTokensPayload` / `formatActiveDesignMdForPrompt` to **full role table** (family+size+color per title/body/content/accent/slideNumber/…). `lib/studio/carousel-layered-composite.ts` — default `brandChrome` **bottom-right**; enlarged icon; transparent img bg; flex row icon→name; `.slide-num` body tokens + pretty **`N / M`**; apply `fontFit` reduce-only (never enlarge above DESIGN); variety validate / rotate `synthesizeFallbackHtmlLayout`. KEEP `lib/intake/placeholders.ts` dual-path raw logo. Deconstruct persist: `lib/studio/deconstruct-style.ts` + `app/api/settings/design-deconstruct/route.ts` — DesignPreset round-trip has colors+`typography.scale`. Zod: `lib/studio/carousel-json-contract.ts` secondary_copy / fontFit if needed (**after** step 2). Smoke → **ONE** 6-slide under `docs/карусель тест/design-inject-logo-br-smoke-6/`. **Не** rewrite Create chrome; **не** AppShell; **не** prompt prose owned by step 2 (thin wire OK) | [x] | Tokens+chrome+num+fontFit+variety+deconstruct persist+smoke GREEN; `backend-report.md` |
| 4 | **Frontend** | **SKIP by default.** Arm only if §9: Settings Design upload/deconstruct CTA or Embla activeId or Brand logo persist broken | [ ] skip | Skip unless §9 armed |
| 5 | **Tester** | Guards → `memory/waves/2026-10-18-design-inject-logo-br/guards.md`: G1–G10 from architect-spec §8 (FULL payload, positive scale, motifs optional, secondary_copy, logo BR chrome, slide-num, fontFit, deconstruct→payload, variety, smoke 6). Prefer unit/fixture + grep; script e.g. `scripts/verify-design-inject-logo-br-guards.ts` | [x] | Guards green 38/38; Fixer skip |
| 6 | **Fixer** | Only failing paths from Tester (same path locks as owning role) | [x] skip | Skip if Tester GREEN |
| 7 | **Deployer** | Localhost API refresh before smoke if needed | [ ] | Live localhost; `deployer-report.md` (Orchestrator arms) |
| 8 | **smoke** | Run **ONE** 6-slide layered carousel → **STOP** (no remake). Confirm `docs/карусель тест/design-inject-logo-br-smoke-6/` has 6 PNG; spot-check logo bottom-RIGHT + name beside + pretty `N / M` + anchor variety + richer secondary in source JSON | [x] | 6 slides; no second draw |
| 9 | **Client** (optional) | Playwright @1440 only if Orchestrator asks | [ ] | Armed only |
| 10 | **Orchestrator** | VPS checklist artifact (end of wave) | [ ] | Checklist file; **not** auto-prod |

## Deconstruct → FULL inject verify path (lock 7 · named for Backend/AI Bridge)

```text
Settings Design UI: upload liked slide/reel/image
  → POST /api/settings/design-deconstruct
       app/api/settings/design-deconstruct/route.ts
  → lib/studio/deconstruct-style.ts
  → lib/agents/deconstructStyle.ts   [AI Bridge owns prompt/parser quality]
  → DesignPresetFile MUST include:
       colors.* · typography.display/body/mono · typography.scale.*
  → persist DesignSlot / Embla activeId   [Backend]
  → lib/settings/design-library.ts
       resolve active → buildDesignTokensPayload FULL role table
  → lib/studio/create-carousel-prompts.ts
       formatActiveDesignMdForPrompt / Designer system inject every draw
```

**AI Bridge check:** deconstruct output not colors-only; sizes present.  
**Backend check:** persisted preset → payload role colors+sizes non-null.  
**Tester:** G8.  
**Frontend:** only if upload/activeId broken (§9).

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **AI Bridge → Backend → Tester → smoke** sequential (user chain). Do **not** parallel AI Bridge + Backend on shared prompt/zod files.  
3. **One writer** on `create-carousel-prompts.ts` + `art-director-review.ts` + `deconstructStyle.ts` (AI Bridge step 2).  
4. **One writer** on `design-library.ts` + `carousel-layered-composite.ts` + deconstruct route/persist + smoke folder (Backend step 3).  
5. `carousel-json-contract.ts` zod edits only in Backend step **after** AI Bridge prompt lock.  
6. **Frontend omit** unless escalation §9.  
7. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
8. **NO AUTO-REMAKE:** AD must not wire Designer redraw; smoke must not loop.  
9. **Budget:** ONE Client-score carousel × **6** finals.  
10. **S57 KEEP:** layered HTML product; OCR remake vision stays OFF.  
11. **Secrets:** never commit `.env` keys.

## Tickets → steps

| Ticket | Steps |
|--------|-------|
| **C-full-design-inject** | 2 → 3 |
| **C-motifs-optional-sw** | 2 |
| **C-logo-chrome-br** | 3 (+ brandChrome default wording in 2) |
| **C-slide-num-body** | 3 |
| **C-secondary-copy-rich** | 2 → 3 (zod if needed) |
| **C-font-fit-reduce** | 2 → 3 |
| **C-deconstruct-verify** | 2 → 3 → 5 |
| **C-layout-variety** | 2 → 3 |
| **C-smoke-design-inject-6** | 3 → 5 → 8 |

## Out of chain

Motion · WebGL · Razbor redesign · Scout/Apify · social Meta publish · Create chrome redesign · mesh geometry rewrite · monoCoder replacing AI Bridge+Backend · VPS apply (checklist only) · Frontend (unless §9).

## Next executor

**Tester DONE** — G1–G10 **GREEN** (`guards.md` + `scripts/verify-design-inject-logo-br-guards.ts` 38/38). Fixer skip. Deployer **not armed** (no deploy). Orchestrator may arm Client (optional) or VPS checklist.
