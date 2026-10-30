# STRICT thresholds — Sprint 9.7 (C-s9-07)

**Wave:** `W-2026-10-15-sprint9-carousel-reels`  
**Lock:** parse fail = fail job (`source: "error"`), never soft-mock success on Create carousel / custom-reels generate.

## Carousel (`carousel-json-contract`)

| Check | Gate | Fail code |
|-------|------|-----------|
| JSON extract + zod schema | `parseCarouselJsonFromText` | `NO_JSON` / `INVALID_JSON` / `SCHEMA` |
| `requested_slide_count === slides.length` | `assertSlideCountMatches` | `COUNT_MISMATCH` |
| Non-empty `visual_prompt` every slide | `assertCarouselVisualPrompts` (STRICT draw) | `SCHEMA` |
| `cta_type` 1–4 on root or cta slide | `assertCarouselCtaCatalog` (STRICT draw) | `SCHEMA` |
| Flat hook / purple-slop / empty swipe | `critiqueCarouselHandoff` (9.8) | `carousel_quality_reject` |

**Call sites:** `agent-chat` draw (`parseAndAssertCarouselJsonStrict` + critic); Scriptwriter Create reply when JSON present.

**Create no-mock:** `CREATE_CAROUSEL_NO_MOCK = true` stays.

## Reels (`reels-script-contract`)

| Check | Gate | Fail |
|-------|------|------|
| Soft parse (legacy) | `parseReelsScriptArtifact` | `ok: false` |
| STRICT assert | `parseAndAssertReelsScript` | throws `ReelsScriptParseError` |
| Carousel `slides[]` as reels | forbidden | `CAROUSEL_FORBIDDEN` |
| Hook 0–2s, ≥2 beats, CTA, promptForMontage | zod + soft hardFail list | `HOOK` / `BEATS` / `CTA` / `SCHEMA` |
| Soft intro / weak CTA | `critiqueReelsScript` | `reels_quality_reject` |

**Call sites:** `agent-chat` when `pipelineId === "custom-reels"` + scriptwriter + JSON-looking reply.

## Scorecard cross-link (9.10)

Architect thresholds in wave spec §7 — fill `scorecard-9.10.md` after C-s9-09 smoke. This doc = **fail semantics**, not pass rates.

## Soft-mock ban

| Path | Soft-mock allowed? |
|------|-------------------|
| Create carousel (any mode) | **No** |
| custom-reels Scriptwriter generate | **No** (missing key / empty / critic fail → error) |
| Razbor non-Create chat without key | Soft-ack may remain (existing Razbor soft path) — not Sprint 9 success claim |
