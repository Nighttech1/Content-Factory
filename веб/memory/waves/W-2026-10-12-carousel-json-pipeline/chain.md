# Chain — W-2026-10-12-carousel-json-pipeline (единый для пачки)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` на `CreateCarouselModal` / `agent-chat` / `generate-carousel-slides-core`.  
> Тикеты: **C-carousel-preview-black (P0) → C-carousel-json-scriptwriter → C-carousel-html-designer**.  
> Frontend: **P0 preview wire first**, затем JSON/HTML binding на том же modal.

**One-liner:** Architect (done) → AI Bridge (Dramaturgy+Layout prompts) → Backend (zod + dynamic slideCount + HTML PNG + optional proxy) → Frontend (**P0** then json/html) → Tester → Fixer → Deployer → Client **S41+S42**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | `memory/waves/W-2026-10-12-carousel-json-pipeline.md`; `memory/tickets/C-carousel-preview-black|json-scriptwriter|html-designer/architect-spec.md`; этот `chain.md` | [x] | Только memory; **no** `app/` / `components/` prod-code |
| 1 | AI Bridge | `lib/studio/create-carousel-prompts.ts`; `lib/mesh/agent-defaults.ts` (carousel-engine Scriptwriter/Designer system copy); **NEW** `lib/studio/carousel-json-contract.ts` (zod + parse/assert); `lib/studio/agent-start-bundle.ts` JSON hints; workers skills align (no secrets) | [x] | Skills: `ai-bridge`, `prompt-engineering`, `carousel-json-contract`, `carousel-studio-handoff`. Lock: ask user for N if missing; fenced JSON + machine artifact; text-only «готово» ≠ draw success; C-155 user turns = raw only. Backend: import `parseAndAssertCarouselJson` / `parseCarouselJsonFromText` + `assertSlideCountMatches` on handoff/draw |
| 2 | Backend | **NEW** zod module e.g. `lib/studio/carousel-json-schema.ts` (`requested_slide_count`, `slides[]` fields below); `lib/studio/generate-carousel-slides-core.ts` — `slideCount` from `slides.length` / input N (**remove invent-default 4 as product truth**); `app/api/studio/agent-chat/route.ts` — draw: **no** `slideCount: 4`; pass JSON slides; `app/api/studio/carousel-engine/generate-slides/route.ts`; **NEW** HTML renderer e.g. `lib/studio/carousel-html-renderer.ts` (+ templates); PNG export via playwright/puppeteer spawned with **Windows `cmd.exe /c`**; **optional** image proxy route e.g. `app/api/studio/media-proxy/route.ts` (hotlink/CORS); mesh read `agent-defaults` | [x] | Skills: `backend`, `carousel-json-contract`. Do **not** edit `RazborModal.tsx`. Razbor generate path may keep own clamps if separate — Create path must use JSON length. Done: uses AI Bridge `carousel-json-contract`; `runCreateCarouselDraw`; media-proxy + `toPreviewUrl`; PNGs → `public/generated/carousel/<id>/` |
| 3 | Frontend | **Sequential on one modal** (не parallel writers): | [x] | Skills: `carousel-json-contract`, `carousel-studio-handoff`, `content-factory-ui`. NEW `CreateCarouselPreview.tsx`; modal wire + JSON + load gate |
| 3a | Frontend — **C-carousel-preview-black (P0)** | `components/studio/workspace/CreateCarouselModal.tsx` preview pane; img/`onLoad`/`onError`; aspect **4/5**; fail UI (не silent black); «Готово» / ready state only when frames loadable; wire proxy URLs if Backend provides | [x] | **FIRST** FE step. Tester guard: non-black frames. `CreateCarouselPreview` + `previewLoadOk` gates «Передать на публикацию» |
| 3b | Frontend — **C-carousel-json-scriptwriter** | Same modal + chat: parse/display fenced JSON; handoff carries validated artifact; UI ask-for-N if missing; markdown+JSON | [x] | `carouselJson` state; parseAndAssert on scriptwriter replies; handoffBrief = JSON.stringify; N= chip |
| 3c | Frontend — **C-carousel-html-designer** | Same modal: bind draw to JSON `slides[]`; preview shows exported PNGs count = N; describe→draw uses layout engine output | [x] | draw MUST pass `carouselJson` to postStudioAgentChat; missing → chatError ask scriptwriter JSON |
| 4 | Тестировщик | `memory/tickets/C-carousel-preview-black/guards.md`; `…/C-carousel-json-scriptwriter/guards.md`; `…/C-carousel-html-designer/guards.md`; smokes: zod reject bad N; draw length = slides.length; preview load; no hardcode 4 in Create draw | [x] | Static PASS all 3; S42 live → Client. Fixer: cached img.complete sync in CreateCarouselPreview |
| 5 | Фиксер | Только red paths from Tester | [x] | Fix update-depth: bail loaded/error + queueMicrotask in CreateCarouselPreview; prior cached-img sync kept |

| 6 | Деплоер | localhost `/studio/carousel-engine` (+ API) | [x] | HTTP 200 localhost |
| 7 | Клиент | Playwright MCP @1440 — **S41** regression + **S42** HARD | [x] | ПРИНЯТО С ЗАМЕЧАНИЯМИ — `memory/waves/W-2026-10-12-carousel-json-pipeline-client.md`; Fixer closed update-depth |

## Zod field lock (Backend + AI Bridge)

```ts
// Canonical Create handoff artifact (names locked this wave)
{
  contentType: "carousel",
  requested_slide_count: number, // === user N === slides.length
  idea?: string,
  hook?: string,
  tone?: "vernatun",
  slides: Array<{
    index: number,
    layout_variant: string,      // e.g. cover | point | proof | cta | …
    primary_copy: string,        // cover ≤6–8 words sense
    secondary_copy: string,      // may be ""
    swipe_trigger: string,       // required every slide
    visual_prompt: string,       // bg only; text via HTML
    alt_text: string,
  }>,
  caption: string,
  hashtags: string[],
  promptForDesigner?: string,
}
```

Map from skill synonyms: `headline`→`primary_copy`, `body`→`secondary_copy`, `role`→`layout_variant`.

## Ticket pointer chains

Каждый тикет ссылается на **этот** файл как канон:

- `memory/tickets/C-carousel-preview-black/chain.md` → pointer
- `memory/tickets/C-carousel-json-scriptwriter/chain.md` → pointer
- `memory/tickets/C-carousel-html-designer/chain.md` → pointer

## Overlap ban

| Surface | Rule |
|---------|------|
| `CreateCarouselModal.tsx` | Один Frontend writer; **P0 → json → html** |
| `app/api/studio/agent-chat/route.ts` | AI Bridge prompts + Backend draw; не parallel FE rewrite |
| `lib/studio/generate-carousel-slides-core.ts` | Backend only for slideCount/export; FE consumes URLs |
| `RazborModal.tsx` / Razbor publisher | **Out of scope** — не трогать |
| C-131 crossfade | Keep; do not regress; different bug from permanent black |

## Acceptance gate (Client)

Закрытие волны только после **S41 + S42** + guards на все три тикета.
