# Architect spec — C-carousel-html-designer (P1)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-12-carousel-json-pipeline`.  
> Canon: `.cursor/skills/carousel-json-contract/SKILL.md` § Canvas + Designer pipeline + `workers/designer-carousel/SKILL.md`.  
> Shared chain: `memory/waves/W-2026-10-12-carousel-json-pipeline/chain.md`.  
> Depends on: validated JSON from **C-carousel-json-scriptwriter**; preview gate from **C-carousel-preview-black**.

## Goal

Дизайнер Create = **Layout & Visual Engine**: parse handoff `slides[]` **любой длины**; HTML/Tailwind frame **1080×1350** с safe-zone; `visual_prompt` → background; text via HTML fonts; export `slide_01.png` … `slide_NN.png`; wire в Create preview.

## Canvas / safe-zone lock (open-carrusel inspired)

| Spec | Value |
|------|-------|
| Canvas | **1080 × 1350** (4:5) |
| Top safe | ≥ **120** px |
| Bottom safe | ≥ **160** px |
| Sides safe | ≥ **80** px each |

Text / logo / CTA **внутри** safe-zone. Background may full-bleed; readable copy must not.

## Dynamic length lock (HARD)

| Rule | Detail |
|------|--------|
| Loop | `for (slide of slides)` — **no** `for (i=0;i<4)`, default N=4/5 as truth |
| Draw `slideCount` | **`slides.length`** from validated JSON (= `requested_slide_count`) |
| Forbidden | Hardcoded `slideCount: 4` in Create draw (`agent-chat` evidence) |
| Clamp | May enforce sane min/max for safety, but **must not invent N** when JSON present; missing JSON → error / ask, not silent 4 |

## Designer pipeline (lock)

1. Parse handoff JSON → validate `slides.length === requested_slide_count` (zod).
2. For **each** slide: HTML/Tailwind frame 1080×1350 + safe padding.
3. `visual_prompt` → background image generation / fill.
4. `primary_copy` / `secondary_copy` via **HTML fonts** (club / DESIGN.md / brandbook — not Inter-by-default).
5. Export ordered: `slide_01.png` … `slide_NN.png` (zero-pad 2).
6. Wire URLs/paths into Create preview + `generatedMedia` (as applicable).
7. Bubble «готово» only with artifact URLs; FE P0 load gate applies.

## Windows spawn lock

Playwright / Puppeteer (or equivalent headless) for HTML→PNG on this Windows host:

- Spawn via **`cmd.exe /c`** (not assume POSIX `sh`).
- Paths Absolute-friendly under workspace.
- Do not block Next request thread forever — prefer short timeout + queue later if Architect/Backend notes need BullMQ; **MVP lock:** sync spawn OK if timeout bounded and Create `drawing` state shows progress; escalate to queue if Mid-flight proves too slow.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-html-1 slideCount** | Create draw path: `slideCount = carouselJson.slides.length`. Remove product hardcode `4` in `agent-chat` draw. |
| **D-html-2 Renderer module** | **NEW** `lib/studio/carousel-html-renderer.ts` (+ HTML templates under `lib/studio/carousel-frames/` or similar). |
| **D-html-3 Export naming** | `slide_01.png` … zero-pad 2; order = `slides[].index` ascending. |
| **D-html-4 Describe first** | Keep C-carousel-agents SM: describe → user edits → «Нарисовать» → render. |
| **D-html-5 Razbor** | **Do not** change `RazborModal.tsx`. Shared core may accept optional `slideCount` from callers; Create must pass JSON length. |
| **D-html-6 layout_variant** | Maps to HTML layout presets (cover / point / proof / cta …); unknown variant → safe default layout **without** changing N. |

## In scope

| Path | Owner |
|------|--------|
| **NEW** `lib/studio/carousel-html-renderer.ts` (+ templates) | Backend |
| **NEW** zod `lib/studio/carousel-json-schema.ts` (shared with json ticket) | Backend |
| `lib/studio/generate-carousel-slides-core.ts` | Backend — integrate HTML path / length from slides |
| `app/api/studio/agent-chat/route.ts` | Backend — draw uses JSON slides length |
| `app/api/studio/carousel-engine/generate-slides/route.ts` | Backend |
| `lib/studio/create-carousel-prompts.ts` | AI Bridge — Designer Layout instructions + safe-zone |
| `lib/mesh/agent-defaults.ts` | AI Bridge — Designer system |
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend — bind draw to JSON; show N frames |
| Optional media write under `generatedMedia` / public serve | Backend (no wipe volumes) |

## Out of scope

- P0 preview load handlers (owned by **C-carousel-preview-black**; must remain green)
- Scriptwriter prompt Dramaturgy (owned by **C-carousel-json-scriptwriter**)
- RazborModal / picsum paths for non-Create
- Pattern copy to other Create modules

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Designer system: Layout & Visual + safe-zone | **AI Bridge** | Wave step 1 |
| zod + HTML renderer + PNG spawn + draw length | **Backend** | Wave step 2 |
| Wire draw + preview N frames | **Frontend** | Wave step **3c** after P0 |

## Contracts

```ts
type DrawFromJsonInput = {
  carouselJson: CarouselHandoffJson; // validated
  agreedDescription?: string;
  noMock: true; // Create
};

// Success
type DrawFromJsonResult = {
  ok: true;
  slides: Array<{
    id: string;
    index: number;
    imageUrl: string; // same-origin preferred
    alt_text: string;
  }>; // length === carouselJson.slides.length
};
```

Invariant: `result.slides.length === input.carouselJson.requested_slide_count`.

## Acceptance criteria (язык Клиента / S42)

1. User N=7 → после «Нарисовать» **7** кадров в preview (не 4).
2. Другой N (напр. 4) → ровно 4 — без хардкода прежней длины.
3. Кадры 4:5; copy visually inside safe-zone (Client spot-check @1440).
4. Export files named `slide_01.png`… when persisted.
5. «Готово» + visible frames (P0 gate).
6. Razbor Create-adjacent flows untouched (smoke: Razbor opens).

## Risks

- Headless Chromium missing on Windows — document install in Deployer notes; fail with `source: "error"`, no mock PNGs.
- `clampSlideCount` max 6 blocks N=7 — **must** raise/remove inventing clamp for Create JSON path.
- Heavy render in API route — timeout UX; escalate to BullMQ if needed (mid-flight).
- Data safety: never wipe `generatedMedia` volume.

## Mid-flight escalation

Если HTML→PNG toolchain blocked on host → стоп → Architect chooses fallback (server-side canvas / sharp text) **without** reintroducing fixed N or silent black → update this spec + chain → continue.
