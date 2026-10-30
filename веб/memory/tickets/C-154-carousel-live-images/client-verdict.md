# Клиент — C-154 live carousel

**Вердикт:** ПРИНЯТО  
**Playwright @1440**

| Check | Result |
|-------|--------|
| Polza key `/models` + chat | PASS (smoke) |
| `GET /api/aggregator/models` | 418 models, 21 image |
| `POST generate-slides` | live · `google/gemini-2.5-flash-image` · s3.polza.ai |
| Razbor competitor → Designer | PASS · live image in modal |
| Drafts tab | 1 draft «Razbor · Competitor: rooftop guest night invite» |

Default image model: `CAROUSEL_IMAGE_MODEL=google/gemini-2.5-flash-image`  
Evidence: `client-razbor-live.png`, `client-drafts.png`
