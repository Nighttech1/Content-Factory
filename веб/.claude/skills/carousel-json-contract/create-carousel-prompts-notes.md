# create-carousel-prompts — notes (Scriptwriter swipe + CTA)

Канон для AI Bridge при правке `lib/studio/create-carousel-prompts.ts` (и mesh Scriptwriter overlays).  
**Не** prod-код здесь — только правила инжекта в system/overlay.

## 1.1 `swipe_trigger` = meta engagement QA (HARD)

| Правило | Деталь |
|---------|--------|
| Meaning | Per-slide **описательное** «зачем листать дальше» — **engagement QA meta**, не copy кадра |
| Render | **НЕ** рисовать на слайде (ни в diffusion, ни в legacy HTML). Только headline / body / CTA on-slide |
| Required | На **каждом** слайде, включая cover; на `cta_slide` — «soft end / почему остановиться здесь» OK |
| FAIL | Подставить `swipe_trigger` в on-image text; пустой `swipe_trigger`; путать с `headline` |

Prompt wording (inject):

```text
swipe_trigger = META only (engagement QA): 1 short sentence why swipe to next.
NEVER use swipe_trigger as on-slide copy. On-slide text = headline + body only.
```

## 1.2 CTA catalog HARD (cta_slide)

User may write **CTA 1–4** (or «тип CTA: 2») in Create chat. Scriptwriter **must** apply that type on **`cta_slide`**.

| # | Intent (on-slide sense) | Action |
|---|-------------------------|--------|
| **1** | Вопрос зрителю | → напишите в комментариях |
| **2** | Хочешь ещё подобного? | → подписывайся |
| **3** | Живые встречи армянского разговорного клуба | → приглашение через TG-канал в шапке профиля |
| **4** | Понравился контент? | → лайк + сохранить |

JSON fields (Architect may lock exact zod names; **sense** fixed):

- `cta_type`: `1 | 2 | 3 | 4` (root **or** on `cta_slide`)
- `cta_slide.headline` / `body` = Vernatun phrasing of that catalog row (on-slide)
- If user **did not** pick a number — **ask** which CTA (1–4), do not invent silently as «готово»

Prompt wording (inject):

```text
CTA CATALOG (HARD) — when user names a number, apply ONLY that type on role=cta_slide:
1 question→comments | 2 more like this→subscribe | 3 live Armenian club meets→TG channel in profile header | 4 liked it→like+save
Set cta_type to that number. Do not invent a 5th CTA pattern.
```

## Designer overlay note (Phase4 E2E diffusion)

Designer prompts: ignore `swipe_trigger` for paint; **bake** `headline`/`body`/`cta_type` intent **into** the image-model prompt as readable on-image typography. Pass **approx** brandbook colors/tokens only (no layout markup). Safe-zone guidance in prompt (margins) still applies.

## S52 — Settings tokens only + themes

| Inject | Rule |
|--------|------|
| Design prefs → Designer | **ONLY** colors + typography + text-block + small-element tokens (+ preset id). **Never** button layout kits / COVER·BODY·CTA sliced prefs / markup grids |
| Topics | **No** hardcoded coffee/club-only Vernatun. Rotate **Armenian** theme pool for test/live gen |
| Draft edit (Razbor) | Existing draft context (JSON + slide URLs) into Create-parity agents; no «Начать разбор» gate |

## COMBAT brief CTA sync (audit P4)

When editing `COMBAT_USER_BRIEFS["carousel-engine"]` in `agent-defaults.ts`, CTA line **must** match this catalog 1–4.  
**Delete / replace** «бронь стола / запись в сторис» — that fights Create overlays and confuses Sonnet/Haiku.

## Agent-start dedupe (audit P5 / Phase1)

`agent-start-bundle.ts`: do **not** concatenate full CREATE_*_OVERLAY + full mesh systemPrompt + pack HARD block. Prefer:

1. One **paired invariants** block (N, hook, swipe meta, CTA 1–4, visual_prompt)
2. Short role overlay delta
3. **Full** few-shot JSON bodies (not fixture ids only)

## Phase4 wording in Designer overlay (HARD · supersedes Phase3)

Say (inject into Designer draw / `CREATE_CAROUSEL_DESIGNER_*`):

```text
E2E DIFFUSION (HARD) — image model paints EVERYTHING on the PNG:
- Inputs: Scriptwriter JSON (headline, body, CTA intent, visual_prompt) + approximate brandbook colors/tokens ONLY.
- Bake readable typography ON the image (integrated type, not blank areas for HTML).
- FORBIDDEN as primary: Playwright/HTML text overlay («pretty photo + base text layer»).
- swipe_trigger = never painted. Safe-zone: keep copy inside margins.
- Output: one 1080×1350 PNG per slide with scene + type + CTA chrome already in pixels.
```

Do not promise HTML/CSS-first. Panorama→slice OK only if Architect keeps it **and** each slice is still diffusion-painted.

## Phase5 — ANCHOR REF pipeline (HARD · bake-off 2026-10-17)

Inject into Designer draw when Architect selects `anchor_ref_pipeline` (OpenAI/GitHub reference-first craft). Still keep E2E DIFFUSION (type ON PNG).

```text
ANCHOR REF (HARD) — reference-first carousel paint:
- Step 1: Paint COVER first (full E2E diffusion: scene + typography + CTA on PNG).
- Step 2–N: Pass COVER PNG as the visual reference image into the image API.
- Match slide 1: palette, lighting, materials, typography treatment, camera/composition grammar.
- Only change: this slide's beat / headline / body / CTA intent (and scene detail that serves the beat).
- FORBIDDEN: invent a new art direction per slide; HTML/Playwright text overlay; leave text blank for HTML.
- swipe_trigger = never painted. Safe-zone margins still apply.
- Export paths MUST include pipeline label (S54 User HARD):
  `generatedMedia/карусель тест/bakeoff-20261017/pipeline=anchor_ref_pipeline/{theme}/slide_0N.png`
  (skills may still mention `compare-carousel-bakeoff` as historical alias — Client pack uses bakeoff-20261017)
```

**Contrast — `e2e_diffusion` one-shot:** each slide independent (no cover reference). Same E2E DIFFUSION quality bar; different folder label for Client **S54**.

Themes this bake-off: **Armenian LANGUAGE** related (rotate topics). Budget **9 PNG** (3×3). `shell_freeze` UI.

## Viral craft — Scriptwriter JSON must land (HARD · prompt-trace wave)

Flat JSON = FAIL even if schema-valid. Inject into `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` (upgrade_only; **do not** paste full block into paired invariants — D-sw-2 dedupe).

**Status (2026-10-16):** ✅ injected into `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` in `lib/studio/create-carousel-prompts.ts`.

```text
VIRAL CRAFT (HARD) — schema-valid alone is NOT success:
- Cover/hook = curiosity gap (paradox / question / forbidden gesture / unexpected club truth). FAIL flat: «5 советов», «О нашем клубе», «Добро пожаловать», «Лучший вечер».
- Each body_slide = ONE value beat (insight / proof / tension / ritual detail) — not label restating the topic.
- cta_slide = catalog 1–4 punch in Vernatun voice (not generic «подпишись»).
- visual_prompt every slide = concrete light/material/scene + kit hint (marker / glass / editorial). Empty or «красивый фон» = FAIL.
- TOPIC = user message only. Never default coffee/jazz/club ritual when user asked another topic.
- Primary reply = fenced STRICT JSON. Prose-only «готово» without JSON = FAIL.
```

Few-shots: embed **full** JSON bodies (Phase1) so Sonnet copies craft density, not fixture ids.

## Prompt-trace dump (Client debug)

When wave / env asks for weak-link diagnosis (`carousel-prompt-trace` skill):

| Artifact | Path |
|----------|------|
| Scriptwriter MD | `docs/карусель тест/NN-scriptwriter-<slug>.md` |
| Designer MD | `docs/карусель тест/NN-designer-<slug>.md` |
| Templates | `docs/карусель тест/_templates/` |

Each Scriptwriter log **must** include: user request · **full** system · **full** user · LLM reply · optional correction · final JSON to Designer.  
Each Designer log **must** include: handoff intake · rules/skills added · **EXACT** per-slide **image** prompts · post-process · PNG paths.  
**S57 dump:** image prompts = **scene only** (explicit NO text/logo); post-process = `renderMode: layered_html` + Puppeteer composite; HTML notes for type/CTA/brand/fonts/cut-outs.  
**FAIL dump (S57):** type-on-PNG as ship; letters/logos in bg prompts without ban; vision ON; missing HTML composite path.  
**Legacy S53 FAIL:** `image_llm: skipped` as type-on-PNG success — N/A when S57 layered is intentional.

Optional runtime: `CAROUSEL_PROMPT_TRACE=1` → same MD (Architect path). **No secrets.** Budget smoke **6 PNG** default; useful-smoke **12 PNG** (51/1/17 ×4). `shell_freeze` · `no_pipeline_break`.

## Phase 6 Correct — STRICT replace (answers locked · paint → Phase 7)

When implementing `docs/карусель тест/correct/` **intake/chrome**:

| Keep | Change |
|------|--------|
| CTA catalog **1–4** (§1.2) | Entry = Create **⊕** useful sheet; Brand + **Персонажи** + `hero` |
| `swipe_trigger` meta (§1.1) | Critic **supplements** zod |
| — | **Paint SUPERSEDED by Phase 7 / S57** — do not ship `correct_pipeline` type-on-PNG |

See `plugins/trainer/carousel-correct-pipeline.md` + Phase 6 → **Phase 7**.

## Phase 7 LAYERED HTML — inject (S57 · product)

AI Bridge / Backend must enforce:

```text
SCRIPTWRITER:
- visual_prompt = SCENE ONLY (light, materials, composition, mood). NEVER ask for letters/logos/watermarks on image.
- visual_prompt RICHNESS (HARD): ≥3 concrete scene elements (materials, light, depth, props). Cultural Armenian/Vernatun taste = OPTIONAL spice — NOT a mandatory checklist. FORBID laundry lists that force the same khachkar / apricot / pomegranate / carpet every post. Vary worlds by topic.
  FAIL: one vague sentence («красивый фон», «атмосфера клуба») OR every slide reuses the same motif checklist.
- headline/body = on-slide copy for HTML layer; swipe_trigger = META only.
- secondary_copy (HARD · 2026-10-18 layout-copy): **MUCH wider** than 3 short sentences. Body slides: **≥220 chars AND ≥5 clauses** (or ≥4 short paragraphs) — concrete value, example, micro-story, numbered beats, objection→answer. Cover/CTA may be shorter but still multi-beat. Prior soft bar ≥120 / 2–3× is **minimum floor only** — thin 1–3 sentence stubs = FAIL (critic + Art Director).
- Body slides: each needs a real value beat; secondary_copy carries the detail (not headline paraphrase).
- Auto requested_slide_count=7 when topic is «N ways/tips»; may bump.
- cta_type 1–4 → HTML button on cta_slide only.

DESIGNER / DRAW:
- Image model: rich visual_prompt + HARD BAN «no text, no letters, no logos, no watermarks» (prompt AND code).
- **Default path:** INJECT FULL active DESIGN.md / DesignPreset into system every draw (see § FULL DESIGN.md inject) — fonts, sizes, colors per text role. Use palette mood for bg (e.g. purple type → not black mud).
- **`styleCopyMode=vision_ref`:** see § VISION STYLE-COPY — **BAN** FULL TOKEN CARD / stock typography.scale; attach etalon as image reference; hard-copy composition from picture.
- html_layout = placement ONLY; type sizes start from DESIGN scale (reduce-only if copy won't fit — see § Font fit) **unless vision_ref** (then match etalon look).
- LAYOUT VARIETY (HARD · default invent path): across adjacent slides, rotate anchor x/y — NOT always top-left. On vision_ref: **yield to etalon rhythm**.
- Brand chrome: follow **layoutMap.logoChrome** when present; else role defaults (body bottom-left; cover+cta top-left) + logo-only wordmark; size 2×; on vision_ref **mirror etalon** only if wave allows.
- Slide number: **only if** layoutMap/etalon numbering present — own HTML slot, body tokens, pretty «N / M». Ref has no numbers → **omit**.
- When layoutMap present (legacy): **copy layout grammar**; invent only content + bg + CTA. Without layoutMap and not vision_ref: invent with variety.
- Персонажи: product default `character_paint=in_image`; `overlay_cutout` = legacy conductor OVER bg.
- Puppeteer localhost composite 1080×1350.
- OCR remake vision OFF. Art Director = Gemini multimodal AFTER ready (no remake).
- Single renderMode: layered_html (deprecate correct_pipeline / e2e_diffusion as product).
```

See `plugins/trainer/carousel-layered-html-pipeline.md` + `carousel-json-contract` Phase 7 + card `plugins/trainer/design-inject-logo-br.md` + `plugins/trainer/vision-style-copy.md`.

## VISION STYLE-COPY (HARD · wave 2026-10-18-vision-style-copy)

Primary experiment path. **Not** «fix layoutMap parser as only success».

```text
styleCopyMode=vision_ref
- Attach etalon slide PNG(s) as IMAGE REFERENCE to Designer describe + draw (reference-first API).
- HARD-COPY from the picture: composition, zones, hierarchy, logo chrome, CTA chrome, numbering presence/absence, photo inset vs full-bleed.
- Brand Vernatun separately: OUR headline / body / secondary_copy / CTA catalog 1–4 (+ optional Settings Brand logo). Content swap — do not invent style from stock tokens.
- character_paint product default = in_image (girl conductor in bg pixels). overlay_cutout = legacy OK, NOT default.
- BAN on this path: FULL DESIGN TOKEN CARD · stock Manrope/Cormorant · default typography.scale table · any inject that makes LLM «apply the spreadsheet».
- BAN: force full-bleed cover background when etalon shows partial/inset photo (orange RE / Luma / Omkopa).
- layoutMap: optional legacy parallel — MUST NOT be required for PASS of this wave.
- Variant A + S57 layered HTML KEEP (html_layout executed by composite).
- Refs: generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/
- Smoke keep: docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/ (6 slides)
```

Wire: Architect + AI Bridge + Backend — `referenceImageUrl` / draw multimodal args; skip `buildDesignTokensPayload` FULL table when mode = vision_ref (Brand text/CTA/logo channel still OK). Trace must log `styleCopyMode` + «FULL inject skipped».

## PHASE 2 — IMAGE prompt scrub + logoTextColor (HARD · 2026-10-18)

Card: `plugins/trainer/phase2-vision-prompt-logo.md`. Cycle until Client; `ticket_limit: full-queue`.

```text
IMAGE MODEL PROMPT (vision_ref):
- SoT = ATTACHED ETALON — copy composition / plate-vs-photo / object zone / empty space.
- Scrub EVERY line in buildVisionRefBackgroundImagePrompt + sanitizeBackgroundImagePrompt (+ HARD ban).
- Remove conflicting stock leftovers; do not force layout that fights the picture.
- BAN still: Manrope · Cormorant · typography.scale · FULL DESIGN TOKEN CARD on Designer path.
- Hygiene only (not Phase 3): soften forced «Pixar / 3D animated» conductor wording — match etalon.
- Process: AI Bridge dumps CLEAN final image prompt for USER REVIEW → then implement.

logoTextColor (html_layout):
- REQUIRED on vision_ref when brand chrome present: html_layout.logo.textColor (#RRGGBB).
- Aliases: logoTextColor, logo.text_color.
- LLM chooses contrast vs bg under logo (placement-aware + etalon).
- Composite applies: path A emblem PNG + HTML wordmark color OR path B wordmark img + contrast/tint.
- NEVER bake logo letters into image-model pixels.
```

## FULL DESIGN.md inject (HARD · wave 2026-10-18-design-inject)

Every Designer draw on the **default** (non–vision_ref) path must receive the **complete active DESIGN.md / DesignPreset token block** — not family names alone.

```text
FULL DESIGN TOKENS (HARD) — paste into Designer system every draw:
- typography per role: title / body / content / (optional brandName) — family + weight + size px + line-height + letter-spacing when present
- colors per role: title / body / content / accent / muted / slideNumber / CTA / brand chrome — hex/CSS vars from active preset
- Positive type scale: «Title = {N}px {family}; Body = {N}px {family}; Content = {N}px {family}; Slide number uses Body paragraph tokens.»
- Palette → bg mood: match scene lighting/materials to type colors (purple/lavender type → cool mist / dusk violet — not flat black mud).
- html_layout chooses template/anchor/highlights/scrim only — placement, not inventing a parallel type system.
```

**Remove** negative prompt fluff («do not assume 64px», «do not invent Instagram-huge type»). Replace with the **positive** full scale + colors above.  
Wire: `buildDesignTokensPayload` / `designPaletteJson` must **print full role table** (families + sizes + colors). Architect verifies Settings upload liked slide → deconstruct → these tokens land in DESIGN.md → same payload.

## Font fit — reduce-only (HARD)

```text
FONT FIT:
- Start at DESIGN.md scale for each role.
- Designer / composite may REDUCE font-size ONLY when copy overflows safe-zone after layout try.
- NEVER enlarge arbitrarily above DESIGN scale.
- Document any reduce in overlay notes / html_layout meta (e.g. fontFit: "body −2px for fit").
```

## Brand logo chrome + dual-path (HARD)

```text
LOGO PATHS:
- LLM text prompts: sanitized logoRef stub OK (no giant base64).
- Puppeteer composite: RAW Settings Brand logoRef → <img>. Name-only when logo exists = FAIL.

LOGO CHROME (HTML · logo-placement-v2 · 2026-10-18):
- Position: body = bottom-LEFT; COVER + LAST (cta) = TOP prefer top-left (Phase1 bottom-RIGHT superseded).
- Size: BRAND_LOGO_SIZE_PX = 2× prior (88→176); transparent PNG (strip black matte on install).
- Wordmark Vernatun: logo-only `<img>` — omit `.brand-name` / club-name text (Phase1 KEEP) **unless** Phase 2 path **A** (emblem + HTML wordmark with logoTextColor).
- brandChrome default in composite = role-aware (not global bottom-right).

LOGO TEXT COLOR (Phase 2 · 2026-10-18):
- Emit html_layout.logo.textColor for contrast; composite applies — see phase2-vision-prompt-logo.md.

HIGVEN-3 WAVE OVERRIDE (2026-10-18-pipeline-practice-higven-3):
- Brand DEFAULT = FULL vernatun-logo.png (wordmark baked in file).
- HTML <img> only — do NOT invent logo.textColor / HTML wordmark path A unless residual chrome needs contrast.
- No second Designer call after bg «only for logo color».
```

AI Bridge must not replace render `logoRef` with sanitize stub. Backend: dual-path raw `logoRef` → `<img>`; see `plugins/trainer/logo-placement-v2.md` + Phase 2 card.

## HIGVEN-3 PARALLEL PACK (HARD · wave 2026-10-18-pipeline-practice-higven-3)

Card: `plugins/trainer/pipeline-practice-higven-3.md`. Canon plan in wave folder.

```text
HIGVEN-3 PARALLEL DESIGNER PACK:
1. Scriptwriter = Haiku → exactly 3 slides (cover / body / cta). Wait HITL «Передать дизайнеру».
2. Designer GPT ONE response MUST include BOTH:
   - image_prompt[3] — scene bg only (S57: no letters/logos/watermarks on pixels)
   - html_layout[3] — anchors + type rhythm copied from active etalon 01 HIGVEN;
     logo.placement; CTA HTML button 1–4 on last slide only; characterPaint=none
3. After ONE reply: run GPT Image (bg) IN PARALLEL with renderer payload prep — do not serialize «layout after image» or «color after bg».
4. Settings Design: active pack = 01 HIGVEN; clear other etalons; 02 may remain inactive library.
5. Art Director after 3 PNG: approve | remarks — NO auto-remake.
6. Budget: ≤3 full carousel attempts then STOP.
FAIL: N≠3 · girl/character · auto-handoff · second Designer-only-for-logo-color · >3 attempts without stop.
```

## Slide number slot (HARD)

```text
SLIDE NUMBER:
- Separate HTML block with own slot (not fused into headline).
- Tokens = body paragraph: font-family / color / size from DESIGN body (or explicit slideNumber → body fallback).
- Pretty format «N / M» (zero-pad OK: 03 / 06).
```

## Layout variety (HARD)

```text
LAYOUT VARIETY:
- Across a carousel, adjacent slides MUST vary anchor.x / anchor.y (and templates).
- Forbidden: every slide top-left primary block.
- Prefer rotating among top|middle|bottom × left|center|right; body_split / quote_band / cta_bottom help rhythm.
```

## Deconstruct → DESIGN.md verify path (Architect + AI Bridge)

```text
Settings Design: upload liked slide / reel / image
  → deconstructStyle / POST design-deconstruct
  → DesignPresetFile + DESIGN.md (colors + fonts + sizes per role)
  → Embla activeId
  → buildDesignTokensPayload FULL inject on next Designer draw
```

Architect must name this path in `chain.md` and verify end-to-end (Tester guard OK). Frontend only if upload/deconstruct UI broken.

## LAYOUT MAP — 4-slide grid deconstruct (HARD · 2026-10-18 layout-copy)

```text
Settings Design: upload 4 reference slides (cover, mid, mid, CTA last)
  → deconstructStyle / design-deconstruct-grid
  → DESIGN.md + DesignPresetFile:
       colors + fonts + sizes
       + layoutMap { textAnchor per slide, numbering present|absent + style/slot,
                     logoChrome, ctaChrome, numberingGlobal, grammarNote }
  → Embla library slot (3 grids this wave: RE orange · luma coffee · omkopa teal)
  → Designer/composite: COPY layout grammar; invent content + bg + CTA only
```

**Numbering mirror:** if refs have no slide numbers → `numberingGlobal: "absent"` → composite **must not** render `N / M`.  
**Not** a human Settings layout markup editor (S52 keep) — vision-extracted map only.  
Refs folder: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`.  
Card: `plugins/trainer/layout-copy-dual-char.md`.

## DUAL CHARACTER PAINT (HARD)

```text
character_paint: in_image   ← PRODUCT DEFAULT (vision-style-copy wave + going forward)
  - visual_prompt MAY include Vernatun/character in scene with environment
  - HTML still owns type / logo / CTA
  - Smoke A keep: docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/ (6-slide)

character_paint: overlay_cutout  (conductor)  ← LEGACY OK, NOT product default
  - visual_prompt = scene WITHOUT character; NO baking person into bg
  - character sheet → HTML/Puppeteer cutout OVER bg
  - Conductor SPEAKS the text (paired with copy), not “standing in the photo story”
  - Historical smoke B: cutout path — do not set as factory default
```

## MUCH WIDER Scriptwriter (HARD · supersedes thin 2–3× bar for this wave)

```text
SCRIPTWRITER secondary_copy:
- FAIL: 1–3 short sentences / headline echo / ≤120 chars on body
- PASS body: ≥220 chars AND ≥5 clauses (or ≥4 short paragraphs)
- Include: concrete tip, micro-example, objection→answer, or numbered micro-beats
- headline stays ≤6–8 words; width lives in secondary_copy (+ body when used)
```

## Art Director Gemini inject (AI Bridge)

```text
ART DIRECTOR (after finals):
- Model: Gemini vision (ART_DIRECTOR_MODEL / gemini-flash|pro via aggregator).
- Critique pixels: virality + design craft + content completeness (not script-only).
- Thin ~2-sentence body slides → remarks P1.
- Missing brand logo image / name text beside wordmark / wrong role slot (not body-BL / cover·cta-TL) / size not 2× → remarks brand P0/P1.
- Type ignoring FULL DESIGN colors/sizes → remarks hierarchy/layout.
- All slides top-left / thin secondary_copy → remarks layout/content.
- NO remake / redraw instructions.
```

### Runtime wire (AI Bridge — target after Architect)

| Piece | Path (Architect names OK) |
|-------|---------------------------|
| Docs 02–03 / 05–06 | keep where useful; **04 vision unused** while OFF |
| Overlays | Scriptwriter scene-only + Designer layered HTML |
| Gate | `CAROUSEL_PIPELINE=layered_html` (or supersede `correct`) |
| Critic 05 | keep zod+critic |
| Vision | **disabled** |
| Draw | bg image → Puppeteer HTML composite → `renderMode: "layered_html"` |

**Backend call sketch (S57 product):**

```ts
let retry = 0;
let verdict = critiqueCarouselHandoff(swText, { allowRetryHint: true, retryCount: retry });
while (!verdict.ok && verdict.retryHint && retry < SCRIPTWRITER_CRITIC_MAX_RETRIES) {
  // re-prompt Scriptwriter with verdict.retryHint
  retry++;
  verdict = critiqueCarouselHandoff(nextText, { allowRetryHint: true, retryCount: retry });
}
// Product default:
// runCreateCarouselDraw(json, { pipeline: "layered_html", placeholders })
// per slide: buildLayeredBackgroundImagePrompt / assertBackgroundOnlyPrompt
// vision OFF; Puppeteer composite → renderMode: "layered_html"
// Legacy only: pipeline: "correct" (+ vision ≤2) — not ship default
```