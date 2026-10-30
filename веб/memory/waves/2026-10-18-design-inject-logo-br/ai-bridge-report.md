# AI Bridge report — 2026-10-18-design-inject-logo-br

**Role:** AI Bridge · step 2  
**Date:** 2026-10-18  
**Spec:** `architect-spec.md` · locks 1–2, 5–8 (prompt half) + 7 (deconstruct agent)

```
🤖 **AI BRIDGE:** FULL DESIGN token card + rich SW + motifs optional + variety/fontFit/logo hints; critic ≥120 chars OR ≥3 clauses; deconstruct requires colors+fonts+sizes
```

## Done (paths)

| Path | Change |
|------|--------|
| `lib/studio/create-carousel-prompts.ts` | `formatFullDesignTokensInjectBlock` replaces negative TYPE SCALE; parse colors/fonts/scale; palette→bg mood; VISUAL_PROMPT motifs **optional** (no laundry list); SW secondary **2–3× richer**; Designer variety + fontFit reduce-only + slide-num own slot + brandChrome **bottom-right** hint; inject FULL card every Designer draw |
| `lib/studio/carousel-critic-05.ts` | Hard-fail thin body `secondary_copy` (`≥120` chars **OR** `≥3` clauses); retry hint + thin VP wording updated |
| `lib/studio/art-director-review.ts` | Checklist: FULL colors, logo BR + name-beside, layout variety, rich secondary |
| `lib/agents/deconstructStyle.ts` | Prompt HARD: colors + fonts + **scale sizes**; `ensureDeconstructFullTokens` soft-fills missing scale |
| `lib/mesh/agent-defaults.ts` | Short Scriptwriter/Designer deltas aligned |
| `create-carousel-prompts-notes.md` | Critic bar note |

## Locks covered (AI Bridge half)

| Lock | Status |
|------|--------|
| 1 `full_design_inject` | **Prompt DONE** — positive role table (family+size+hex); Backend still expands `buildDesignTokensPayload` shape if needed |
| 2 `motifs_optional` | **DONE** — laundry list removed; ≥3 elements kept |
| 3 `logo_chrome_br` | **Hint DONE** — brandChrome default `bottom-right` + name-right-of-icon wording; **CSS = Backend** (not touched) |
| 4 `slide_num_own_slot` | **Prompt DONE** — separate HTML block / body tokens / `N / M` |
| 5 `secondary_copy_rich` | **DONE** — overlay + critic bar |
| 6 `font_fit_reduce_only` | **Prompt DONE** — reduce-only + `fontFit` meta; composite clamp = Backend |
| 7 `deconstruct_verify` | **Agent DONE** — see §7 below; persist/payload = Backend |
| 8 `layout_variety` | **Prompt DONE** — adjacent anchors HARD; fallback rotate = Backend |

## §7 Deconstruct skim (`app/api/settings/design-deconstruct`)

**Path verified (code read):**

```text
POST /api/settings/design-deconstruct
  → lib/studio/deconstruct-style.ts (live vision)
  → lib/agents/deconstructStyle.ts (prompt + parse + ensureDeconstructFullTokens)
  → returns presetFile + markdown + html
```

| Field | Already extracted? | Note |
|-------|--------------------|------|
| **colors** (bg/surface/text/muted/accent) | **YES** | Required in `parseDesignPresetFile`; route returns `presetFile.colors` |
| **fonts** (display/body/mono) | **YES** | TypographyTokens in preset; prompt now HARD-requires |
| **sizes** (`typography.scale`) | **PARTIAL → hardened** | Parser accepted optional scale; golden seeds have scale; **this step** makes scale REQUIRED in prompt + `ensureDeconstructFullTokens` soft-fills if LLM omits |
| Embla active → `buildDesignTokensPayload` FULL role table | **Backend step 3** | Current payload has nested `colors` + `typography.scale` blobs; Architect wants explicit per-role table print — Backend owns `design-library.ts` |

**Verdict §7:** colors + fonts already in deconstruct→preset path; sizes were soft/optional — AI Bridge now forces + soft-fills. Backend must confirm persist → Embla → payload non-null scale+colors (Tester G8).

## Critic bar (measurable)

- Body slides: fail if `secondary_copy` length `< 120` **AND** clauses `< 3`
- Cover/CTA: warn if `< 60` chars; empty still hard-fail

## NOT done (out of AI Bridge / Backend owns)

- Composite CSS `.brand` bottom-right / enlarge / transparent / flex row
- `buildDesignTokensPayload` role-table shape expansion
- Zod schema edits on `carousel-json-contract.ts`
- Smoke ONE×6
- AppShell / BrandPanel CSS logo position

## Self-check

Scripted asserts: FULL heading + hex + 40px; no «do NOT assume 64px»; motifs optional; SW rich; variety/fontFit/logo/slide-num; overlay inject; critic thin/rich; AD checklist; deconstruct scale REQUIRED → **OK**.

## Next

**Backend** (chain step 3) — `design-library` FULL payload · composite logo BR · slide-num · fontFit clamp · variety validate · deconstruct persist · smoke 6.
