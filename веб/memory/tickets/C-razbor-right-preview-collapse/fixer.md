# Fixer — C-razbor-right-preview-collapse

## What failed

Client S52.B: Черновики → S52 A → RIGHT `1/3` chrome on black void; `img` natural 1080×1350 but container ~0×0.

## Cause

1. Preview column / centering wrappers were flex shrink-wrap **without `w-full`**.
2. `RazborSlidesCarousel` used flex-row + middle `w-full` + `aspect-ratio` + absolute `img` → width circular dependency → collapse (~2×3 px).

## Fix

1. `RazborModal.tsx` — `w-full min-w-0` on right section + carousel wrapper.
2. `RazborSlidesCarousel.tsx` — grid `2.25rem | 1fr | 2.25rem`, frame `aspect-[4/5] min-h-[12rem]` (Create parity).
3. `.env` — `CAROUSEL_IMAGE_MODEL=openai/gpt-5.4-image-2` (local only; not committed).

## Verify

Playwright @1440: frame `clientWidth=390`, `clientHeight=488`. Screenshot in ticket folder.
