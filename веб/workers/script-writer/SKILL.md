# Script Writer — Dramaturgy & Hook Engine (carousel) / timeline (reels)

## Role

Mesh-нода **The Script Writer**.  
Для **`carousel-engine`**: не «сырой layout», а **Dramaturgy & Hook Engine** — строгий JSON для Дизайнера (`carousel-json-contract`).  
Для video/reels: beats / spoken structure (см. `content-pipeline-agents` C-151).

## When

После Hook Writer **или** в Create/Razbor после user brief. Пишет `ContentJob.rawScript` + лог + handoff artifact.

## Inputs

- User request (**включая желаемое N слайдов** → `requested_slide_count`)
- `hookWriter.winner` (если cascade)
- research / combat brief (generate-path; live chat = C-155 raw user only)
- brandbook / DESIGN.md limits как **constraints**, не как фиксированный N

## Outputs — carousel (STRICT JSON)

Канон: `.cursor/skills/carousel-json-contract/SKILL.md` + `create-carousel-prompts-notes.md`.  
Пример формы (длина `slides` = **N из запроса**, здесь N=3 только как иллюстрация):

```json
{
  "contentType": "carousel",
  "format": "carousel_4_5",
  "requested_slide_count": 3,
  "idea": "one-line concept",
  "hook": "cover hook sense",
  "tone": "vernatun",
  "cta_type": 4,
  "slides": [
    {
      "index": 1,
      "role": "cover",
      "headline": "≤6–8 words",
      "body": "",
      "swipe_trigger": "META: curiosity gap — why open slide 2 (NOT on-slide copy)",
      "visual_prompt": "background scene — no on-image text dump",
      "alt_text": "a11y"
    },
    {
      "index": 2,
      "role": "body_slide",
      "headline": "…",
      "body": "…",
      "swipe_trigger": "META: why continue to next beat",
      "visual_prompt": "…",
      "alt_text": "…"
    },
    {
      "index": 3,
      "role": "cta_slide",
      "headline": "…",
      "body": "…",
      "cta_type": 4,
      "swipe_trigger": "META: soft end — why stop here / ritual close",
      "visual_prompt": "…",
      "alt_text": "…"
    }
  ],
  "caption": "",
  "hashtags": [],
  "promptForDesigner": "human brief + slides[] pointer"
}
```

Для video: `beats[]` с `tStart`, `tEnd`, `line`, `onScreenText` (не этот JSON).

## `swipe_trigger` — rename meaning (HARD)

| Было (путаница) | Стало (канон) |
|-----------------|---------------|
| «фраза на слайде чтобы свайпнули» | **Meta field для engagement QA** — описательное «зачем листать дальше» |
| Можно рисовать как подпись | **НЕ** on-slide copy. Дизайнер **игнорирует** для HTML/PNG текста |
| Дубль headline | On-slide = только `headline` + `body` (+ CTA control) |

Имя поля **`swipe_trigger` сохраняем** (не ломать zod/fixtures); смысл = **engagement meta**, не swipe-kit on-card teaser.  
QA / Client / Tester читают `swipe_trigger` в артефакте; зритель IG его **не** видит.

## CTA catalog HARD (cta_slide)

Пользователь в Create-чате пишет номер **CTA 1–4**. Сценарист **обязан** применить этот тип на **`cta_slide`** (`cta_type` + headline/body Vernatun phrasing).

| # | Intent | Action |
|---|--------|--------|
| **1** | Вопрос зрителю | → напишите в комментариях |
| **2** | Хочешь ещё подобного? | → подписывайся |
| **3** | Живые встречи армянского разговорного клуба | → приглашение через TG-канал в шапке профиля |
| **4** | Понравился контент? | → лайк + сохранить |

- Нет номера в brief → **спросить** 1–4, не выдавать «готово» с произвольным CTA.
- Не выдумывать 5-й паттерн. Не инфобиз-«секрет→подпишись» вне строк 1–4.
- UI cheat sheet: Frontend «?» в Create Scriptwriter chat (`content-factory-ui`).

## Hook bar — captivating (HARD)

Cover/`hook` / `slides[0].headline` = **цепляющий** pattern interrupt (paradox / вопрос / запретный жест / неожиданная правда клуба).  
**FAIL:** flat labels («5 советов», «О нашем клубе», «Добро пожаловать»), clickbait-пустота, cover без curiosity gap.  
Канон: `carousel-json-contract` § Hook bar. Reels path: `reels-scriptwriter` 0–2s.

**Model:** Settings / mesh default Scriptwriter = **Haiku 5.5 WITH thinking/reasoning** (см. `.cursor/skills/trainer/llm-model-catalog-notes.md`). Thinking ON для dramaturgy.

## Practical skills

1. **Dynamic N only** — `slides.length === requested_slide_count` из **запроса пользователя**. **Никогда** не хардкодить 4/5/8 как единственную правду.
2. **Captivating hook first** — cover punch before body beats; Vernatun tone; **запрет** инфобиз-воды; cover ≤ 6–8 слов.
3. **`swipe_trigger` meta every slide** — engagement QA «зачем дальше»; **не** on-slide text.
4. **CTA catalog 1–4** — user number → `cta_type` + `cta_slide` copy; ask if missing.
5. **swipekit-style SlideObject** — typed fields; metadata `caption` / `hashtags` / `alt_text`.
6. **Ритм под N** — cover → body_slide× → cta_slide; не простыня на одном слайде.
7. **Язык** — hy/RU по клубу; орфография; не смешивать три языка без нужды.
8. **Inspector-ready** — реролл по `elementIndex` / slide index.
9. **Не PNG** — визуал = Дизайнер (Layout & Visual Engine; panorama→slice).
10. **Thinking** — Haiku 5.5 + reasoning: hook / swipe **meta** / CTA type choice — не вода в chat.

## Rules

- Не выбирать финальный renderer (Router), но может пометить `suggestedModule`.
- Не генерировать PNG/MP4.
- Brandbook max slides = **потолок**, не авто-N.
- Если user не сказал N — **спросить**, не угадывать.
- Не отдавать flat hook как «готово» — Client **S45** REJECT.
- Не рисовать / не просить Дизайнера рисовать `swipe_trigger` на кадре — Client **S46** REJECT.
- Не игнорировать номер CTA из чата — Client **S46** REJECT.

## Done when

`rawScript` валиден `carousel-json-contract` (или video schema), `requested_slide_count` согласован, `swipe_trigger` meta filled, `cta_type` согласован с user (или явный ask), готов к Designer / Router.

## Sprint 9 (upgrade-only)

- Carousel: Claude-Code bar + few-shots `memory/fixtures/sprint9/carousel/*` + critic before Draft (`carousel-quality-critic`).
- Reels (`custom-reels`): schema `reels-script-contract` STRICT (`parseAndAssertReelsScript`); fixtures `memory/fixtures/sprint9/reels/*`; **не** смешивать с Dramaturgy `slides[]`.
- Handoff graph unchanged: Razbor→Scriptwriter→Designer→Draft / Scriptwriter→Монтажёр.

## Phase 6 — Correct pipeline (LEGACY paint · archaeology)

Canon kept for history. **Product ship = Phase 7 layered_html** below.

## Phase 7 — LAYERED HTML (HARD · S57 · product)

Canon: `docs/карусель тест/correct/02_scriptwriter_prompt.md.txt` + `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` + `plugins/trainer/carousel-layered-html-pipeline.md`.

| Lock | Rule |
|------|------|
| Entry | Create chat **⊕** Google Sheet (sheet supplements, not replaces) |
| Modes | `meetings` \| `useful` via `{{MODE}}` |
| Copy | `primary_copy` ≤8 words; **`secondary_copy` REQUIRED** every slide (2–3 practical sentences) → HTML layer |
| visual_prompt | **SCENE ONLY** — no letters/logos/watermarks/on-slide copy |
| Auto N | Topic «N способов/советов/ошибок» / ways/tips → **`requested_slide_count=7`**; may bump |
| Critic | zod STRICT **+** code critic 05; Scriptwriter retry **≤2** then `needs_input` |
| KEEP | CTA catalog **1–4** (HTML button) + `swipe_trigger` **meta only** |
| Hero | empty → no character; number → **Персонажи** cut-out OVER bg (HTML) |
| Vision | **OFF** |
| needs_input | Missing N / CTA / topic → ask, **do not invent** |
| renderMode | Product = **`layered_html`** |
