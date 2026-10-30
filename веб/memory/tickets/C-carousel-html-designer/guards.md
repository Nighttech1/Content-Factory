# Guards — C-carousel-html-designer

Wave: `W-2026-10-12-carousel-json-pipeline` · Scenario: **S42** (dynamic N + HTML)

## G1 — No hardcoded `slideCount: 4` on Create draw

- `app/api/studio/agent-chat/route.ts` Create `mode === "draw"`:
  - `slideCount = carouselJson.slides.length`
  - **Forbidden:** literal `slideCount: 4` as only Create draw path.

**Static:**
```bash
rg -n "slideCount:\s*4" app/api/studio/agent-chat/route.ts lib/studio/carousel-html-renderer.ts components/studio/workspace/CreateCarouselModal.tsx
rg -n "slides\.length|carouselJson" app/api/studio/agent-chat/route.ts
```
Expect: zero `slideCount: 4` in Create draw owners; length from JSON.

## G2 — HTML renderer + safe-zone 120 / 160 / 80

- File: `lib/studio/carousel-html-renderer.ts`
- `CAROUSEL_SAFE = { top: 120, bottom: 160, left: 80, right: 80 }`
- Canvas 1080×1350; loop `for (i < slides.length)` (not `i < 4`).
- Entry: `runCreateCarouselDraw`.

**Static:**
```bash
Test-Path lib/studio/carousel-html-renderer.ts
rg -n "CAROUSEL_SAFE|top:\s*120|bottom:\s*160|left:\s*80|runCreateCarouselDraw|slides\.length" lib/studio/carousel-html-renderer.ts
```

## G3 — FE draw binds carouselJson

- `CreateCarouselModal` draw POST includes `carouselJson`.
- Missing JSON → chatError ask scriptwriter (no silent draw of N=4).

**Static:**
```bash
rg -n "carouselJson|Нарисовать|postStudioAgentChat|mode:\s*[\"']draw" components/studio/workspace/CreateCarouselModal.tsx
```

## G4 — Razbor untouched (out of scope)

- No product edits required to `RazborModal.tsx` for this ticket.
- Shared `clampSlideCount` may keep Razbor fallback 4 **only** when Create JSON path is absent.

**Static:**
```bash
# Create path must pass slidesSpec / slideCount from JSON length
rg -n "slidesSpec|slideCount|noMock" app/api/studio/agent-chat/route.ts
```

## G5 — Preview count = N

- After draw, preview slide list length === JSON `slides.length` (gated by P0 load).

**Live S42:** draw with N≠4 → N frames in preview; Razbor still works independently.

## Class of defect

Regression = Create draw hardcodes 4, safe-zone constants removed, or draw without `carouselJson` inventing length.

## Verdict (Tester static W-2026-10-12)

**PASS** — G1–G4 static green. Note: legacy `clampSlideCount(..., 4)` remains for non-JSON / Razbor callers only — Create draw uses JSON length.
