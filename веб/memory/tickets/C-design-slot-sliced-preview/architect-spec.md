# Architect spec — C-design-slot-sliced-preview (P0)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-13-visual-deconstructor`.  
> Shared chain: `memory/waves/W-2026-10-13-visual-deconstructor/chain.md`.  
> Canon: `content-factory-ui` S44 Design block, `design-system` CSS vars, Client **S44.A**.  
> Depends on: **C-visual-style-deconstructor** types (`presetFile` on slot).  
> Keeps S43 Close HARD from **C-settings-design-md-carousel**.

## Goal

Settings → Дизайн Embla: каждый слот показывает **интерактивную тройку кадров 4:5** (cover / body / cta sample) — CSS mock OK. **Quick Theme Tuner** (swatches) пишет live **`--cf-design-*`** на эти кадры. **Запрещено** оставлять **одну панораму** как единственный preview слота.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-sp-1 Triple 4:5** | Each Embla slot preview = **3** frames aspect **4:5** labeled cover · body · cta (sample layouts). Interactive (hover/focus OK); not a single wide panorama image. |
| **D-sp-2 CSS mocks** | Default Settings preview = **CSS / HTML mocks** driven by `DesignPresetFile.colors` + overrides — **0 LLM / 0 PNG** preferred (budget). |
| **D-sp-3 Panorama ban** | Raw deconstruct reference / panorama may show as tiny source chip **optional**, never as the **only** slot preview. Hard REJECT if panorama-only. |
| **D-sp-4 Quick Theme Tuner** | Swatches for at least `accent` + `bg` (ideally text/surface). Writes `presetFile.cssVarOverrides` and applies CSS vars on the **sliced** mock frames **live** (no full re-deconstruct). Persist on slot in library. |
| **D-sp-5 CSS var names** | `--cf-design-bg`, `--cf-design-accent`, `--cf-design-text`, `--cf-design-surface`, `--cf-design-muted` (match design-system). |
| **D-sp-6 Chip + Close** | Keep chip **DESIGN.md** top-right; preview panel Close **outside** pointer capture (S43 parity). |
| **D-sp-7 Create-from-ref CTA** | Visible **«Создать из референса»** and/or «Добавить новый дизайн» → file input → deconstruct pipeline (C-visual-style-deconstructor). |
| **D-sp-8 Cap** | Library ≤10 unchanged; do not rename persist keys. |
| **D-sp-9 Razbor freeze** | No `RazborModal.tsx` edits. |

## In scope

| Path | Owner |
|------|--------|
| `components/settings/DesignLibraryCarousel.tsx` | Frontend |
| `components/settings/SettingsShell.tsx` | Frontend (light) |
| New: sliced mock + Tuner UI under `components/settings/` | Frontend + 21st |
| `lib/settings/design-library.ts` | Frontend — read/write overrides on `presetFile` |
| `DesignPreviewPanel.tsx` | Frontend — Close parity only if touched |

## Out of scope

- Implementing `deconstructStyle` vision (AI Bridge ticket)
- Evolving `carousel-html-renderer` kits (builder ticket) — FE may **consume** vars already
- Create modal full draw quality (Client S44.B; builder + seeds)
- Prod/VPS

## Layers / owners

| Layer | Role | Wave step |
|-------|------|-----------|
| Types/seeds available | AI Bridge / Backend | 1–2 (prerequisite) |
| Sliced Embla + Tuner + CTA chrome | **Frontend** | **3a** |
| QA | Tester → Client **S44.A** | 4–7 |

## Contracts

```ts
/** Tuner writes into DesignPresetFile.cssVarOverrides */
type CfDesignCssVars = {
  "--cf-design-bg"?: string;
  "--cf-design-accent"?: string;
  "--cf-design-text"?: string;
  "--cf-design-surface"?: string;
  "--cf-design-muted"?: string;
};

type SlicedSlotPreviewModel = {
  slotId: string;
  frames: [
    { role: "cover"; label: string },
    { role: "body_slide"; label: string },
    { role: "cta_slide"; label: string },
  ];
  cssVars: CfDesignCssVars;
};
```

### Live Tuner algorithm

1. User changes swatch → update `cssVarOverrides` on active `presetFile`.
2. Persist library slot.
3. Re-bind CSS vars on the three mock frames immediately.
4. Next Create draw / builder reads same overrides (no separate theme store).

## Acceptance criteria (язык Клиента / S44.A)

1. `/settings` → Дизайн → Embla slot shows **three** 4:5 frames (cover/body/cta) — snapshot.
2. Change accent in Tuner → **visible** change on sliced frames (before/after snapshot).
3. Not panorama-only.
4. Chip DESIGN.md + Close preview still work.
5. Create-from-ref path visible (smoke upload).

## Risks

- Embla slide too narrow for 3 frames → stack or mini-strip with clear 4:5; still not panorama.
- Tuner only edits MD prose → FAIL (must be CSS vars).
- FE edits `design-library` while Backend migrates shape — sequential after AI Bridge types.

## Mid-flight escalation

If 21st Embla cannot host triple frames — Architect notes fallback layout; still 3×4:5, still no panorama-only.
