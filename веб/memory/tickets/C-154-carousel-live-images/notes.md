# C-154 notes (Backend)

## Delivered

- `lib/llm/aggregator-images.ts` — `generateAggregatorImage`; uses `resolveAggregatorEnv`; never logs key
- `GET /api/aggregator/models` — proxy + kind classify; empty when no key
- `POST /api/studio/carousel-engine/generate-slides` — 2–6 slides, concurrency 2, picsum soft-fail
- Razbor Designer calls generate-slides then `upsertDraft`
- Mesh model tab fetches aggregator models (static fallback); carousel Designer seed = `google/gemini-2.5-flash-image`
- `.env.example` documents `CAROUSEL_IMAGE_MODEL`

## Verify

```bash
npx tsx scripts/smoke-c154-carousel-images.ts
# expect SMOKE_C154_OK (live if key works, else mock)

# optional API (dev server running):
curl -s http://localhost:3000/api/aggregator/models | head -c 200
curl -s -X POST http://localhost:3000/api/studio/carousel-engine/generate-slides \
  -H "content-type: application/json" \
  -d "{\"competitorId\":\"smoke\",\"title\":\"Guest night\",\"slideCount\":2}"
```

UI: Studio → carousel-engine → Razbor → Designer → «Наши» slides should show live URLs when key present.
