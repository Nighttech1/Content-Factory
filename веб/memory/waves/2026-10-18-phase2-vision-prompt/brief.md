# Wave brief — 2026-10-18-phase2-vision-prompt

**Дата:** 2026-10-18  
**Trainer grade:** `memory/trainer/2026-10-18-phase2-vision-prompt-grade.md` (**C→B**)  
**Canon card:** `plugins/trainer/phase2-vision-prompt-logo.md`  
**ticket_limit:** `full-queue`  
**shell_freeze:** AppShell / left nav — **true**  
**Cycle until:** Client report contains **«согласовано»** (`@promts` / CLIENT_ORCHESTRATOR_CYCLE)

## Резюме (простым языком)

Фаза 2: чистим текст, который уходит в **модель картинок** — убираем противоречия и «стоковые» указания, усиливаем «скопируй раскладку с прикреплённого эталона». В Designer-пути по-прежнему **нельзя** подсовывать таблицу шрифтов Manrope/scale. Отдельно: модель должна вернуть **цвет текста логотипа** (`logoTextColor`), чтобы HTML не сливался с фоном; плюс разобрать, почему лого мыльное/с каймой (лучше эмблема + текстовый wordmark или более чёткий крупный знак). Сначала показать пользователю **чистый финальный промпт**, потом внедрять. Фаза 3 (Pixar-персонаж) — не в этой волне.

## Locks (HARD)

1. **logoTextColor** — LLM → `html_layout.logo.textColor` (#RRGGBB); composite applies  
2. **Logo quality** — Architect выбирает **A** emblem PNG + HTML wordmark **или** **B** crisp wordmark img + color; fix fringe from matte ≤28 / 1024→176  
3. **IMAGE prompt scrub** — every line of `buildVisionRefBackgroundImagePrompt` + `sanitizeBackgroundImagePrompt`; etalon = SoT  
4. **Stock fonts BAN** — 0 Manrope / Cormorant / `typography.scale` / FULL TOKEN on vision_ref Designer dump  
5. **Review-before-implement** — clean prompt artifact in wave folder **before** code land  
6. **Out** — Phase 3 Pixar product (hygiene soften 3D-animated wording OK); VPS/publish/DB wipe  

## Proposed chain

```text
Trainer ✅
  → Architect (spec + chain.md)
  → AI Bridge (clean prompt for user review → scrub + logoTextColor contract)
  → Backend (schema + apply color + logo quality A|B)
  → Tester (guards)
  → smoke
  → Client (Playwright → «согласовано»; full-queue cycle)
```

## НЕ делать

- Phase 3 character Pixar product lock / remake character pipeline  
- Land prompt scrub without user-reviewed clean dump  
- Re-inject FULL DESIGN TOKEN / Manrope scale on vision_ref  
- Bake logo letters into image-model background  
- paid MCP / AppShell redesign  
