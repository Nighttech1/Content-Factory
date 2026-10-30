# Architect Spec — 2026-10-18 phase2-vision-prompt

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** `2026-10-18-phase2-vision-prompt`  
**Цель:** Чистый IMAGE-LLM промпт (etalon SoT); `html_layout.logo.textColor`; logo quality **Path A**; 0 Manrope/scale на vision_ref; smoke + reports  
**Trainer:** `memory/trainer/2026-10-18-phase2-vision-prompt-grade.md` (C→B)  
**Canon:** `plugins/trainer/phase2-vision-prompt-logo.md`  
**IMAGE SoT draft:** `IMAGE-PROMPT-AUDIT.md` (user-reviewed canon → код)  
**ticket_limit:** `full-queue`  
**shell_freeze:** `true`  
**upgrade_only:** `true`  
**Phase 3 Pixar:** **OUT** (hygiene soften only)

**Chain:** `memory/waves/2026-10-18-phase2-vision-prompt/chain.md`

---

## 1. Зачем (простым языком)

Сейчас в модель картинок уезжает «всегда оранжевый/белый фон + один 3D-домик», хотя эталон уже прикреплён. Шрифты Manrope/таблица размеров иногда ещё просачиваются. Логотип — мыльная PNG-надпись, цвет которой HTML не может поменять. Фаза 2 чистит промпт, даёт цвет текста логотипа из JSON и рисует эмблему + HTML-слово.

---

## 2. Logo quality — **Path A** (LOCKED)

| Choice | Decision |
|--------|----------|
| **A (product)** | Emblem PNG `public/brand/vernatun-emblem.png` + **HTML wordmark** (`.brand-name`) colored by `logo.textColor` |
| B (fallback) | Wordmark `<img>` only — keep asset; use only if emblem missing |

**Why A:** User wants HTML-controllable text color; emblem stays crisp; no baked letters color lock.

| Param | Value |
|-------|-------|
| Emblem display | `BRAND_LOGO_SIZE_PX` → **200** (was 176; less tiny fringe) |
| Matte | Emblem already alpha; **no** aggressive ≤28 black crush on emblem path |
| Wordmark CSS | `.brand-name { color: logo.textColor }` (+ mild text-shadow) |
| Contrast fallback | If LLM omits color: white on dark plate / near-black on light — from local bg heuristic |

---

## 3. HARD locks

| # | Lock | Acceptance |
|---|------|------------|
| 1 | `image_prompt_canon` | `buildVisionRefBackgroundImagePrompt` = IMAGE-PROMPT-AUDIT clean text; **no** `#FF5A1F` / `idx%2` / Photoreal-CGI / house-object lock |
| 2 | `sanitize_keep` | `sanitizeBackgroundImagePrompt` + NO TEXT / NO LOGO HARD ban **KEEP** |
| 3 | `logoTextColor` | Zod `html_layout.logo.textColor` (#RRGGBB); aliases `logoTextColor` / `logo.text_color`; Designer asks LLM; composite applies to HTML wordmark |
| 4 | `logo_path_a` | Emblem + HTML wordmark on vision_ref / layered composite when brand chrome present |
| 5 | `stock_fonts_ban` | vision_ref: **0** Manrope / Cormorant / `typography.scale` / FULL TOKEN in Designer dump; composite **must not** inject Manrope `@font-face` / preset scale |
| 6 | `review_artifact` | Clean prompt dump in wave folder **before/with** land (`CLEAN-IMAGE-PROMPT.md`) |
| 7 | `phase3_out` | No Pixar product lock; conductor hygiene = soft «match etalon drawing language» |
| 8 | `smoke` | Artifacts under `docs/карусель тест/phase2-vision-prompt-smoke/` + wave reports |

---

## 4. IMAGE prompt contract (SoT)

Full text: `CLEAN-IMAGE-PROMPT.md` (= audit § «ИТОГОВЫЙ ПРОМПТ»).

Placeholders:

| Token | Source |
|-------|--------|
| `{{VISUAL_SUBJECT}}` | Short subject ≤120 from `visual_prompt` / primary — **not** full lifestyle kitchen dump |
| `{{N}}` / `{{TOTAL}}` | slide index |
| `{{CONDUCTOR_BLOCK}}` | `in_image` + cover/cta → soft conductor line; else omit / no character |

---

## 5. Schema

```ts
html_layout.logo = {
  placement: "top-left" | "bottom-left" | …,
  textColor?: "#RRGGBB"  // REQUIRED on vision_ref when brand chrome ≠ none
}
// aliases: logoTextColor, logo.text_color
```

Normalize in `normalizeHtmlLayoutRaw`.

---

## 6. Surfaces

| Path | Role | Change |
|------|------|--------|
| `lib/studio/create-carousel-prompts.ts` | AI Bridge | Rewrite `buildVisionRefBackgroundImagePrompt`; Designer vision_ref: emit `logo.textColor`; soft conductor |
| `lib/studio/carousel-json-contract.ts` | Backend | Zod + normalize aliases |
| `lib/studio/carousel-layered-composite.ts` | Backend | Path A brand HTML; apply textColor; size 200; skip stock Manrope face when vision_ref |
| `lib/studio/carousel-html-renderer.ts` | Backend | vision_ref: scrub Manrope `@font-face`; soft conductorDesc; prefer emblem resolve |
| `lib/settings/brand-store.ts` | Backend | Prefer emblem default **or** dual resolve (emblem for img, name from brandName) |
| Smoke / reports | Tester+Deploy | `phase2-vision-prompt-smoke/` + `ai-bridge-report.md` + `backend-report.md` |

---

## 7. Non-goals

- Phase 3 character Pixar product / sheet remake  
- VPS / publish / DB wipe  
- AppShell redesign  
- Re-inject FULL DESIGN TOKEN on vision_ref  

---

## 8. Done when

1. Clean IMAGE prompt in code matches `CLEAN-IMAGE-PROMPT.md`  
2. `logo.textColor` in schema + composite CSS on wordmark  
3. Emblem + HTML wordmark visible on smoke slides  
4. Ban assert PASS (no Manrope/scale in Designer dump; no Manrope @font-face in vision_ref HTML)  
5. Smoke folder + reports written  
