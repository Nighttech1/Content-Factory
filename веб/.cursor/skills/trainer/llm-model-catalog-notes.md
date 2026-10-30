# LLM / Mesh model catalog — Trainer notes

Trainer **does not** edit `lib/` / `types/`. AI Bridge + Backend apply these locks in wave chain.

**Supersedes S45 Haiku-default for Scriptwriter** — wave **2026-10-16 carousel audit fix** (PROMPT_AUDIT + Gemini): quality bar = Sonnet for text; image-2 only for pixels.

## Defaults (product intent 2026-10-16)

| Agent / mode | Default model id | Notes |
|--------------|------------------|-------|
| **Designer DRAW / image API** | `openai/gpt-5.4-image-2` | **Only** pixel/background (or optional illustration). Confirm runtime ≠ `gpt-4o-mini`. Env `CAROUSEL_IMAGE_MODEL` may override — must stay image-class |
| **Designer DESCRIBE / chat / handoff text** | **Sonnet** (e.g. `anthropic/claude-sonnet-4` / catalog `claude-sonnet`) | **HARD:** never pass mesh image-model id into aggregator **chat** (that falls back to `gpt-4o-mini` = FAIL). Separate `textModel` / resolve path |
| **Scriptwriter** (carousel Dramaturgy) | **Sonnet** + thinking/reasoning ON if API supports | **Upgrade Haiku → Sonnet** (audit P7). Exact Polza slug — Architect locks |
| **Razbor / Marketing Director** | Haiku 5.5 + thinking OK until separate ticket | Not this wave’s primary fix |

## Model routing HARD (audit P6)

| Call | Must use | Forbidden |
|------|----------|-----------|
| Image generate (draw bg / optional illustration) | `openai/gpt-5.4-image-2` via **image** API | Chat completion with image id; silent mini |
| Describe / plan / ack JSON | **Sonnet text** chat | Image model id as `model` on chat → aggregator mini |
| Scriptwriter JSON | **Sonnet** chat | Stay on Haiku as product default after this wave |

`classifyAggregatorModelKind` / `isMeshImageModel` must treat `gpt-5.4-image-2` as **image**. Chat routes must pick a **text** model when kind=image on the mesh Designer row.

## Files to update in chain (not Trainer)

| File | Change |
|------|--------|
| `lib/settings/llm-models.ts` | Designer image default = `openai/gpt-5.4-image-2`; Scriptwriter default → Sonnet id; labels RU OK |
| `types/mesh-agent.ts` | `DEFAULT_CAROUSEL_IMAGE_MODEL` → image-2; Scriptwriter mesh default → Sonnet |
| `lib/mesh/agent-defaults.ts` | copywriter modelConfig → Sonnet; designer keeps image id **for draw** + explicit text model for describe |
| `app/api/studio/agent-chat/route.ts` | If mesh model is image-class → **do not** use as chat model; route describe to Sonnet; never fall through to `DEFAULT_AGGREGATOR_MODEL` (`gpt-4o-mini`) for Designer describe |
| `lib/studio/carousel-html-renderer.ts` | Draw image calls → image-2 only |

## Thinking / reasoning (Scriptwriter)

| Rule | Detail |
|------|--------|
| ON by default | Sonnet path — dramaturgy + captivating hook (same bar as former Haiku+thinking) |
| FAIL | Flat hooks; or describe chat served by mini via image-id fallback |

## Image vs text

| Kind | Examples |
|------|----------|
| Image | `openai/gpt-5.4-image-2`, `google/gemini-*-image`, `openai/gpt-5-image-mini` |
| Text | Sonnet (`claude-sonnet-4` / `anthropic/claude-sonnet-4`), Haiku, `gpt-4o-mini` (fallback only — **not** for Designer describe / Scriptwriter after this wave) |

## Related skills

- `prompt-engineering` § Carousel audit reconstruction
- `ai-bridge` § Model routing
- `carousel-json-contract` § Phase4 E2E diffusion (typography ON image; kill HTML-overlay-primary)
- `workers/designer-carousel` — render path
- Client validation budget: **2×3 = 6 PNGs** this wave (not 40)
