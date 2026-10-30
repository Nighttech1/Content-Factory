# Architect spec — C-carousel-preview-black (P0)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-12-carousel-json-pipeline`.  
> Canon: `.cursor/skills/carousel-json-contract/SKILL.md` § P0 + `carousel-studio-handoff` § P0.  
> Shared chain: `memory/waves/W-2026-10-12-carousel-json-pipeline/chain.md`.  
> Priority: **P0 — first Frontend step** in wave.

## Goal

После «Нарисовать» и bubble «готово» превью справа в Create показывает **видимые** кадры карусели. **Никогда** silent black. «Готово» / state `ready` — только когда слайды **loadable**.

## Symptom (user)

Дизайнер пишет «готово», LLM/API уже отдал images → preview = чёрный / пустой.

**Не путать** с **C-131** (black *flash between* slides).

## Root-cause map (Architect evidence)

| Layer | Likely cause | Path |
|-------|--------------|------|
| Draw always N=4 | Hardcoded `slideCount: 4` | `app/api/studio/agent-chat/route.ts` |
| Invented default | `clampSlideCount` → default **4**, max 6 | `lib/studio/generate-carousel-slides-core.ts` |
| Wrong aspect | Preview `aspect-[9/16]` | `CreateCarouselModal.tsx` → lock **4/5** |
| Wire | Response `slides[]` → state → `<img src>` gap; black bg + empty/broken src | Create preview pane |
| Hotlink | External CDN / aggregator URL CORS or blocked | Optional **media-proxy** |
| Success semantics | Text bubble «готово» without verified loadable URLs | AI Bridge + FE gate |

## Decision locks

| Lock | Decision |
|------|----------|
| **D-prev-1 Aspect** | Preview frame wrapper **`aspect-[4/5]`** (1080×1350). Ban 9:16 as Create carousel preview truth. |
| **D-prev-2 onLoad / onError** | Each preview `<img>` (or equivalent) must handle **`onLoad`** + **`onError`**. Broken/zero-size → error chip / retry UI — **not** silent black pane. |
| **D-prev-3 Ready gate** | Designer «Готово» / segment ready / enable «Передать на публикацию» only when **all** current draw slides are loadable (`naturalWidth > 0` or verified proxy success). Text-only success = **FAIL**. |
| **D-prev-4 Proxy** | If hotlink fails (CORS/referrer): use Backend **optional** `app/api/studio/media-proxy` (or existing media serve under `generatedMedia`). Prefer same-origin URLs in preview. |
| **D-prev-5 data-testid** | Keep/extend `create-carousel-preview` + per-frame testids for Tester/S42 (non-black assert). |
| **D-prev-6 Background** | Black/dark glass OK as chrome; **content plane** must show real slide pixels after success. |

## In scope

| Path | Owner |
|------|--------|
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend (preview wire, aspect, load handlers) |
| Optional small preview subcomponent (new OK under `components/studio/workspace/`) | Frontend |
| `app/api/studio/media-proxy/route.ts` (NEW, optional) | Backend |
| Draw response shape already returning `slides[].imageUrl` | Backend consume / FE wire |
| Guards + S42 preview asserts | Tester / Client |

## Out of scope

- Full Dramaturgy JSON schema (→ **C-carousel-json-scriptwriter**)
- HTML safe-zone renderer / PNG export pipeline (→ **C-carousel-html-designer**) — P0 may still show existing generate URLs once wired
- `RazborModal.tsx` / Razbor preview
- C-131 crossfade redesign (must not regress)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Prompt: draw artifact must include image URLs/paths | **AI Bridge** | Wave step 1 |
| Proxy + ensure generate returns usable URLs; no Create hardcode 4 (shared with html ticket) | **Backend** | Wave step 2 |
| Preview wire + load gate + aspect 4/5 | **Frontend** | Wave step **3a P0 first** |

## Contracts

```ts
// Draw success response (Create) — minimum for P0
type CreateDrawSuccess = {
  source: "live";
  reply: string; // e.g. «Готово…»
  slides: Array<{ id: string; imageUrl: string; caption?: string }>;
};

// FE preview frame state
type PreviewFrameState =
  | { status: "loading"; src: string }
  | { status: "loaded"; src: string }
  | { status: "error"; src: string; message: string };
```

`ready` iff `slides.length >= 1` AND every frame `status === "loaded"`.

## Acceptance criteria (язык Клиента / S42)

1. «Нарисовать» → после успеха справа **видны** кадры (не сплошной чёрный / empty).
2. Битый URL → явная ошибка на кадре/панели, не чёрная тишина.
3. Aspect превью **4:5**.
4. «Передать на публикацию» недоступна, пока кадры не loadable (или явный error path).
5. Playwright S42 snapshot: non-black frames; count matches draw N when JSON wave live.

## Risks

- Proxy opens SSRF — allowlist hosts / only aggregator + `generatedMedia` paths.
- Race: bubble «готово» before images paint — gate UI on load, not only on API 200.
- Overlap with html-designer export timing — P0 accepts any valid same-origin/loadable URL first; HTML PNG can replace URLs later without breaking gate.

## Mid-flight escalation

Если generate returns data-URLs vs files vs CDN and FE cannot load without new API → стоп → Architect updates proxy contract in this spec + wave chain → continue.
