# Guards — C-carousel-json-scriptwriter

Wave: `W-2026-10-12-carousel-json-pipeline` · Scenario: **S42** (JSON / N)

## G1 — Contract module + parseAndAssert

- File: `lib/studio/carousel-json-contract.ts`
- Exports: `parseAndAssertCarouselJson`, `assertSlideCountMatches`, `parseCarouselJsonFromText`, zod schemas.
- Invariant: `requested_slide_count === slides.length` or `COUNT_MISMATCH`.

**Static:**
```bash
Test-Path lib/studio/carousel-json-contract.ts
rg -n "export function parseAndAssertCarouselJson|COUNT_MISMATCH|requested_slide_count" lib/studio/carousel-json-contract.ts
```

**Smoke:**
```bash
npx tsx -e "import { parseAndAssertCarouselJson, CarouselJsonParseError } from './lib/studio/carousel-json-contract.ts'; /* good N=3; mismatch → COUNT_MISMATCH */"
```

## G2 — Create modal consumes contract

- `CreateCarouselModal.tsx` imports `parseAndAssertCarouselJson`.
- State `carouselJson`; handoff / draw carries validated artifact.
- Missing N / bad JSON → ask UI (chip / chatError), not silent invent.

**Static:**
```bash
rg -n "parseAndAssertCarouselJson|carouselJson|requested_slide_count|create-carousel-slide-count" components/studio/workspace/CreateCarouselModal.tsx
```

## G3 — Agent-chat / Backend validate on draw

- `app/api/studio/agent-chat/route.ts` uses `parseAndAssertCarouselJson` when resolving draw JSON.
- No Create draw success without validated JSON length.

**Static:**
```bash
rg -n "parseAndAssertCarouselJson|resolveDrawCarouselJson" app/api/studio/agent-chat/route.ts
```

## G4 — Prompts ask-N (no invent as product truth)

- `lib/studio/create-carousel-prompts.ts` + mesh Scriptwriter copy: ask for N if missing; fenced JSON + machine artifact.

**Static:**
```bash
rg -n "requested_slide_count|спроси|ask|JSON" lib/studio/create-carousel-prompts.ts
```

## Class of defect

Regression = handoff without zod assert, silent default N, or `requested_slide_count !== slides.length` accepted for Designer draw.

## Verdict (Tester static W-2026-10-12)

**PASS** — G1–G4 static green; contract smoke COUNT_MISMATCH reject OK.
