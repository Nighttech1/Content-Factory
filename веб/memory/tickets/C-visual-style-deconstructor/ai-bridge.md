# AI Bridge contract — C-visual-style-deconstructor

> For **Backend** step 2. Soft-fail never wipes library. No secrets in logs.

## Exports (consume these)

| Symbol | Path | Use |
|--------|------|-----|
| `DesignPresetFile`, `ColorTokens`, `TypographyTokens`, `ComponentPrimitiveConfig`, `CarouselStylePreset`, `seamlessConnector` | `types/design.ts` (re-export `lib/settings/design-preset.ts`) | Shared types |
| `DECONSTRUCT_STYLE_SYSTEM_PROMPT`, `DECONSTRUCT_STYLE_USER_INSTRUCTION` | `lib/agents/deconstructStyle.ts` | Vision system/user |
| `parseDeconstructStyleReply`, `toDeconstructStyleResponse`, `mockDeconstructStyleResponse`, `deconstructStyleFromModelText`, `listFactorySeedPresets` | `lib/agents/deconstructStyle.ts` | Parse / soft mock |
| `deconstructStyle({ imageDataUrl, nameHint })` | `lib/studio/deconstruct-style.ts` | Live aggregator vision |
| `createDarkNotesSeedPreset`, `createBentoGlassSeedPreset` | `lib/settings/design-preset.ts` | Golden seeds |
| Seed fixtures JSON/MD | `lib/settings/design-presets/` | `seed-dark-notes*`, `seed-bento-glass*` |
| `seedFactoryDesignPresets` | `lib/settings/design-library.ts` | Empty-library seed |
| Slot fields | `DesignLibrarySlot.presetFile` / `colors` / `cssVarOverrides` | Persist keys unchanged: `cf.settings.design.library.v1` + `activeId` |

## API shape (Backend POST)

```ts
// POST /api/settings/design-deconstruct (multipart image or JSON dataUrl)
type DeconstructStyleResponse = {
  presetFile: DesignPresetFile;
  markdown: string;
  html?: string;
  source: "live" | "mock";
};
```

- Soft-fail → `source: "mock"` + golden seed-shaped body + RU message; **200 OK preferred** so FE can still append.
- Never truncate / wipe library on error.
- Do not log image bytes or `AGGREGATOR_API_KEY`.

## Seed ids (stable)

- `seed-dark-notes` ← bzhak3 chalkboard / yellow marker refs  
- `seed-bento-glass` ← uchuftu glass / gold-amber refs  

Do not overwrite user-customized slots with same ids.

## Verify

1. Call `deconstructStyle` with missing key → mock dark_notes/bento, library intact.  
2. Empty library → `seedFactoryDesignPresets()` → 2 slots, activeId = dark_notes.  
3. Response includes `components.seamlessConnector` on seeds.
