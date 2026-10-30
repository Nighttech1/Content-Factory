---
name: carousel-json-contract
description: >-
  Vernatun carousel Scriptwriter↔Designer strict JSON: Dramaturgy & Hook Engine →
  Layout & Visual Engine. swipe_trigger = meta engagement QA (not on-slide); CTA
  catalog 1–4 HARD; dynamic requested_slide_count. Use on C-carousel-json-* /
  C-scriptwriter-swipe-cta / S46 / preview-black.
---

# Carousel JSON Contract (Scriptwriter → Designer)

## When

Create / factory path `carousel-engine`: Сценарист handoff → Дизайнер parse → **LAYERED HTML (Phase 7 / S57)**: image model paints **scene/bg only** → HTML/CSS + Puppeteer overlay (type, logo, CTA, cut-out characters) → PNG 1080×1350 → preview.  
Пара: `carousel-studio-handoff`, `content-pipeline-agents`, `ai-bridge`, workers `script-writer` / `designer-carousel`, Client **S42** + **S44** + **S57** (layered HTML). Legacy S53/S54/S55 paint bars **superseded** for ship path.

**Не** писать app-код из этого skill — канон для Архитектора / AI Bridge / Frontend wire.

## Sprint 9 — upgrade-only / no-pipeline-break (HARD)

`DEV_PLAN` **9.2 / 9.4 / 9.5 / 9.7 / 9.8** — качество карусели до Claude-Code bar. Контракт **усиливаем**, flow **не переписываем**.

| Lock | Правило |
|------|---------|
| **UPGRADE ONLY** | Усилить Dramaturgy JSON, Hook bar, CTA 1–4, swipe_trigger meta, Designer brandbook/panorama→slice prompts **in place** |
| **NO PIPELINE BREAK** | Create/Razbor path остаётся **Razbor → Scriptwriter → Designer → Draft** (Create: Scriptwriter → Designer → Публикация-step → draft). **Запрет** вырезать Designer, auto-skip Scriptwriter, заменить handoff «одним LLM» |
| **Keys stable** | Не ломать JSON keys (`swipe_trigger`, `cta_type`, `requested_slide_count`, roles) без миграции + Backend zod |
| **STRICT (9.7)** | Parse fail = **fail job**, не тихий soft-mock / empty slides success |
| **Golden (9.2)** | 3–5 club fixtures (dark_notes / bento_glass / dark_editorial class) = QA bar — prompts target golden, не «почти ок» |
| **Out of scope** | UI shell redesign; social publish; other moduleId → Sprint 23; reels JSON → use `reels-scriptwriter` |

## UI preview canon (HARD)

| Правило | Деталь |
|---------|--------|
| Product preview | **Нарезанные** слайды **4:5** — Create / Razbor draft RIGHT preview / feed |
| Designer draw | **Сначала** горизонтальная панорама (N×1080)×1350 → **затем** slice; bridges cross cuts (`workers/designer-carousel`) |
| Forbidden as sole UI | Одна **целая панорама** как единственный preview / publish asset |
| Panorama input | OK как **вход** Deconstructor **и** как внутренний draw master |
| Export | `slide_01.png`… per slide; master panorama optional internal — **не** UI вместо нарезки |
| Settings Design (**S52**) | **Только** colors + typography + text-block + small-element tokens — **нет** layout markup, **нет** button kits, **нет** COVER/BODY/CTA sliced sample. Agent payload = те же tokens only |
| Themes (**S52**) | System prompts / live-gen: **запрет** hardcoded coffee/club-only themes — **random Armenian** themes для test/live gen. Golden few-shots OK как craft examples, не как единственная тема продукта |
| Etalon folder | User/Client refs → `generatedMedia/эталон карусели/` (или `memory/fixtures/эталон карусели/`) для side-by-side compare |

## Role split (open-source inspired)

| Агент | Роль | Делает | Не делает |
|-------|------|--------|-----------|
| **Сценарист** | **Dramaturgy & Hook Engine** | JSON story: hooks, swipe triggers, **on-slide copy** (`headline`/`body`), metadata, `visual_prompt` per slide | PNG pixels, hardcode N slides |
| **Дизайнер** | **Layered Visual Engine (S57)** | Parse `slides[]` **любой длины**; (a) bg image prompts = **scene only** + HARD ban letters/logos; (b) invent HTML/CSS layout (taste from layered-html-refs); (c) composite via Puppeteer; brand logo+name + 3 DESIGN.md fonts + CTA HTML + cut-out Персонажи **over** bg | Менять N без user request; bake text/logo into image model; type-on-PNG as ship; infobusiness water |

Patterns (inspiration only — не vendor lock):

- **swipekit** `SlideObject`-style typed slide fields
- **open-carrusel** safe-zone canvas
- **@upload-post/mcp**-style publish metadata (`caption`, `hashtags`, `alt_text`)

## Dynamic slide count (HARD)

| Правило | Деталь |
|---------|--------|
| Source of truth | **Только** запрос пользователя → `requested_slide_count = N` |
| Scriptwriter | `slides.length === requested_slide_count`; роли: **`cover`** + **`body_slide`×(N−2)** + **`cta_slide`** (N≥2); не шаблон «всегда 5/8» |
| Designer | Цикл `for (slide of slides)` — **никаких** `for (i=0;i<5)`, default `N=5`, brandbook max как единственный N; layout kit by **role** + active preset |
| Forbidden | Hardcode length in prompts/UI/fixtures as product truth; pad/truncate silently to fixed N; panorama-only preview |

Если user не сказал N — Сценарист **спрашивает** N (или Architect lock: один явный default **только** после вопроса). Не угадывать «красивое» число.

**S57 auto-7:** если тема = «N способов / N советов / N ошибок» (ways/tips list) — Scriptwriter **auto** `requested_slide_count=7` (cover + 5 body + cta) и **may bump** higher if needed. Otherwise follow user N / sheet `slides`.

## Vernatun tone (Dramaturgy)

| Нужно | Запрещено |
|-------|-----------|
| Культурные / community hooks (клуб, смысл, живой язык) | Инфобиз-вода: «секрет», «система на 6 фигур», «подпишись и забери» без содержания |
| Cover ≤ **6–8 слов** | Простыня на обложке |
| `swipe_trigger` на **каждом** слайде = **meta** «зачем листать дальше» (engagement QA) | Слайд без meta; **рисовать** `swipe_trigger` как on-slide copy |
| CTA только из каталога **1–4** на `cta_slide` | Произвольный 5-й CTA; игнор номера из чата user |
| Caption + hashtags + per-slide `alt_text` | Пустой metadata при handoff «готово к публикации» |

## `swipe_trigger` meaning (HARD) — rename sense, keep key

| | |
|--|--|
| **Field name** | `swipe_trigger` (stable for zod / fixtures — **не** ломать JSON key без миграции) |
| **Meaning** | Per-slide **descriptive meta** for engagement QA: «зачем зрителю листать дальше» |
| **NOT** | On-slide teaser / subtitle / footer painted on the PNG |
| **On-slide copy** | Only `headline` + `body` (+ CTA control from catalog) |
| **Designer** | **Ignore** `swipe_trigger` when building image prompts — never paint meta as on-slide text |
| **Client / Tester** | Read meta in artifact for S46 engagement QA |

Notes for prompt inject: `create-carousel-prompts-notes.md` (same folder).

## CTA catalog HARD (user number → cta_slide)

User writes **CTA 1 / 2 / 3 / 4** in Create Scriptwriter chat. Scriptwriter sets `cta_type` and writes Vernatun `headline`/`body` on **`cta_slide`**.

| # | Intent | Action |
|---|--------|--------|
| **1** | Вопрос зрителю | → напишите в комментариях |
| **2** | Хочешь ещё подобного? | → подписывайся |
| **3** | Живые встречи армянского разговорного клуба | → приглашение через TG-канал в шапке профиля |
| **4** | Понравился контент? | → лайк + сохранить |

| Rule | Detail |
|------|--------|
| Source | User chat number only; UI «?» cheat sheet (`content-factory-ui`) |
| Missing | **Ask** which of 1–4 — do not silently invent |
| Forbidden | 5th CTA pattern; infobiz outside rows 1–4; CTA on cover instead of `cta_slide` |
| JSON | `cta_type: 1\|2\|3\|4` on root and/or `cta_slide` (Architect locks zod) |

## Hook bar — captivating (HARD)

Сценарист **обязан** сделать cover/`hook` **цепляющим** — не нейтральный заголовок «о чём пост».

| PASS | FAIL |
|------|------|
| Pattern interrupt: paradox / вопрос / запретный жест / неожиданная правда клуба | Flat label: «5 советов», «О нашем клубе», «Добро пожаловать» |
| Desire to swipe in ≤1s of reading cover | Cover readable but no curiosity gap |
| Vernatun voice (ритуал, город, кофе, смысл) without infobiz water | Clickbait empty: «Секрет миллионеров» |
| `hook` field + `slides[0].headline` align; both ≤6–8 words sense | Weak hook + strong body (or vice versa) with no cover punch |
| Cover `swipe_trigger` **meta** answers «почему листать» (QA, not painted) | No meta reason; or meta dumped as on-slide text |

**Scriptwriter model canon (audit 2026-10-16):** Settings / mesh default = **Sonnet** with thinking/reasoning when API supports (upgrade from Haiku 5.5 — `llm-model-catalog-notes`). Flat hooks = FAIL.

## CTA — COMBAT brief sync (HARD · audit P4)

| Source | Must say |
|--------|----------|
| Create overlay / catalog | CTA **1–4**: comments · subscribe · TG profile · like+save |
| `COMBAT_USER_BRIEFS["carousel-engine"]` | **Same** 1–4 intents — **not** «бронь стола / запись в сторис» |
| Mesh Scriptwriter systemPrompt | Same catalog; ask 1–4 if missing |

Mismatch COMBAT vs overlay = prompt bug — fix in `agent-defaults` + overlays together.

## Phase 4 — E2E diffusion render (HARD · supersedes Phase3 HTML/CSS-first)

**User carte blanche 2026-10-16:** kill «pretty photo + base text layer». Expensive Instagram carousels = **integrated** typography painted by the image model.

| Layer | Role |
|-------|------|
| **LLM inputs to image model** | **Only:** Scriptwriter Dramaturgy JSON (scenario / `headline` / `body` / CTA intent / `visual_prompt`) + **approximate** design colors / brandbook tokens (Settings active) |
| **Primary paint** | `openai/gpt-5.4-image-2` (or Architect-locked image API) draws **full** 1080×1350 slide: scene **and** readable typography **and** CTA chrome **ON the image** |
| **Forbidden as primary** | Playwright / HTML / Tailwind **text overlay** as the main type path («photo bg + HTML text layer»); soft-success black frames; text-only slides |
| **HTML/Playwright** | **Deprecated** as product paint path. May remain only as **legacy fallback** behind Architect flag — **never** claim PASS if primary still overlays text |
| **Craft vs runtime** | Designer overlays + `create-carousel-prompts.ts` **must** instruct: bake `headline`/`body`/CTA into image prompt; zero «leave text blank for HTML later» |
| **Pipeline** | Still Scriptwriter → Designer → Draft (`upgrade_only` · `no_pipeline_break`). Draw path **in scope**; `shell_freeze` = AppShell/Create chrome only |

Keys / zod schema **stable**. Phase4 upgrades Designer **draw** prompts + Backend image path — **not** a new Create agent.

## Phase 5 — Anchor-ref pipeline + bake-off compare (HARD · 2026-10-17)

**User wave:** OpenAI/GitHub carousel best practice — **reference-first**, cover as **visual anchor**, slides **2–N match slide 1**. Client picks which pipeline is closest to etalon.

| Item | Rule |
|------|------|
| **anchor_ref_pipeline** | (1) Generate cover first (full E2E diffusion). (2) Pass cover PNG as **reference image** for slides 2–N. (3) Prompt: same world (palette / light / materials / type treatment / camera) as slide 1; only beat/copy/CTA changes |
| **e2e_diffusion** | Phase4 one-shot — each slide independent full paint (no cover-as-ref). Keep as compare arm |
| **etalon** | `generatedMedia/эталон карусели/` — style craft bar, not topic lock |
| **html_overlay** | Legacy bake-off label only. **S57 ship** = layered HTML is **the** product path (see Phase 7) |
| **Compare folder** | `generatedMedia/compare-carousel-bakeoff/{pipeline_label}/{theme-slug}/slide_0N.png` — **pipeline type in path** (HARD) |
| **Budget** | **3 × 3 = 9 PNG** new draw this wave. Etalon copies do not count. Overspend → stop-report |
| **Themes** | **Armenian LANGUAGE** related — different topics per carousel (alphabet / diaspora schools / East vs West / loanwords / …). Not coffee-only |
| **Locks** | `shell_freeze` chrome · `upgrade_only` · `no_pipeline_break` · draw path **in scope** |
| **Client** | **S54 HARD** — side-by-side folder compare; verdict = which label closest to etalon |

See Trainer card `plugins/trainer/carousel-anchor-ref-bakeoff.md` + inject `create-carousel-prompts-notes` § ANCHOR REF.

## Phase 6 — Correct-doc pipeline (`docs/карусель тест/correct/`) (HARD · answers locked 2026-10-17)

**User wave:** канон в `docs/карусель тест/correct/`. **10/10 answers locked** (Trainer card `plugins/trainer/carousel-correct-pipeline.md`). План → действие; на шаге писать **какого агента**. Цикл `@promts` / `CLIENT_ORCHESTRATOR_CYCLE`.

| Item | Rule |
|------|------|
| **Entry** | Sheet row (`status=new`) = **ДОПОЛНЕНИЕ** к Create-чату (не замена). Автоген по **расписанию** → **черновики**; юзер задаёт **время публикации** |
| **Useful-only (HARD · mini-wave)** | Читать **только** вкладку **«Полезные карусели»** gid=`902078005`. **Ignore meetings tab.** Meeting topics user inserts **into useful** with СТА=3 later — do not dual-poll meetings |
| **Sheet SoT** | Live: `https://docs.google.com/spreadsheets/d/1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls` (темы + флаги + `hero`). **Confirm useful-tab visibility before** localhost fill / smoke |
| **README flow** | row → Scriptwriter JSON \| `needs_input` → **zod STRICT + code critic (05)** (SW retry ≤2) → Designer **only** `image_prompt` → image → **vision** (≤2 gens/slide) → else deliver + `needs_review` → `ready` (PNG + caption + hashtags) → Drafts → **Publicist** auto schedule **OR** manual time |
| **Placeholders** | `{{BRAND_NAME}}` · `{{LOGO_REF}}` · `{{DESIGN_PALETTE_JSON}}` · `{{CHARACTER_CATALOG}}` (Settings **Персонажи**) · `{{MODE}}`=`useful` this wave |
| **Docs 01–06** | Still empty → Orchestrator explains file contents (card § Clarification); fill before paste into prod prompts. **Do not** invent prompt text from memory |
| **Brand UI** | Settings block **«Бренд»** **after** «Дизайн» — club logo + brand fields; **half-width** `max-w-[50%]` |
| **Персонажи / hero** | Settings **below Brand**: **«Персонажи»** (rename from Пейзажи) — cells name + multi-angle photos; **half-width**. Sheet `hero` empty = no character; else character **number** → catalog. API key `landscapes` OK internally |
| **Critic** | Code critic **supplements** (does **not** replace) current zod **STRICT** |
| **Vision** | Best available vision model. Max **2** gens per slide (1 retry). Then **deliver** crooked text + `needs_review` / signal — no infinite loop |
| **Full replace** | **STRICT** follow correct/ — **supersede** old Designer inventiveness / rich invent overlays / prior draw invent path |
| **vs Phase4/5 (Q9)** | Correct **sheet/Brand/Персонажи/Logs/Publicist** KEEP. **Paint SUPERSEDED by Phase 7 / S57** — type-on-PNG + vision **OFF**; layered HTML = ship. CTA **1–4** + `swipe_trigger` meta **KEEP** |
| **Logs / mesh** | Agent settings tab **«Логи»**; workflow agent node **RED perimeter** on error |
| **Publicist** | Publishes drafts via **auto schedule (settings)** **OR** **manual** publish time — not silent agent side-publish outside this path |
| **Docs gate for prompts** | Non-empty `01`–`06` (or Orchestrator-drafted + user-reviewed) before AI Bridge copies SW/Designer text into prod; vision prompt **04** unused while vision OFF |

**Resolved divergence (answers):**

1. Entry = Create **plus** sheet (+ schedule→drafts) — both live  
2. **Useful-only** intake (gid 902078005); meetings ignored this wave  
3. zod STRICT **+** critic 05  
4. Vision — **OFF** under S57 (was ≤2 then deliver)  
5. Designer layout invent OK under S57 HTML; bg = scene-only (no text/logo)  
6. CTA 1–4 + `swipe_trigger` **KEEP**  
7. Statuses map to Drafts + Publicist schedule/manual  
8. Characters = **Персонажи** cut-out **over** bg + sheet `hero` number  

See Trainer: `plugins/trainer/carousel-correct-pipeline.md` · **S57** `plugins/trainer/carousel-layered-html-pipeline.md`.

## Phase 7 — LAYERED HTML pipeline (HARD · S57 · 2026-10-17)

**Single product render.** Trainer card: `plugins/trainer/carousel-layered-html-pipeline.md`. Etalon taste: `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/` (esp. **#3** cut-out).

| Item | Rule |
|------|------|
| **Render** | Image bg + HTML/CSS → **Puppeteer** composite @ **1080×1350**. **One** mode — delete/`deprecate` `correct_pipeline` / type-on-PNG as product success |
| **Image model** | Paints **scene/bg only** from `visual_prompt`. **FORCE** no letters / logos / watermarks — prompt **and** code guards. Logo = HTML from Settings Brand |
| **HTML layer** | Headline/body typography; brand name+logo; CTA **1–4** button on `cta_slide`; **3 fonts** from active DESIGN.md (title/body/content; download if missing) |
| **FULL DESIGN inject HARD** | Pass **complete** active DESIGN.md / DesignPreset into Designer: fonts + sizes + **colors per text role** (title/body/content/accent/slideNumber). Positive scale table only (no «don't assume 64px»). Colors drive HTML **and** bg mood. `html_layout` = placement only; start sizes from DESIGN |
| **Font fit** | May **REDUCE** below DESIGN scale only if copy overflows; **never enlarge** arbitrarily; document in overlay/`fontFit` |
| **Logo HARD** | Settings Brand `logoRef` → Puppeteer **`<img>`**. Dual-path: sanitize for LLM; **raw** for composite. Transparent bg (strip black matte on install). **Wordmark (Vernatun):** **omit** `.brand-name` / club-name text (`phase1-logo-wordmark-html.md`) **unless** Phase 2 path **A** (emblem PNG + HTML wordmark). **Placement v2 (`logo-placement-v2.md`):** body = **`bottom-left`**; COVER + LAST = **TOP** prefer **`top-left`**; size = **`BRAND_LOGO_SIZE_PX` 2×** (`88`→`176`). **Phase 2 (`phase2-vision-prompt-logo.md`):** emit **`html_layout.logo.textColor`** (`logoTextColor`) for contrast; composite applies; investigate fringe/soft mark (prefer A emblem+HTML wordmark or B crisper mark). Name-only when logo file set (and not path A) = **FAIL** |
| **Slide number HARD** | Separate HTML block/slot; tokens = **body paragraph** (family/color/size); pretty `N / M` |
| **Layout variety HARD** | Adjacent slides must vary anchor (bottom/right/center mixes) — **not** always top-left |
| **Club name font** | Wordmark/name in HTML uses DESIGN **content/body** family (`--cf-font-content` / `--cf-font-body`); size from scale or brand-chrome token — document in DESIGN.md typography; **not** hardcoded Inter |
| **swipe_trigger** | Meta only — never HTML, never image |
| **Characters** | Персонажи cut-outs **OVER** bg (not in scene prompt). Split-across-slides = **optional rare** |
| **Layout invent** | Designer invents HTML composition; refs = taste bar not rigid clone |
| **Variant A (wave)** | Prefer structured **`html_layout`** JSON (`template` / `anchor` / `highlights`) executed by `carousel-layered-composite` — see `.claude/skills/art-director/html-layout-variant-a.md`. Closed template enum; **no** raw HTML from LLM |
| **Art Director** | After composite ready: Gemini vision → `approve` \| `remarks`; virality+design+completeness; thin 2-sentence slides → remarks; **NO auto-remake**. Skill `art-director` |
| **Vision OCR remake** | **OFF** (S57). Art Director multimodal critique **ON** (Gemini) — different path, no remake |
| **Slide count** | Auto **7** for «N ways» topics; Scriptwriter may bump; else user/sheet N |
| **Smoke (2026-10-18)** | **ONE** **6-slide** layered carousel + pretty HTML numbering `N / 6` + AD Gemini review text |
| **Client** | **S57 HARD** (+ wave smoke 6-slide) |
| **Supersedes** | S53 kill-overlay ship bar · Phase4 E2E type-on-PNG · Phase6 vision/`correct_pipeline` paint |

## Validation budget this wave

| Wave | Budget |
|------|--------|
| Phase4 / S53 smoke | **2 × 3 = 6 PNG** (legacy) |
| Phase5 bake-off / S54 | **3 × 3 = 9 PNG** new draw (legacy) |
| Useful-smoke 51/1/17 | **legacy** — superseded; do not regenerate 12-PNG set |
| **S57 layered Client score** | **ONE** carousel × **4** final slides (≤8 finals without stop) |
| **Wave 2026-10-18 AD/logo/type** | **ONE** carousel × **6** finals + AD Gemini text + pretty `N / 6` numbering |

Artifacts under `generatedMedia/` + `docs/карусель тест/` (rewritten smoke folder). Absolute S44 ceiling ≤40 still applies to other waves.

## Prompt-trace + viral JSON (diagnostic wave)

When diagnosing quality loss: skill **`carousel-prompt-trace`** + folder **`docs/карусель тест/`**.  
Schema-valid but **flat** hooks/body = FAIL — viral craft must land in JSON (see `create-carousel-prompts-notes.md` § Viral craft). Designer traces must show **EXACT** per-slide **image** prompts (incl. typography instructions) — **not** `image_llm: skipped` + HTML-only. Pipeline stays Scriptwriter → Designer → Draft.

## Strict JSON schema (handoff artifact)

Сценарист **обязан** отдать один JSON-объект (в chat как fenced `json` + machine-readable artifact для Designer). Поля — канон волны; Архитектор может уточнить names в Prisma/zod, **смысл** не резать.

```json
{
  "contentType": "carousel",
  "requested_slide_count": 7,
  "idea": "one-line concept",
  "hook": "captivating cover hook ≤6–8 words — pattern interrupt, not flat label",
  "tone": "vernatun",
  "cta_type": 1,
  "slides": [
    {
      "index": 1,
      "role": "cover",
      "headline": "≤6–8 words",
      "body": "",
      "secondary_copy": "MUCH wider supporting detail for HTML (≥220 chars / ≥5 clauses on body) — value beat / example / micro-story — not 3 short sentences",
      "swipe_trigger": "META engagement QA — why swipe to slide 2 (NOT painted on slide)",
      "visual_prompt": "scene / light / materials (≥3 elements); cultural motifs OPTIONAL — no forced laundry list; NO letters",
      "alt_text": "a11y description of visual",
      "safe_zone_notes": "optional override; default canvas rules apply"
    }
  ],
  "caption": "IG/TG caption",
  "hashtags": ["#…"],
  "promptForDesigner": "human brief + pointer to slides[]"
}
```

| Field | Rule |
|-------|------|
| `requested_slide_count` | Integer = user N; **must** equal `slides.length` |
| `slides[].role` | Canon: **`cover`** \| **`body_slide`** \| **`cta_slide`**. Aliases `point`/`proof`→`body_slide`, `cta`→`cta_slide`. Rhythm under N, not fixed length |
| `slides[].visual_prompt` | **S57:** scene / light / materials / composition **only** for bg image model — **no** letters, logos, watermarks, on-slide copy. Typography + CTA + brand logo → **HTML layer**. **Richness HARD:** ≥3 concrete scene elements. Armenian/Vernatun cultural taste = **OPTIONAL** — **forbid** forced laundry lists (same khachkar/apricot/pomegranate/carpet every post). One-sentence «красивый фон» / empty / motif-checklist spam = **FAIL** |
| `slides[].secondary_copy` | Supporting/body detail for HTML — **MUCH wider** (wave 2026-10-18 layout-copy): body slides **≥220 chars AND ≥5 clauses** (or ≥4 short paragraphs). Not 3 short sentences / headline echo. Thin air = **FAIL** |
| `slides[].swipe_trigger` | Required every slide — **meta engagement QA only**; **never** on-slide copy; last = soft end OK |
| `cta_type` | `1\|2\|3\|4` from catalog; must match user number when given; on root and/or `cta_slide` |
| `caption` / `hashtags` / `alt_text` | upload-post-style metadata; required before Publication step is «complete» |

**Supersedes** wave3 minimal `{ text, colors }` as **sole** handoff — colors may remain optional tokens; dramaturgy fields + dynamic N are mandatory.

### DesignPreset + colors (Designer paint · Phase4)

| Item | Rule |
|------|------|
| Active slot | Settings Embla `activeId` → `DesignPresetFile` + DESIGN.md **tokens** (colors / type / text-block / small-element) |
| To image model (**S57**) | Scene + approx **palette mood** only — **no** type/CTA/logo in image prompt |
| HTML/Puppeteer (**S57**) | **Product ship path** — composite text/logo/CTA/cut-outs over bg @ 1080×1350 |
| Legacy type-on-PNG | Deprecated as product success (**S53** arm only if wave re-arms it) |
| Bridges | If panorama→slice kept — **seamless bridges** across adjacent sliced PNGs (`workers/designer-carousel`) still diffusion-painted |
| Deconstructor | Vision ref → DesignPresetFile + DESIGN.md → library slot (not orphan one-off) |
| **Grid + layoutMap** | Upload **4** slides (cover·mid·mid·CTA) → colors/fonts/sizes **+** `layoutMap` (anchors, numbering present\|absent, logo/CTA chrome). Gen **copies grammar**; content+bg+CTA only. No ref numbers → no gen numbers |

## Canvas / safe-zone (open-carrusel inspired)

| Spec | Value |
|------|-------|
| Canvas | **1080 × 1350** (4:5) |
| Top safe | ≥ **120** px |
| Bottom safe | ≥ **160** px |
| Sides safe | ≥ **80** px each |

Text / logo / CTA **внутри** safe-zone. Background art может bleed full-bleed; readable copy — нет.

## Designer pipeline — Phase7 LAYERED HTML (**product · S57**)

1. Resolve design context: **Default path** — **FULL** active DESIGN.md (**3 fonts** + **`typography.scale`** + **colors per role**); Brand name+**raw logoRef**; Персонажи if `hero` set. Download fonts if missing. Inject full token table into Designer every draw. **`styleCopyMode=vision_ref` exception (HARD):** **do NOT** inject FULL DESIGN TOKEN CARD / stock typography.scale; attach **etalon slide** as image reference; Brand Vernatun text+CTA (+ optional logo) separately. Card: `plugins/trainer/vision-style-copy.md`.
2. Parse handoff JSON → `slides.length === requested_slide_count`; roles cover / body_slide×(N−2) / cta_slide; auto-7 when «N ways»; require rich `secondary_copy` on body slides.
3. **Per slide bg:** image prompt = rich `visual_prompt` **scene only** + HARD «NO text NO letters NO logos NO watermarks» (prompt **and** code strip/reject). Motifs optional — no forced Armenian checklist. On vision_ref: composition/photo **geometry follows etalon** (partial/inset OK — **not** always full-bleed cover).
4. Call `openai/gpt-5.4-image-2` → bg PNG 1080×1350 (illustration/photo only); mood from DESIGN colors **or** from vision ref when vision_ref.
5. **HTML / Variant A + layoutMap / vision_ref:** If `styleCopyMode=vision_ref` — hard-copy zones/hierarchy/logo/CTA/numbering **from image ref** into `html_layout` (layoutMap optional, not required). Else if active preset has `layoutMap`, **copy** map grammar. Else invent with **anchor variety**. Type: DESIGN scale on default path; on vision_ref — **match ref**, not stock Manrope/Cormorant table. CTA 1–4 on `cta_slide`. Character: product default **`in_image`** (`overlay_cutout` legacy). Taste: `layout-copy-refs-2026-10-18/` + layered-html-refs #3.
6. **Slide number:** render **only if** etalon/map says present; own HTML slot; body tokens; pretty `N / M`. Absent on ref → **omit**.
7. **Puppeteer localhost** raster composite → final `slide_0N.png` @ 1080×1350.
8. OCR remake vision **OFF**. Art Director Gemini after ready. Export preview = **N× 4:5** finals.
9. **Drafts HARD:** Create success → Черновики.
10. **Trace:** bg image prompts + HTML layout notes + **`styleCopyMode`** + whether FULL TOKEN inject skipped + character_paint (`carousel-prompt-trace`).
11. **Deconstruct path (verify):** Settings upload **4-slide grid** → deconstruct → DESIGN.md + optional layoutMap (legacy). **Vision-ref path (this experiment):** etalon → image reference on draw — **not** «fix layoutMap parser only».

### Brand logo dual-path + chrome (HARD)

| Channel | `logoRef` handling |
|---------|-------------------|
| **LLM prompts** (Scriptwriter/Designer text) | `sanitizeLogoRefForLlm` — strip huge data-URLs to short stub (aggregator 400 guard) |
| **Puppeteer composite** | Pass **raw** Settings Brand `logoRef` → `resolvePlaywrightImageSrc` → `<img class="brand">` |
| **Chrome layout** | **Bottom-RIGHT**; icon **enlarged**; **transparent** bg; club name **horizontal right of icon** (not under) |
| **FAIL** | Sanitized stub as composite `logoUrl`; name-only; name stacked under icon; tiny mark; solid plate behind logo |
| **Backend fix path** | `buildCorrectPlaceholders` / `logoRefRaw` at composite; CSS `.brand { bottom-right; flex-row icon→name }` in `carousel-layered-composite` |

### Club name font — where set

| Layer | Where |
|-------|--------|
| **Settings Brand** | `brandName` string (`/api/settings/brand`, `BrandPanel`) — text only |
| **DESIGN.md / preset** | Families: `typography.display` / `body` / `content` (+ optional `scale.brandName` or content size). Active slot → CSS vars `--cf-font-*` |
| **Composite runtime** | `.brand-name { font-family: var(--cf-font-content, var(--cf-font-body)); … }` in `carousel-layered-composite` — **must** stay on DESIGN tokens; Architect may expose size via `typography.scale` |
| **Not** | AppShell Century Gothic UI font as slide wordmark; hardcoded Inter; baking name into bg image |

Ensure DESIGN.md documents brand/wordmark under typography (family + size). Deconstructor / seed presets should include scale so club name matches brandbook.

### Designer pipeline — Phase4 E2E image (**LEGACY — not S57 ship**)

Prior: full diffusion typography ON PNG; kill HTML primary. Kept for history / explicit re-arm only. See `plugins/trainer/e2e-image-carousel.md`.

### Designer pipeline — Phase5 `anchor_ref_pipeline` (**LEGACY bake-off arm**)

Prior bake-off arm. Not required for **S57** acceptance.

**«Готово» без видимых кадров = FAIL** (preview-black).  
**Type-on-PNG / `correct_pipeline` paint as product success = FAIL** (Client **S57** — must be layered).  
**Letters/logos on bg image = FAIL** (S57).  
**Describe chat on mini via image-id = FAIL** (model routing).  
**Create без Черновиков = FAIL** (`C-drafts-always`).

### Active DESIGN.md library (Settings → Design)

| Правило | Деталь |
|---------|--------|
| Library | До **10** слотов DesignPresetFile + DESIGN.md (Embla — `content-factory-ui`) |
| Slot UI | Embla slide = **interactive 3-slide sliced 4:5 preview** (cover/body/cta sample) + swatches + chip **DESIGN.md** top-right — **не** одна панорама |
| Selection | Выбранный слот = единственный visual canon следующего render |
| Quick Theme Tuner | Live CSS var overrides на sliced preview |
| Create from reference | Visual Style Deconstructor → new library slot + set current |
| Razbor CTA | «Добавить новый дизайн» → image → Deconstructor → MD + preset → append + **set current** |
| Preview panel | Open **и Close** (`C-145`); залипшая панель = FAIL |

## P0 — Black preview after «готово» (`C-carousel-preview-black`)

Симптом: Дизайнер пишет «готово», LLM/API сгенерировал images, **preview справа чёрный / пустой**.

| Роль | Обязан |
|------|--------|
| **Frontend** | Трассировать: generate response → state `slides[]`/`generatedMedia` → `<img src>` / blob URL → CSS (bg-black gap, opacity 0, 0×0, wrong aspect wrapper). Fix wire so successful draw shows real frames. |
| **Tester** | Guard: after draw success, preview `data-testid` frames **non-black** (pixel/contrast or naturalWidth>0 + visible src); reject «bubble готово + empty pane». |
| **AI Bridge** | Не считать text-only «готово» успехом draw: artifact must include image URLs/paths matching `slides.length`. |
| **Architect** | Spec root-cause paths (URL, CORS, state key, HTML render→PNG not attached to preview). |

Связанный, но **другой** баг: C-131 black **flash between** slides — не путать с **permanent black after first draw**.

## Verification checklist (в TZ / guards)

- [ ] User задал N → JSON `requested_slide_count === N === slides.length`
- [ ] Нет hardcoded slide count в Scriptwriter system prompt / Designer loop / fixtures как truth
- [ ] Cover ≤ 6–8 words; каждый слайд имеет `swipe_trigger` (**meta**, не on-slide)
- [ ] Designer не рисует `swipe_trigger` на PNG/HTML text
- [ ] User CTA number → `cta_type` + `cta_slide` catalog 1–4 (or ask)
- [ ] Tone Vernatun: нет инфобиз-воды вне каталога
- [ ] `caption`, `hashtags`, per-slide `alt_text` present
- [ ] Create Scriptwriter UI: «?» CTA cheat sheet (S46)
- [ ] Canvas 1080×1350; safe Top≥120 Bottom≥160 Sides≥80
- [ ] Designer accepts arbitrary `slides.length`
- [ ] Export `slide_01.png` … `slide_NN.png`
- [ ] After «Нарисовать» + «готово»: preview показывает **видимые нарезанные 4:5** кадры (не чёрный экран, не одна панорама)
- [ ] Roles cover / body_slide / cta_slide; CSS vars from active preset
- [ ] S41 chrome + **S42** JSON/N/preview + **S44** Design sliced + deconstructor + premium vs golden refs
- [ ] Wave PNG budget ≤40; artifacts under `generatedMedia/wave-visual-deconstructor/`

## Marketing-save / premium (S44 + S45)

| Rule | Detail |
|------|--------|
| Cover | **Captivating** hook ≤6–8 words; swipe desire (see Hook bar) |
| Body | Proof / ritual / metric — not filler |
| Swipe meta | `swipe_trigger` filled for QA; **not** painted on frame |
| CTA | Catalog **1–4** only on `cta_slide` (user number); visible control |
| Look | Active preset primitives visible (marker **or** glass/gold — not generic dark card) |
| Draw | Panorama-first → slice; bridges cross cuts |
| Preview | Sliced 4:5 only; panorama ≠ sole UI |
| Settings | Colors only — no layout markup editor |
| FAIL | Flat hook; isolated cards; panorama-only UI; no CTA; below golden refs |

## Related tickets (proposed)

| Id | P | Scope |
|----|---|--------|
| `C-carousel-preview-black` | **P0** | FE (+ Tester guard): preview wire after draw |
| `C-carousel-json-scriptwriter` | P1 | Dramaturgy JSON + dynamic N + Vernatun tone |
| `C-scriptwriter-swipe-cta` | P1 | `swipe_trigger` meta-only + CTA catalog 1–4 + Create «?» hint (S46) |
| `C-carousel-html-designer` | P1 | Parse any-length; role layouts; HTML/Tailwind; safe-zone; sliced PNG |
| `C-visual-style-deconstructor` | **P0** | Vision → DesignPresetFile + DESIGN.md → library; presets dark_notes/bento_glass/… |
| `C-design-slot-sliced-preview` | **P0** | Settings Design: 3×4:5 sliced preview + swatches + Quick Theme Tuner + Create from reference |
| `C-carousel-css-vars-builder` | P0/P1 | carouselHtmlBuilder CSS vars + seamless bridges |
| `C-reels-scriptwriter-upgrade` | P1 | custom-reels hook 0–2s · beats · CTA (skill `reels-scriptwriter`) |
| `C-drafts-always` | **P0** | Create → всегда карточка в Черновиках (persist) |
| `C-settings-design-md-carousel` | P0/P1 | Embla library ≤10 + preview close + Razbor upload |
| `C-team-brief-n-indicator` | P1 | Team «Задание» empty + C-155 verify + remove bottom-left «N» |
