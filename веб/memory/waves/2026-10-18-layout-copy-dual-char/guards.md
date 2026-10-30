# Guards — Wave 2026-10-18 layout-copy + dual character

**Role:** Тестировщик · chain step 5  
**Date:** 2026-10-18  
**Spec:** `architect-spec.md` §8 (G1–G12)  
**Executable:** `npx tsx scripts/verify-layout-copy-dual-char-guards.ts` → **33/33 PASS**  
**Companion unit:** `npx tsx scripts/verify-layout-copy-composite-unit.ts` → **OK**  
**Deploy:** skipped (Orchestrator / user: **no deploy** this turn)

## Verdict: GREEN

| Guard | Result | Evidence |
|-------|--------|----------|
| G1 SW ≥220 / ≥5 | PASS | `SECONDARY_COPY_MUCH_WIDER_HARD` + critic `SECONDARY_COPY_MIN_CHARS_BODY=220` / `MIN_CLAUSES=5` |
| G2 critic/zod thin reject | PASS | `isThinSecondaryCopy` thin FAIL / wide PASS; `assertCarouselSecondaryCopyWide` throws |
| G3 layoutMap emit | PASS | Deconstruct prompt requires layoutMap+numberingGlobal; `parseLayoutMap` 4 slides; seed `hasValidLayoutMap` |
| G4 numbering omit | PASS | `shouldShowSlideNumber(absent)=false`; composite HTML no `.slide-num`; smoke A+B `slideNumFound=false` |
| G5 grammar mirror | PASS | RE orange map → logo `top-left` in composite HTML |
| G6 3 seeds + active 01 | PASS | ids 01/02/03 in sot; `design-active.json` = `seed-layout-re-orange-01` + layoutMap absent |
| G7 Landscapes 04 | PASS | Ануш #1 → `/characters/anush-sheet.jpg` (92881 bytes) |
| G8 dual paint enum | PASS | `in_image` \| `overlay_cutout` \| `none`; placement rules cover+last |
| G9 conductor wording | PASS | `CHARACTER_CONDUCTOR_DUAL_PAINT_HARD` (speaks / camera / not story actor) |
| G10 Smoke A ×6 | PASS | `…-smoke-A-in-image/` = 6 PNG; meta `in_image` · topic **17**; no HTML cutout; no `.slide-num` |
| G11 Smoke B ×6 | PASS | `…-smoke-B-overlay/` = 6 PNG; meta `overlay_cutout` · topic **13** ≠17; cutout slides **1+6** |
| G12 shell_freeze | PASS | chain lock AppShell; seed round-trip; no AppShell edit by Tester |

---

## Permanent asserts (class of defect)

### G1 / G2 — `secondary_copy_wide` (`C-sw-secondary-wide`)

1. Scriptwriter overlay HARD: body `secondary_copy` **≥220 chars AND ≥5 clauses** (or ≥4 short paragraphs).
2. Critic `isThinSecondaryCopy(body)` rejects below bar; zod `assertCarouselSecondaryCopyWide` throws on thin body.
3. Cover/CTA may be shorter multi-beat — not one-line stub.

**Paths:** `lib/studio/create-carousel-prompts.ts` · `lib/studio/carousel-critic-05.ts` · `lib/studio/carousel-json-contract.ts`

### G3 / G5 — `grid_layout_map` (`C-grid-layout-map`)

1. 4-ref deconstruct MUST emit `layoutMap` (4 slides + `numberingGlobal` + chrome).
2. When map present → gen mirrors anchors / logo / CTA chrome; invents content+bg+CTA only.
3. `hasValidLayoutMap` / `parseLayoutMap` round-trip.

**Paths:** `lib/agents/deconstructStyle.ts` · `lib/studio/deconstruct-style.ts` · `lib/settings/design-preset.ts`

### G4 — `numbering_mirror` (`C-numbering-mirror`)

1. `numberingGlobal: "absent"` → composite **omits** `.slide-num` entirely (supersedes always-pretty N/M).
2. Without layoutMap → keep prior pretty N/M default.

**Paths:** `lib/studio/carousel-layered-composite.ts` (`shouldShowSlideNumber`)

### G6 / G7 — seed (`C-seed-designs-landscapes`)

1. Presets **01 RE orange** · **02 luma coffee** · **03 omkopa teal** with layoutMap; **active = 01**.
2. Sheet 04 Vernatun girl → Landscapes **Ануш** #1 conductor sheet.

**Paths:** `lib/settings/design-presets/layout-copy-seeds.ts` · `scripts/seed-layout-copy-dual-char.ts` · `data/local/design-active.json` · `data/local/landscapes-catalog.json`

### G8 / G9 / G10 / G11 — dual smoke + conductor (`C-dual-char-smoke`)

1. Enum `character_path` / `characterPaint`: `in_image` \| `overlay_cutout` \| `none`.
2. Conductor: to-camera, speaks slide text, **not** story actor.
3. Smoke A: useful **17**, `in_image`, 6 PNG, no HTML cutout.
4. Smoke B: useful **13** ≠ A, `overlay_cutout`, 6 PNG, cutout on **cover + last**.
5. Both: design 01 active; numbering omit; S57 layered.

**Canon folders:**

- `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/`
- `docs/карусель тест/layout-copy-dual-char-smoke-B-overlay/`

**Paths:** `lib/studio/create-carousel-prompts.ts` · `lib/studio/carousel-layered-composite.ts` · `scripts/smoke-layout-copy-dual-char.ts`

### G12 — shell_freeze

1. No AppShell / left-nav IA redesign in this wave.
2. Frontend omit unless §9 (not armed).

---

## Tickets → guards

| Ticket | Guards |
|--------|--------|
| C-sw-secondary-wide | G1, G2 |
| C-grid-layout-map | G3, G5 |
| C-numbering-mirror | G4 (+ smoke A/B no `.slide-num`) |
| C-seed-designs-landscapes | G6, G7 |
| C-dual-char-smoke | G8–G11 |

Per-ticket stubs: `memory/tickets/C-sw-secondary-wide/guards.md` (etc.) → point here.

## Regression

See `.cursor/skills/client-review/regression-guards.md` · **W-2026-10-18-layout-copy-dual-char**

## How to re-verify

```bash
npx tsx scripts/verify-layout-copy-dual-char-guards.ts
npx tsx scripts/verify-layout-copy-composite-unit.ts
```

## Tester report

```
🧪 ТЕСТИРОВЩИК: G1–G12 GREEN · 33/33 · dual smoke A17/B13 ×6 PNG · numbering omit · conductor paths
Deploy: skipped
Next: Fixer SKIP if GREEN · Orchestrator (optional Client / VPS checklist)
```
