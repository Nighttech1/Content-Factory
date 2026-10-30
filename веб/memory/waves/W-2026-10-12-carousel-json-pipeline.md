# Wave W-2026-10-12 Carousel JSON Pipeline

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-12-carousel-json-pipeline` |
| **Date** | 2026-10-12 |
| **Status** | open — Architect done |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **≤3** (вся пачка: P0 preview + JSON Scriptwriter + HTML Designer) |
| **Trainer grade** | B — `memory/trainer/2026-10-12-carousel-json-pipeline-grade.md` |
| **Skills** | `carousel-json-contract` (primary), `carousel-studio-handoff`, `content-pipeline-agents`, `ai-bridge`, `backend`, `content-factory-ui`, `client-scenarios` **S41+S42** |
| **Prior wave** | `W-2026-10-12-carousel-studio-handoff` (chrome/agents/publish) — **не откатывать**; эта волна поверх handoff |

## Intent

1. **P0:** после «Нарисовать» + bubble «готово» preview справа **не чёрный**; `onLoad`/`onError`, aspect **4/5**, proxy при hotlink; «Готово» только с loadable slides.
2. **JSON Scriptwriter→Designer:** zod Dramaturgy contract (`requested_slide_count`, `slides[]` с `layout_variant|primary_copy|secondary_copy|swipe_trigger|visual_prompt|alt_text`, `caption`, `hashtags`); **N только из user** (спросить если нет).
3. **HTML Designer:** parse `slides.length` любой; canvas **1080×1350** safe-zone Top≥120 Bottom≥160 Sides≥80; PNG export; Windows `cmd.exe /c` для playwright/puppeteer.

**Draw lock:** `slideCount = slides.length` — **запрет** hardcoded `4` в Create draw path.

**RazborModal** — **не ломать** (out of scope).

## Tickets in this wave

| ID | P | Covers | Folder | Result |
|----|---|--------|--------|--------|
| **C-carousel-preview-black** | **P0** | Preview wire after draw; never silent black | `memory/tickets/C-carousel-preview-black/` | pending |
| **C-carousel-json-scriptwriter** | P1 | Dramaturgy JSON + zod + dynamic N + Vernatun | `memory/tickets/C-carousel-json-scriptwriter/` | pending |
| **C-carousel-html-designer** | P1 | HTML safe-zone renderer + PNG + any-length draw | `memory/tickets/C-carousel-html-designer/` | pending |

## Path lock (NO overlapping parallel writers)

Один Create path — **sequential**:

1. **AI Bridge** — Scriptwriter/Designer prompts + JSON schema semantics  
2. **Backend** — zod validate; `generate-carousel-slides-core` / agent-chat draw: `slideCount = slides.length`; optional image proxy; HTML→PNG spawn  
3. **Frontend P0 first** — `C-carousel-preview-black` (preview wire) **до** JSON/HTML UI polish that depends on visible frames  
4. Frontend continues json/html binding on same modal (после P0)  
5. Tester → Fixer → Deployer → Client **S41+S42**

**Не параллелить:** `CreateCarouselModal.tsx` × `agent-chat/route.ts` × `generate-carousel-slides-core.ts`.

## Wave chain (roles)

```text
Тренер (done, B) → Архитектор (done)
  → AI Bridge → Backend → Frontend (P0 preview-black first)
  → Тестировщик → Фиксер → Деплоер → Клиент Playwright (S41+S42)
```

**Единый chain:** `memory/waves/W-2026-10-12-carousel-json-pipeline/chain.md`

## Spec index

| Ticket | Spec |
|--------|------|
| C-carousel-preview-black | `memory/tickets/C-carousel-preview-black/architect-spec.md` |
| C-carousel-json-scriptwriter | `memory/tickets/C-carousel-json-scriptwriter/architect-spec.md` |
| C-carousel-html-designer | `memory/tickets/C-carousel-html-designer/architect-spec.md` |

## Known root causes (Architect evidence — pre-code)

| Symptom | Evidence path | Lock fix |
|---------|---------------|----------|
| Always 4 slides on Create draw | `app/api/studio/agent-chat/route.ts` — `slideCount: 4` | Pass `slides.length` / JSON N |
| Default clamp → 4; max 6 | `lib/studio/generate-carousel-slides-core.ts` `clampSlideCount` | Align clamp to user N (reasonable bounds OK, **default must not invent N**) |
| Preview aspect 9:16 | `CreateCarouselModal.tsx` `aspect-[9/16]` | **4/5** (1080×1350) |
| Silent black | Missing `onLoad`/`onError`; hotlink CORS; empty src + black bg | Wire + proxy + fail visible |

**Не путать** с **C-131** black *flash between* slides.

## Supersedes (Create only)

| Prior | By |
|-------|-----|
| Wave3 handoff `{ text, colors }` as sole artifact | **C-carousel-json-scriptwriter** |
| Create draw hardcoded `slideCount: 4` | **C-carousel-html-designer** + Backend draw wire |
| Text-only «готово» = success | **C-carousel-preview-black** + AI Bridge artifact rule |
| Preview `aspect-[9/16]` in Create | **C-carousel-preview-black** → 4/5 |

## Stop report (заполняет Оркестратор)

**Закрыто (Client+guard):** —

**Осталось:** AI Bridge → Backend → Frontend (P0→json/html) → Tester → Fixer → Deployer → Client S41+S42

**Готов дальше отрабатывать очередь волны — после пачки ≤3 закрыть с guards.**
