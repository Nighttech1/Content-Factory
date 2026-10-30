# Backend report — logo-placement-v2 (2026-10-18)

**Role:** Backend  
**Spec:** `architect-spec.md` · **Chain:** `chain.md`  
**Status:** DONE

## What shipped

### 1. Asset install (transparent)

- **Source:** Cursor assets Vernatun PNG (lock #1)
- **Dest:** `public/brand/vernatun-logo.png`
- **Process:** sharp raw loop — near-black (R/G/B ≤ 28) → alpha 0; logo colors kept
- **Result:** ~462 601 bytes · 1024×682 · corners alpha=0 · ~475k pixels stripped
- **`DEFAULT_LOGO_REF`:** unchanged `/brand/vernatun-logo.png` (`lib/settings/brand-store.ts`)

### 2. Composite SoT (`carousel-layered-composite.ts`)

| Constant / API | Before | After |
|----------------|--------|-------|
| `BRAND_LOGO_SIZE_PX` | 88 | **176** |
| `DEFAULT_BRAND_CHROME` | `bottom-right` | **`bottom-left`** (body SoT) |
| `defaultLogoPlacementForRole` | — | cover / last(cta) → `top-left`; body → `bottom-left` |
| `resolveLogoPlacement` | layout / global BR | layoutMap chrome **or** role SoT |
| `.brand img` CSS | fixed 88×88 | `max-width/max-height:176px; width/height:auto` |
| Logo-only | KEEP | KEEP (no `.brand-name` when `logoUrl`) |

### 3. Vision hardcopy + thin prompts

- `designer-variant-a-pack.ts` — hardcopy logo by role (not all top-left)
- `create-carousel-prompts.ts` — LOGO hint → role defaults + size 176
- `carousel-json-contract.ts` — zod default placement `bottom-left`; comments v2

### 4. Smoke

```text
npx tsx scripts/smoke-logo-placement-v2.ts
→ docs/карусель тест/logo-placement-v2-smoke/
```

| Slide | Role | Placement | PNG bytes |
|-------|------|-----------|-----------|
| 01 | cover | **top-left** | 1 364 428 |
| 02 | body | **bottom-left** | 1 171 863 |
| 03 | body | **bottom-left** | 1 184 538 |
| 04 | body | **bottom-left** | 1 224 865 |
| 05 | body | **bottom-left** | 1 344 013 |
| 06 | cta | **top-left** | 1 114 982 |

- Asserts: **0 FAIL** · `brandNameHits: 0` · alpha PASS · size 176 PASS  
- Source bgs: `vision-style-copy-smoke-A-in-image-6` (re-composite, no paid gen)

## Out of scope (honored)

- Phase 2 fonts / Phase 3 character  
- AppShell / VPS / DB wipe  

## Handoff

→ **Tester** guards (alpha · cover/cta TL · body BL · 176 · no `.brand-name`)  
→ **Deployer** localhost if needed  
→ **Client** Playwright HARD GATE → «согласовано»
