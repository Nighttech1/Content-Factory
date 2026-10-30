# Backend report — 2026-10-18 Variant A `html_layout` + Art Director

**Role:** Backend · step 3  
**Spec:** `architect-spec.md` §5–7 · `chain.md` step 3  
**Status:** DONE (composite execute + Designer pack wire + AD API/job + smoke GREEN)

## Smoke result (2026-10-18)

| Item | Result |
|------|--------|
| Command | `npx tsx scripts/smoke-variant-a-ad.ts` |
| PNG | **4** → `docs/карусель тест/variant-a-ad-smoke/slide_0N.png` |
| AD | `verdict: approve`, remarks=0, **remakeEnqueued: false** |
| Artifacts | `art-director-review.md` + `.json` + `timeline.md` |
| Note | Prisma localhost unreachable → sprint8-store fallback (OK for smoke) |

## Paths touched

| Path | Change |
|------|--------|
| `lib/studio/carousel-layered-composite.ts` | Execute Variant A: template→CSS (`cover_center`…`quote_band`), accent `<span class="accent">`, text_block anchor/align, scrim, logo/character/cta placements; `synthesizeFallbackHtmlLayout` for legacy |
| `lib/studio/designer-variant-a-pack.ts` | **NEW** — after SW JSON, Designer LLM (or SW-provided layouts) → `parseAndAssertDesignerPack` → merge `image_prompt`+`html_layout` |
| `lib/studio/carousel-html-renderer.ts` | Layered draw calls Designer pack before bg gen; passes `html_layout` into composite; returns `handoffWithLayouts` |
| `lib/studio/art-director-run.ts` | **NEW** — vision/LLM AD once; `remakeEnqueued: false` always; markdown formatter |
| `app/api/studio/art-director/review/route.ts` | **NEW** — `POST { draftId \| slideUrls[] }` → verdict + persist `payload.artDirectorReview`; **no remake** |
| `workers/art-director/index.ts` | Worker re-export of runner |
| `lib/intake/correct-pipeline-job.ts` | After composite+draft → AD once → persist; store merged scenario; `CAROUSEL_SKIP_ART_DIRECTOR=1` opt-out |
| `lib/intake/types.ts` | `CorrectDraftPayloadFlags.artDirectorReview` |
| `scripts/smoke-variant-a-ad.ts` | **NEW** — ONE 4-slide useful#1 → `docs/карусель тест/variant-a-ad-smoke/` + AD md/json |

## Contracts

- Composite consumes `HtmlLayout` from AI Bridge zod (`htmlLayoutSchema`).
- Designer pack: `ensureDesignerVariantAPack` → `parseAndAssertDesignerPack`.
- AD: `runArtDirectorReview` + `ART_DIRECTOR_SYSTEM_PROMPT` (AI Bridge). **Never** enqueues Designer/draw/composite.

## Smoke canon path

`docs/карусель тест/variant-a-ad-smoke/`  
(+ mirror `generatedMedia/variant-a-ad-smoke/`)

```bash
npx tsx scripts/smoke-variant-a-ad.ts
```

## API

```http
POST /api/studio/art-director/review
{ "draftId": "draft_correct_…" }   // or { "slideUrls": ["…png"] }
→ { ok, verdict, remakeEnqueued: false, markdown }
```

FE reads `draft.payload.artDirectorReview` + agent logs `agentId=art-director`.

## Env (names only)

| Env | Role |
|-----|------|
| `AGGREGATOR_*` | Designer pack + AD chat/vision |
| `CAROUSEL_SKIP_ART_DIRECTOR=1` | Skip AD inside correct-pipeline (smoke uses explicit AD call) |
| `VARIANT_A_REQUIRE_DESIGNER_LLM=1` | Fail draw if Designer pack LLM/schema fails (no synth) |
| `ART_DIRECTOR_MODEL` | Optional vision/chat model override |

## How to verify

1. Layered draw HTML contains `data-template=` + optional `<span class="accent">`.
2. Draft scenario slides include `html_layout` after gen.
3. AD API / smoke write `art-director-review.md` — grep codebase: no AD→designer enqueue.
4. Smoke folder: 4 PNG + AD artifact; no second draw.

## NOT done (other roles)

- Mesh node «Арт-директор» / inspector Ревью → **Frontend**
- Guards unit → **Tester**
- Localhost refresh → **Deployer**

`⚙️ **BACKEND:** Variant A composite execute + Designer pack wire + AD API/job persist (no remake); smoke script ready.`
