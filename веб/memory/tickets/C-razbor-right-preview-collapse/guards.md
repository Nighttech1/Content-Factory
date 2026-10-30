# Guards — C-razbor-right-preview-collapse (P0)

Wave: `2026-10-16-design-razbor-quality` · Scenario: **S52.B** (RIGHT draft preview visible)

## Class of defect

Opening a Черновики draft in Razbor shows `1/N` + L/R chrome but the slide frame collapses to ~0×0 / ~2×3 px (absolute `img` has natural 1080×1350 but no layout box) → black void.

Root cause: shrink-wrapped flex column (no `w-full`) + flex-row child with `w-full` + `aspect-ratio` + absolutely positioned image → circular width → collapse.

## Permanent checks

### G1 — Right column width chain (static)

- `RazborModal.tsx` section `[data-testid="razbor-competitor-carousel"]` includes **`w-full min-w-0`**.
- Inner preview wrapper around `RazborSlidesCarousel` includes **`w-full min-w-0`**.

```bash
rg -n "razbor-competitor-carousel|w-full min-w-0" components/studio/workspace/RazborModal.tsx
```

Expect: both the section and the centering wrapper carry `w-full min-w-0`.

### G2 — Slide frame cannot collapse (static)

- `RazborSlidesCarousel.tsx` uses **grid** `grid-cols-[2.25rem_minmax(0,1fr)_2.25rem]` (not flex-row + `w-full` competing with chevrons).
- Frame has **`aspect-[4/5]`** + **`min-h-[12rem]`** (definite box).
- Marker: `data-preview-layout="c-razbor-right-preview-collapse"`.

```bash
rg -n "aspect-\[4/5\]|min-h-\[12rem\]|minmax\(0,1fr\)|c-razbor-right-preview-collapse" components/studio/workspace/RazborSlidesCarousel.tsx
```

### G3 — Live measure after draft open (Playwright @1440)

1. `http://localhost:3001/studio/carousel-engine` @1440.
2. Ours → **Черновики** → open **S52 A** (or any draft with slides).
3. Evaluate:

```js
const el = document.querySelector('[data-testid="razbor-slide-crossfade"]');
({ w: el.clientWidth, h: el.clientHeight });
```

**PASS:** `clientWidth >= 120` AND `clientHeight >= 150` (non-zero; typically ~390×488 @1440).  
**FAIL:** `w < 20` or `h < 20` (collapsed box).

### G4 — Env image model (local only, not git)

- Local `.env` line: `CAROUSEL_IMAGE_MODEL=openai/gpt-5.4-image-2` (or unset → `DEFAULT_CAROUSEL_IMAGE_MODEL`).
- **Do not** commit `.env` / secrets.

```bash
# local only — never paste secrets
Select-String -Path .env -Pattern '^CAROUSEL_IMAGE_MODEL='
```

## Evidence (Fixer 2026-10-16)

| Check | Result |
|-------|--------|
| Open `draft-s52-etalon-a` → RIGHT | frame **390×488**, img client **390×488**, natural 1080×1350 |
| Screenshot | `memory/tickets/C-razbor-right-preview-collapse/verify-ours-preview.png` |
| Before | ~0×0 / ~2×3 black void (`client-s52b-ours-preview.png`) |

## Rerun

```bash
# static
rg -n "c-razbor-right-preview-collapse|aspect-\[4/5\]|min-h-\[12rem\]" components/studio/workspace/RazborSlidesCarousel.tsx
rg -n "w-full min-w-0" components/studio/workspace/RazborModal.tsx

# live: Playwright Черновики → S52 A → measure razbor-slide-crossfade
```

## Verdict

**PASS** — layout fix + live measure non-zero + screenshot proof. Env model pointed at catalog default (local `.env` only).
