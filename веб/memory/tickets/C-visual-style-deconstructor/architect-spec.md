# Architect spec — C-visual-style-deconstructor (P0)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-13-visual-deconstructor`.  
> Shared chain: `memory/waves/W-2026-10-13-visual-deconstructor/chain.md`.  
> Canon: `create-design-md` § Deconstructor, `design-system` DesignPresetFile, `workers/designer-carousel`, `ai-bridge`, Client **S44.A/B**.  
> Extends **C-settings-design-md-carousel** (MD library → preset+MD).

## Goal

Upload liked carousel / ref image → vision **`deconstructStyle`** → typed **`DesignPresetFile` + `DESIGN.md`** → append Embla library (≤10) + **set `activeId`**. Seed golden presets **`dark_notes`** and **`bento_glass`** from user refs so Create/Designer have a quality bar without waiting for every user upload.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-vd-1 DesignPresetFile** | Exact TS/Zod names from `design-system` sketch: `id`, `preset` (`dark_notes` \| `bento_glass` \| `dark_editorial` \| `bold_poster`), `name`, `designMd`, `colors` (`bg/surface/text/muted/accent/accentSoft?`), `typography`, `components`, `cssVarOverrides?`, `referenceImageUrl?`, `version`. |
| **D-vd-2 Slot extend** | `DesignLibrarySlot` **keeps** existing fields; **adds** `presetFile?: DesignPresetFile` (preferred) and/or `presetId` mirror. Old MD-only slots remain valid (`presetFile` optional → migrate/seed later). |
| **D-vd-3 deconstructStyle** | AI Bridge function/tool: image bytes/URL → `{ presetFile: DesignPresetFile, markdown: string, html?: string, source: "live" \| "mock" }`. Map nearest preset + overrides; write DESIGN.md body per `create-design-md` Deconstructor mode. |
| **D-vd-4 API** | Backend `POST` (e.g. `/api/settings/design-deconstruct` or studio equivalent) accepts multipart/image; returns same shape; soft-fail with RU message — **never** wipe library. |
| **D-vd-5 Seeds** | On empty library (or explicit seed job): insert **`dark_notes`** + **`bento_glass`** golden `DesignPresetFile`+MD from product refs (chalkboard marker / glass+telemetry family). Do not overwrite user slots with same ids if already customized — use stable seed ids `seed-dark-notes`, `seed-bento-glass`. |
| **D-vd-6 Active resolve** | Designer / builder reads **`activeId` → slot.presetFile + slot.markdown`**. No silent orphan default when another slot is selected. |
| **D-vd-7 Panorama** | Ref panorama OK as **input only**. Product preview after deconstruct = **sliced 3×4:5** (owned by C-design-slot-sliced-preview). |
| **D-vd-8 Budget** | Wave **`png_budget_max: 40`**. Deconstruct itself should not burn PNG slides; Create draw counts against budget. |
| **D-vd-9 Razbor freeze** | **Do not** edit `RazborModal.tsx`. Settings CTA «Создать из референса» / existing «Добавить новый дизайн» = entry points. |
| **D-vd-10 Persist keys** | Keep `cf.settings.design.library.v1` + `cf.settings.design.activeId` — **no rename**. |

## In scope

| Path | Owner |
|------|--------|
| Shared types module (e.g. `lib/settings/design-preset.ts` or extend `design-library.ts`) | AI Bridge → Backend → FE consume |
| `deconstructStyle` + prompts | AI Bridge |
| Seed fixtures `dark_notes` / `bento_glass` | AI Bridge (+ FE seed on first load if needed) |
| POST deconstruct route | Backend |
| Settings upload wire to API | Frontend (step 3a) |
| create-carousel prompts: active preset + CSS vars + role kits + sliced-only | AI Bridge |

## Out of scope

- Rewriting RazborModal
- Prisma library table
- Reels scriptwriter (separate ticket)
- Builder HTML kits detail (C-carousel-css-vars-builder owns evolve)
- Prod/VPS

## Layers / owners

| Layer | Role | Wave step |
|-------|------|-----------|
| Types + deconstruct + seeds + prompts | **AI Bridge** | 1 |
| POST + active sync server-side | **Backend** | 2 |
| Upload CTA + persist append | **Frontend** | 3a |
| QA | Tester → Client **S44.A/B** | 4–7 |

## Contracts

```ts
type DesignPresetId =
  | "dark_notes"
  | "bento_glass"
  | "dark_editorial"
  | "bold_poster";

type ColorTokens = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft?: string;
};

type DesignPresetFile = {
  id: string;
  preset: DesignPresetId;
  name: string;
  designMd: string;
  colors: ColorTokens;
  typography: {
    display: string;
    body: string;
    mono?: string;
    armenianSafe?: string;
  };
  components: {
    card?: { glass?: boolean; blur?: string; border?: string; radius?: string };
    buttonCta?: { glow?: boolean };
    markerHighlight?: { color: string; ragged?: boolean };
    doodle?: { enabled: boolean };
    checkbox?: { style: "hand" | "ui" };
    gauge?: { glow?: boolean };
    logoMark?: string;
  };
  cssVarOverrides?: Partial<Record<string, string>>;
  referenceImageUrl?: string;
  version: number;
};

/** Extend existing DesignLibrarySlot — do not remove fields */
type DesignLibrarySlot = {
  id: string;
  name: string;
  markdown: string;
  html?: string;
  previewUrl?: string;
  createdAt: string;
  /** NEW — companion typed preset */
  presetFile?: DesignPresetFile;
};

type DeconstructStyleResponse = {
  presetFile: DesignPresetFile;
  markdown: string;
  html?: string;
  source: "live" | "mock";
};
```

### Seed quality bar (refs)

| Preset | Must encode |
|--------|-------------|
| `dark_notes` | Charcoal/chalkboard, yellow marker, doodle/checklist, seamless bridge arrows, Vernatun mark |
| `bento_glass` | Dark glass cards / bento, gold-amber accent, telemetry/gauge optional |

## Acceptance criteria (язык Клиента / S44)

1. Settings → «Создать из референса» / «Добавить новый дизайн» → upload → library append ≤10 + **current** set.
2. Active slot exposes **preset + DESIGN.md** (chip + resolve for Designer).
3. Seeds: empty library shows golden **dark_notes** + **bento_glass** (or after seed action).
4. Create draw with active golden preset uses preset (not silent brand-lock only) — assert via prompts/network or fixture.
5. No `RazborModal` regression; panorama not sole Settings preview (see sibling ticket).

## Risks

- Vision mock returns flat tokens → Create ≪ refs (mitigate: strong seeds + FAIL table in designer-carousel).
- Library >10 without block → corrupt UX (keep C-settings block-at-10 for MD; FIFO only where already decided for image CTA).
- Parallel writers on `design-library.ts`.

## Mid-flight escalation

If vision needs persistent blob storage / Prisma — стоп → Архитектор → Backend + `safe-db-migrations` (no DROP).
