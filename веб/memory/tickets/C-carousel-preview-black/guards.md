# Guards — C-carousel-preview-black (P0)

Wave: `W-2026-10-12-carousel-json-pipeline` · Scenario: **S42** (preview non-black)

## G1 — Aspect 4/5 (ban 9:16 in Create preview)

- `CreateCarouselPreview.tsx` frame wrapper uses **`aspect-[4/5]`** only.
- `CreateCarouselModal.tsx` must **not** use `aspect-[9/16]` for Create preview.

**Static:**
```bash
rg -n "aspect-\[4/5\]" components/studio/workspace/CreateCarouselPreview.tsx
rg -n "aspect-\[9/16\]" components/studio/workspace/CreateCarouselPreview.tsx components/studio/workspace/CreateCarouselModal.tsx
```
Expect: 4/5 present; 9/16 **zero** matches in Create preview files.

## G2 — onLoad / onError + naturalWidth gate

- Every preview `<img>` / `motion.img` (visible + preload) has **`onLoad`** + **`onError`**.
- `markLoaded` rejects `naturalWidth <= 0` → error state (not silent black).
- Cached/complete images: `bindFrameImg` / `img.complete` sync so status is not stuck on loading.

**Static:**
```bash
rg -n "onLoad|onError|naturalWidth|bindFrameImg|complete" components/studio/workspace/CreateCarouselPreview.tsx
```

## G3 — Ready / publication only when loadable

- Modal state `previewLoadOk` from `CreateCarouselPreview` `onAllLoaded`.
- «Передать на публикацию» / ready gate disabled unless `previewLoadOk`.
- Error UI: `create-carousel-preview-error` + retry `create-carousel-preview-retry` (not empty black pane).

**Static:**
```bash
rg -n "previewLoadOk|create-carousel-preview-error|create-carousel-preview-retry|create-carousel-preview" components/studio/workspace/CreateCarouselModal.tsx components/studio/workspace/CreateCarouselPreview.tsx
```

## G4 — Media proxy for hotlink (optional but present)

- Route `app/api/studio/media-proxy/route.ts` exists (SSRF allowlist).
- `lib/studio/carousel-media-urls.ts` → `toPreviewUrl` / `STUDIO_MEDIA_PROXY_PATH`.

**Static:**
```bash
Test-Path app/api/studio/media-proxy/route.ts
rg -n "toPreviewUrl|STUDIO_MEDIA_PROXY_PATH" lib/studio/carousel-media-urls.ts
```

## G5 — Silent-black risk scan (Create)

```bash
rg -n "picsum|bg-black(?!.*chrome)|opacity-0.*img|aspect-\[9/16\]" components/studio/workspace/CreateCarouselPreview.tsx components/studio/workspace/CreateCarouselModal.tsx
```
Expect: no picsum product path; dark chrome OK; no 9/16; fail/empty states have testids + copy.

**Live S42:** after «Нарисовать» @1440 — frames show pixels (not permanent black); broken URL → error chip + retry.

## Class of defect

Regression = permanent black preview after successful draw, missing onLoad/onError, aspect 9:16 in Create preview, or publication enabled without loadable frames.

## Verdict (Tester static W-2026-10-12)

**PASS** — G1–G5 static green. Fixer: cached-`complete` sync on preview imgs.
