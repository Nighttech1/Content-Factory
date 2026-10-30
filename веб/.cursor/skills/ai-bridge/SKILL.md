---
name: ai-bridge
description: >-
  AI Bridge: tools, RAG, Cortana retrieval, system prompts, confirmed side-effects.
  Use when acting as AI Bridge or fixing chat/premoderation/Cortana tickets.
---

# AI Bridge

## Skill-first

1. Этот файл
2. Промпты LLM → `.cursor/skills/prompt-engineering/SKILL.md` (+ `techniques.md` / `templates.md`) — **до** любой правки system/user
3. Cortana (Telegram, GCal, HITL) → `.cursor/skills/cortana-stack/SKILL.md`
4. **Cortana context §5–9** → `.cursor/skills/cortana-retrieval/SKILL.md` (filter → sufficiency → entity vector)
5. Схема целей → `.cursor/skills/sputnik-data-schema/SKILL.md`
6. RAG / memory / vector / graphs → `.cursor/skills/rag-stack/SKILL.md`, затем нужный `.agents/skills/…`
7. Плагины: `plugins/ai-bridge/PLUGINS.md`
8. Typed JSON → `pydantic-v2`

## Rules

- Side-effects только через tools + подтверждение пользователя (HITL).
- Нет данных в FILTERED_CONTEXT / VECTOR_HITS → не выдумывать; при нехватке — `need_vector_search`, после пустого vector — честный отказ.
- Полный dump / «всегда digest» — не единственный контекст после Шага 6 ТЗ.
- Секреты не в логах и не в git.
- Регрессии Клиента → тест/guard (`tester/cortana-retrieval-guards.md`) + правка schema/промпта.
- **Razbor (C-59 + C-62):** Designer + slide mutate **только** `carousel-engine`; промпты/packs не возвращать Designer на graphics/reels. Handoff Razbor: Scriptwriter → Designer → Publisher pane (пока без C-carousel на Razbor).
- **Create carousel (**C-carousel-***):** Scriptwriter → Designer → шаг **Публикация** (**без** Publisher agent). Канон: `carousel-studio-handoff` + **`carousel-json-contract`**. No-mock; markdown; no auto-handoff сценариста.
- **JSON Dramaturgy wave:** Scriptwriter system/skills = Dramaturgy & Hook Engine (strict JSON, dynamic `requested_slide_count` from user only). Designer = Layout & Visual Engine (parse any-length `slides[]`, HTML fonts + `visual_prompt` backgrounds). Text-only «готово» без image URLs/paths = **не** success draw (`C-carousel-preview-black`).
- **Visual Style Deconstructor (**C-visual-style-deconstructor**):** `deconstructStyle` → `DesignPresetFile` + DESIGN.md; seed golden `dark_notes` / `bento_glass`; create-carousel prompts = preset CSS vars + role kits + **panorama→slice** + sliced UI (`workers/designer-carousel` § prompts canon). Budget ≤40 PNG/wave. **Wave 2026-10-18-design-inject:** Architect verifies upload liked slide → deconstruct → DESIGN.md (colors/fonts/sizes) → `buildDesignTokensPayload` **FULL** inject on Designer draw.
- **FULL DESIGN + logo BR + variety (**2026-10-18-design-inject**):** Designer system gets **complete** DESIGN.md role table (fonts+sizes+**colors**); positive scale only (no «don't assume 64px»). Scriptwriter: `secondary_copy` **2–3×** richer; `visual_prompt` ≥3 elements, Armenian motifs **optional** (no laundry list). Logo chrome: enlarged, **bottom-RIGHT**, transparent, name **beside** icon. Slide number = own HTML slot / body tokens. `html_layout` anchor variety (not always top-left). Font fit = **reduce-only**. Card: `plugins/trainer/design-inject-logo-br.md` · notes: `create-carousel-prompts-notes`.
- **Layout-copy + dual character (**2026-10-18-layout-copy**):** Upload **4** ref slides → deconstruct **colors+fonts+sizes + `layoutMap`** (text anchors, numbering present|absent, logo/CTA chrome). Gen **copies layout grammar**; invents content+bg+CTA only. No ref numbering → **omit** `N/M`. Scriptwriter `secondary_copy` **MUCH wider** (body ≥220 chars AND ≥5 clauses). Three DESIGN.md from grids (RE orange · luma coffee · omkopa teal). Dual paint: `character_paint=in_image` vs `overlay_cutout` conductor (legacy dual smokes). Etalon: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`. Card: `plugins/trainer/layout-copy-dual-char.md`. Dual smoke **2×6** (historical). **Product default character (after vision-style-copy):** `in_image` — cutout not default.
- **Vision style-copy (**2026-10-18-vision-style-copy** · HARD):** `styleCopyMode=vision_ref` — attach **etalon slide PNG** as **image reference** to Designer/draw. Prompt: hard-copy composition / zones / hierarchy / logo / CTA / numbering from the picture. **BAN** injecting **FULL DESIGN TOKEN CARD** / stock Manrope·Cormorant / default `typography.scale` on this path (LLM must not «apply the spreadsheet»). Brand Vernatun = **our** text + CTA 1–4 (+ optional Settings logo) separately. Bg: honor **partial/inset** photo geometry from ref — not always full-bleed cover. **Do not** treat layoutMap-parser fix as the only path. Product default `character_paint=in_image`. Smoke keep path A: `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/` ×6. Card: `plugins/trainer/vision-style-copy.md` · notes § VISION STYLE-COPY.
- **Phase 2 vision prompt + logoTextColor (**2026-10-18-phase2-vision-prompt** · HARD):** Line-scrub **IMAGE** prompt (`buildVisionRefBackgroundImagePrompt` + `sanitizeBackgroundImagePrompt`) — etalon copy = SoT; remove conflicting/stock lines; KEEP Manrope/scale BAN on Designer path. Designer emits **`html_layout.logo.textColor`**. **Deliver clean final IMAGE prompt for user review before implement.** Phase 3 Pixar OUT (hygiene: soften forced 3D-animated conductor wording only). Card: `plugins/trainer/phase2-vision-prompt-logo.md` · notes § PHASE 2.
- **Pipeline practice HIGVEN×3 (**2026-10-18-pipeline-practice-higven-3** · HARD):** Active etalon **01 HIGVEN** (clear other presets; **02** inactive library OK). Scriptwriter = **Haiku** → HITL **«Передать дизайнеру»** (no auto-handoff). Designer GPT **ONE** reply = parallel pack: `image_prompt`×3 + `html_layout`×3 → then GPT Image ‖ renderer prep. Strict **N=3** cover/body/cta. Brand = **full** `vernatun-logo.png` HTML `<img>` (wordmark baked — **no** forced second call / invent `logo.textColor`). **`characterPaint=none`** (no girl). Art Director remarks\|approve **no remake**. Smoke ≤**3** attempts → `docs/карусель тест/pipeline-practice-higven-3/`. Card: `plugins/trainer/pipeline-practice-higven-3.md` · notes § HIGVEN-3.
- **S49→S52 brandbook tokens:** Deconstruct → Settings Design **token cards** (colors · typography · text-block · small-element; Atelier Synth-style) — **не** button layout kits, **не** COVER/BODY/CTA sliced prefs. Designer agent-start читает **только эти tokens** (+ preset id), не User brief, не layout markup. **Exception (layout-copy wave):** vision-extracted `layoutMap` may ship inside preset/DESIGN.md for grammar copy — still **not** a human layout markup editor. **Exception (vision_ref):** skip FULL token-card inject; style from image ref.
- **S49 no User brief:** agent-start / generate / live chat **никогда** не получают Team User basic brief (поле удалено). C-155 raw-only остаётся.
- **Panorama→slice + colors-only (S45):** `create-carousel-prompts.ts` must instruct: draw horizontal panorama first → slice 4:5; bridges cross cuts; Create preview = sliced only. Settings Design = colors/token brandbook — layout invented by LLM (no markup editor).
- **Model defaults (S45 → audit 2026-10-16):** Designer **draw/image** = `openai/gpt-5.4-image-2` (confirm ≠ mini). Designer **describe/chat** = **Sonnet text** — **HARD:** mesh image id must **not** be sent as chat `model` (aggregator falls to `gpt-4o-mini` = FAIL). Scriptwriter carousel = **Sonnet** (upgrade Haiku→Sonnet). Wire `llm-models.ts` + `mesh-agent.ts` + `agent-defaults` + `agent-chat/route.ts` — see `.cursor/skills/trainer/llm-model-catalog-notes.md`. Trainer does not edit `lib/`.
- **Captivating hook:** Scriptwriter system prompts must enforce Hook bar — flat cover = FAIL. Thinking/reasoning ON on Sonnet path when API supports.
- **Carousel audit reconstruction (PROMPT_AUDIT):** Phase1 = dedupe agent-start, paired invariants, CTA COMBAT↔catalog 1–4, embed **full** JSON few-shots. **Phase4 E2E type-on-PNG = LEGACY.** **Phase 7 / S57 (product):** image-2 paints **scene/bg only** (FORCE no letters/logos via prompt+code); HTML/CSS + Puppeteer overlay = type + Brand logo + CTA 1–4 button + Персонажи cut-outs OVER bg; vision **OFF**; auto slides=7 for «N ways»; fonts×3 from DESIGN.md; etalon `layered-html-refs-2026-10-17/` (#3 best). Single `layered_html` renderMode — no parallel `correct_pipeline` paint. Locks: `upgrade_only` · `no_pipeline_break` · `shell_freeze` chrome · draw/composite **in scope**. Client **S57**. Details: `carousel-json-contract` Phase 7 + `plugins/trainer/carousel-layered-html-pipeline.md` + `create-carousel-prompts-notes` § LAYERED HTML.
- **Reels Scriptwriter (**C-reels-scriptwriter-upgrade**):** upgrade `agent-defaults` `custom-reels` per skill **`reels-scriptwriter`** (hook 0–2s · beats · CTA · `promptForMontage`). Do **not** mix with carousel JSON.
- **Marketing Director (**S47**):** stub → `.cursor/skills/ai-bridge/marketing-director-prompt.md`. Haiku 5.5 + thinking; tools = app **GraphQL** + **search** for content strategy; C-155 payload rules; HITL before write side-effects. Advises strategy — does **not** replace Scriptwriter Dramaturgy JSON / Designer draw.
- **Razbor LIVE (**S48**):** на **новом** разборе после UI **«Начать разбор»** — **обязателен live Haiku** (Polza), **запрет silent mock**. Stub → `.cursor/skills/ai-bridge/razbor-live-prompt.md`. **S52:** open **existing draft** → **нет** «Начать разбор»; inject **carousel context** (JSON + slide URLs) в Create-parity agents; RIGHT preview = that draft. Models: Разборщик/Scriptwriter per catalog; Designer draw = `openai/gpt-5.4-image-2`.
- **Themes (**S52**):** system prompts / live-gen / smoke — **запрет** hardcoded coffee/club-only Vernatun topics. Use **random Armenian** theme pool (ritual/city/heritage/food/language/… rotating). Golden few-shots (e.g. dark_notes_coffee) = craft examples only, not product theme lock.
- **S50 prompt strength (CRITICAL):** audit + harden **Scriptwriter / Designer / Razbor** system prompts before claiming generation OK. Weak hooks, flat CTA, generic visual_prompt, empty trainer tasks = **FAIL** — patch prompts (see `s50-prompt-hardening.md`), re-smoke live pipelines. Competitors feed must stay **live** data path (Backend scraper) — AI Bridge **не** подменяет mock fixtures как success. Create starts Scriptwriter with same quality bars as Razbor-seeded path.
- **S51→S52 Apify / Scout-only:** AI Bridge **никогда** не вызывает Apify / `IG_SCRAPER_*` из agent-start, mesh bootstrap, Razbor open, feed helpers, или prompt packs. **Scout** — единственный product owner scrape: tools/prompts Scout могут *описать* collect+filter, но **paid run** = Backend Scout entrypoint (UI **«Разведать»** / scheduler) — не side-effect LLM tool без Architect + HITL. Competitors feed = **last Scout snapshot** (Backend); AI Bridge **не** «refresh competitors» и **не** scrape on chat. См. `backend/apify-scraper-cost-discipline.md` + `xyflow-agent-mesh` Scout panel.
- **Sprint 9 (HARD) — upgrade-only / no-pipeline-break:** `DEV_PLAN` 9.1–9.11. Primary role. **Апгрейд** prompts/skills/contracts/agent-defaults **in place**. **Запрет** rewrite that removes **Razbor → Scriptwriter → Designer → Draft** or reels Scriptwriter → existing render. No UI shell redesign. No social publish. Other modules → Sprint 23. Skills: `prompt-engineering` § Sprint 9 + § Carousel audit · `carousel-json-contract` · `reels-scriptwriter` · `content-pipeline-agents` § Sprint 9 · `s50-prompt-hardening`. Golden fixtures + STRICT fail-on-parse + Claude-Code prompt packs (9.8) + critic before Draft.
- **Prompt-trace diagnostic (HARD):** when user/Client asks weak-link Scriptwriter→Designer→Image — skill **`carousel-prompt-trace`**. Write MD under **`docs/карусель тест/`** (templates in `_templates/`). Dump **full** system+user+LLM reply+final JSON (Scriptwriter) and **EXACT** per-slide **image** prompts (must bake typography; **not** HTML-primary) (Designer). Inject **VIRAL CRAFT** + **E2E DIFFUSION** blocks (`create-carousel-prompts-notes.md`). Optional `CAROUSEL_PROMPT_TRACE=1` dump helper (Architect path). Default budget **6 PNG**; **useful-smoke 51/1/17** = **12 PNG** (3×4) + timeline MD. `shell_freeze` chrome; draw path OK. No secrets in logs.
- **E2E diffusion carousel (HARD · Phase4):** Designer draw prompts + Backend path must **not** treat HTML/Playwright overlay as primary. Expensive IG look = integrated type on PNG. Client **S53** HARD REJECT if primary is still «photo + text layer».
- **Anchor-ref bake-off (HARD · Phase5 / S54):** NEW arm `anchor_ref_pipeline` — cover first, then slides 2–N with cover PNG as **reference image** (OpenAI/GitHub reference-first). Inject **ANCHOR REF** from `create-carousel-prompts-notes.md`. Write under `generatedMedia/compare-carousel-bakeoff/{pipeline_label}/{theme}/`. Also label `e2e_diffusion` (+ optional `html_overlay`). Themes: Armenian **LANGUAGE**. Budget **9 PNG**. Still type-on-PNG. `shell_freeze` chrome. Client picks closest to etalon. Card: `plugins/trainer/carousel-anchor-ref-bakeoff.md`.
- **Correct-doc pipeline (HARD · Phase6 · answers locked 2026-10-17):** Canon `docs/карусель тест/correct/`. Flow: sheet (**supplement** Create) → Scriptwriter → **zod STRICT + code critic** (SW ≤2) → Designer **image_prompt only** (**full replace** invent) → image → **best vision** ≤2 gens/slide → else **deliver** + `needs_review` → Drafts → Publicist auto\|manual. Placeholders from Settings **Brand** + **Персонажи** + DESIGN palette + `{{MODE}}`. Sheet `hero` empty|number. CTA **1–4** + `swipe_trigger` **KEEP**. S53/S54 **bake-off acceptance superseded** by correct; HTML-overlay-primary still FAIL. **Do not** paste empty `01`–`06` into prod — fill/clarify first (Orchestrator list). Card: `plugins/trainer/carousel-correct-pipeline.md` · `carousel-json-contract` Phase 6.
- **Useful-only smoke (HARD · mini-wave):** Intake **only** «Полезные карусели» gid=`902078005` — **ignore meetings**. Smoke rows **51, 1, 17** × **4 slides**. Write **MD timeline** (model id + prompts in/out) into `docs/карусель тест/` (+ optional subfolder). Card: `plugins/trainer/useful-smoke-51-1-17.md`. UI copy **Персонажи** (not Пейзажи).

## Model routing — chat vs image (HARD · audit P6)

| Endpoint / mode | Resolve model | FAIL if |
|-----------------|---------------|---------|
| Scriptwriter `chat` / `handoff` | Sonnet text (`claude-sonnet-4` / Polza slug) | Still default Haiku after this wave; or mini |
| Designer `describe` / `chat` / plan | **Sonnet text** (separate from mesh image id) | Passing `openai/gpt-5.4-image-2` into chat → mini fallback |
| Designer `draw` / `runCreateCarouselDraw` | **Image API** `openai/gpt-5.4-image-2` | Chat-as-draw; backgrounds from mini |
| Aggregator fallback `gpt-4o-mini` | Only true unknown text models | Used for Designer describe or Scriptwriter |

Implement in `agent-chat/route.ts` (+ helpers): `isMeshImageModel(id)` → pick `DESIGNER_TEXT_MODEL` / Sonnet for chat; image id only for image client.

## Phase 1 prompt packs (AI Bridge primary)

| Task | Files |
|------|-------|
| Dedupe | `agent-start-bundle.ts` — one HARD block; mesh prompt ≠ full overlay repeat |
| CTA sync | `COMBAT_USER_BRIEFS["carousel-engine"]` CTA rows = catalog 1–4 only |
| Few-shots | `sprint9-carousel-pack.ts` / bundle — paste full golden JSON bodies |
| Paired invariants | Shared checklist string used by both Scriptwriter + Designer overlays |

## Sprint 9 — Carousel + Reels quality (Claude Code bar)

| # | Deliverable | Skill |
|---|-------------|-------|
| 9.1 | Inventory live vs chrome (carousel+reels only) | this + Architect |
| 9.2–9.3 | Golden fixtures carousel + reels | `carousel-json-contract` / `reels-scriptwriter` + Backend fixtures |
| 9.4–9.5 | Scriptwriter hook/CTA/swipe + Designer brandbook/panorama→slice | contracts + create-carousel prompts |
| 9.6 | Reels IG+YT Shorts live generate | `reels-scriptwriter` |
| 9.7 | STRICT JSON — parse fail = fail job | Backend zod + AI Bridge |
| 9.8 | Prompt packs + few-shots + critic | `prompt-engineering` |
| 9.9–9.11 | Smoke / scorecard / fix loop | Tester (+ Fixer) |

**Запрет:** soft-mock success; pipeline rewrite; HeyGen/cartoon in this sprint; publish to IG/YT.

## Razbor LIVE — Haiku analyze + trainer tasks (**S48**)

| Шаг | Действие |
|-----|----------|
| 1 | Прочитать `razbor-live-prompt.md` |
| 2 | Wire agent-start Разборщик: media URLs (carousel slides **preloaded** client-side; server gets URLs/ids) + moduleId |
| 3 | On **«Начать разбор»** → Polza Haiku (+ thinking). **Analyze:** cover/hook · mid-slide value · CTA; **virality brief**; **trainer tasks** (concrete patches/prompts for **Scriptwriter + Designer**, module-wide — не только один post) |
| 4 | Handoff bundle → Scriptwriter **must include** insights JSON/markdown (hook/mid/CTA + virality + trainer tasks). C-155 user turns remain raw-only; insights travel via **agent-start / handoff context** |
| 5 | Boards path: uploaded images → same analyze prompt (no competitor id required) |
| 6 | Smoke: network shows live completion **or** explicit aggregator error — never fake «разбор готов» bubbles |

**Запрет:** mock razbor fixtures as success; skip Haiku; handoff without insights; Designer model ≠ image-2 default on Razbor path; put secrets in prompt.

## Live Polza chat — Scriptwriter / Designer (/ Publisher Razbor) (**C-155**)

Канон сообщений к aggregator / Polza chat completions (каждый **user turn**):

| Role | Content |
|------|---------|
| `system` | **Только** `systemPrompt` агента из mesh/Team settings (tab Инструкция). Model/temp/maxTokens — из `modelConfig`, не из brief |
| `user` | **Только** raw текст из composer (и prior user turns как были). **Без** append Team «Задание» / combat brief (**S49: поле удалено** — и ghost persist тоже не клеить), topic, handoff, DESIGN.md body |
| `assistant` | Ответ модели; UI показывает thinking status до первого token (см. Frontend C-158); **markdown**-friendly (абзацы) |

**Запрет:** `userContent = brief + "\n\n" + message`; brief в user «для контекста»; подмена systemPrompt стоковым pack при живом mesh prompt; mock «успех» в Create.

## Agent-start / handoff bundle (**C-carousel-***)

При **старте агента** (вход после handoff / первая генерация шага) — отдельно от C-155 user turns — собрать в system/context (спека Архитектора):

| Часть | Источник |
|-------|----------|
| Request | Задача шага / handoff brief («что рисовать» для Designer) |
| Context | История диалога + артефакты предыдущего шага (**для Designer: полный carousel JSON**) |
| Rules | mesh/Team rules для `(agent, contentType)` + Vernatun tone / no hardcode N |
| Skills | bound/uploaded skill packs + `carousel-json-contract` / worker packs |
| Plugins | bound plugins |
| MCP | bindings summary (website/tools) — **имена** env keys, не секреты |

**Scriptwriter agent-start:** system instructions must lock Dramaturgy JSON schema, `requested_slide_count` from user only, swipe_trigger, cover ≤6–8 words, caption/hashtags/alt_text — см. `workers/script-writer/SKILL.md`.  
**S50 Scriptwriter bar:** captivating cover/hook (not flat label); swipe_trigger = **meta only**; CTA catalog **1–4** on `cta_slide`; Vernatun tone; if Razbor insights present — **must** use them (no ignore). Weak/generic infobiz water = patch prompt + retest.

**Designer agent-start / draw:** после handoff — ack → descriptive plan → только по **«Нарисовать»** **Diffusion Visual Engine**: per-slide image prompt = JSON copy (`headline`/`body`/CTA) + `visual_prompt` + **approx** brandbook colors → `openai/gpt-5.4-image-2` paints **full** slide (scene **+ typography**) → export `slide_01.png`…. **KILL** HTML/Playwright text overlay as primary. Response artifact **must** include image URLs/paths length-matched to `slides[]`.  
**S50→S53 Designer bar:** expensive IG carousels; integrated type on image; `visual_prompt` specific (materials, light, type hierarchy) — ban purple-slop / stock Inter / empty black frames / «bg-only then HTML text» as success; brandbook tokens **applied** as color hints, not ignored.  
**Razbor «Добавить новый дизайн» / deconstruct:** image → **3:5 brandbook cards** (+ tokens), не orphan MD dump under UI.  
**S50 Razbor bar:** live Haiku only; trainer tasks = **concrete** Scriptwriter+Designer patches (hooks, CTA #, visual motifs) — ban empty «улучши контент».  
Секреты `AGGREGATOR_API_KEY` / `CAROUSEL_API_KEY` не логировать.

## Marketing Director chat — tools + prompt (**S47**)

| Шаг | Действие |
|-----|----------|
| 1 | Прочитать `marketing-director-prompt.md` |
| 2 | Зарегистрировать agent defaults / mesh-or-standalone systemPrompt |
| 3 | Wire tool schemas → Backend GraphQL + search proxies |
| 4 | Smoke: user raw → Haiku (+ thinking) → tool_call or text; no mock-only |

`🤖 **AI BRIDGE:** [промпты/tools/retrieval; как проверить]`
