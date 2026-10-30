# C-design-tokens-only — Frontend implementation

**Wave:** `2026-10-16-design-razbor-quality` · S52.A  
**Role:** Frontend (+ shared prompt contract touch for Tester guards)

## Done

| Lock | Change |
|------|--------|
| **D-tok-1** | Removed `SlicedSlotPreview` from `DesignLibraryCarousel` + `QuickThemeTuner`. File kept (dead in Settings; Create may reuse later). No `data-testid="sliced-slot-preview"` under Settings Design. |
| **D-tok-2** | `BrandbookBoard` = colors · type · **text-block** · **small-element** (chips/labels/progress). Deleted `brandbook-buttons-card` Primary/Ghost/CTA kit. |
| **D-tok-3** | `dedupeDesignLibrarySlots` — by id + normalized name + Coffee Doctrine / HY twin aliases. Runs on Embla hydrate + `writeDesignLibrary`. |
| **D-tok-4** | Toolbar `justify-start` + `data-align="left"`; row = **референс** · **новый дизайн** · eye **«код дизайн мд»**. Root/header `xl:pr-[min(280px,…)]` clears right Settings nav. |
| **D-tok-5** | `formatActiveDesignMdForPrompt` + `buildDesignTokensPayload` → tokens JSON only (no COVER/BODY/CTA markup dump). `formatActivePresetCssVarsForPrompt` aligned. |
| **D-tok-6** | Cards remain **3:5** brandbook; neon active / no context popup kept. |
| **shell_freeze** | No AppShell / left sidebar edits. |

## Files changed

- `components/settings/DesignLibraryCarousel.tsx`
- `components/settings/BrandbookBoard.tsx`
- `components/settings/QuickThemeTuner.tsx`
- `components/settings/SettingsShell.tsx` (comments + tokens caption only)
- `lib/settings/design-library.ts` (`buildDesignTokensPayload`, `formatActiveDesignMdForPrompt`, `dedupeDesignLibrarySlots`)
- `lib/studio/create-carousel-prompts.ts` (tokens inject wording + payload)

## AI Bridge — coordinate note

Prompt wiring lives in `lib/` (shared). Frontend already updated:

- `lib/settings/design-library.ts` — `formatActiveDesignMdForPrompt` / `buildDesignTokensPayload`
- `lib/studio/create-carousel-prompts.ts` — `formatActivePresetCssVarsForPrompt` + Designer draw overlay Brandbook section

**AI Bridge follow-up (if needed):**

1. Re-scan `lib/studio/agent-start-bundle.ts` designer branch — confirm it only calls `appendActiveDesignMdToDesignerPrompt` / tokens helpers (no extra role-kit MD dump).
2. Soft-pass `CREATE_CAROUSEL_DESIGNER_*` overlays for any remaining «COLORS ONLY» / Settings sliced-kit language.
3. Do **not** reintroduce Coffee Doctrine mock strings into Settings chrome.

## How to verify

1. `/settings` → Дизайн @1440 — Embla shows 3:5 brandbook only (no COVER/BODY/CTA strip).
2. No Buttons kit tile; text-block + small-element tiles present.
3. Duplicate Coffee Doctrine cards collapse to one after refresh.
4. Toolbar sits left; does not sit under «НАВИГАЦИЯ».
5. Optional: log `formatActiveDesignMdForPrompt` — JSON has `colors`/`typography`/`textBlock`/`smallElement`; no role-kit tables.

## Out of scope

- Create/feed N×4:5 sliced product preview (kept elsewhere)
- AppShell / left nav
- Tester `guards.md` (next role)
