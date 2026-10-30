# C-152 — PIPELINE_COPY audit matrix

Source: `lib/mesh/agent-defaults.ts` after C-151/C-152 (AI Bridge).  
Shared Scout / Analyst / Trainer / Publisher scaffold is OK; table covers **release pair** only.

| pipelineId | ModuleName | Copywriter name / role | Designer name / role | Prompt / skills distinct? | Notes |
|------------|------------|------------------------|----------------------|---------------------------|-------|
| `carousel-engine` | Карусели Instagram (4:5) | Копирайтер каруселей / `Копирайтер · …` | Дизайнер карусели / Дизайн / сборка | Yes | Slides 4:5 + `design.md`; `promptForDesigner` |
| `aesthetic-graphics` | Полезные картинки & Инфографика | Копирайтер графики | Дизайнер графики / Дизайн / сборка | Yes | Single graphic — not carousel pack |
| `cartoon-reels` | Мульт-Reels (2D) | Копирайтер мульт-рилсов | Дизайнер 2D / Дизайн / сборка | Yes | 2D beats — not live montage |
| `heygen-reels` | HeyGen AI-Аватар | Копирайтер HeyGen | Рендер HeyGen / Дизайн / сборка | Yes | Spoken avatar — not CapCut cut/join |
| `site-articles` | Статьи на сайт | Копирайтер сайта | Редактор сайта / Редакция / SEO-сборка | Yes | SEO article — not TG clone |
| `tg-articles` | Статьи в TG | Копирайтер TG | Редактор TG / Редакция / пост TG | Yes | TG hook — not site SEO |
| `custom-reels` | Рилс | **Сценарист** / **Сценарист · Рилс** | **Монтажёр рилсов** / **Монтаж рилса** | Yes (C-151) | Raw shots: cut/join/subs/inserts/effects/gen-inserts; no `design.md` lock |
| `custom-clips-to-reels` | Нарезки с видео в рилсы | Копирайтер нарезки | Монтажёр нарезки / Монтаж нарезки | Yes | Long-form clip detect — ≠ full custom-reels script |
| `custom-info-video` | Информационное видео | Копирайтер инфо-видео | Дизайнер инфо-видео / Сборка инфо-видео | Yes | Thesis/VO 45–90с — ≠ 15s Recs hook |

## Fixes applied this pass

1. **C-151** `custom-reels`: names Сценарист / Монтажёр рилсов; roles `Сценарист · Рилс` / `Монтаж рилса` (was `Копирайтер · Рилс` + `Дизайн / сборка`).
2. **C-151** montage prompt explicitly requires raw shot videos + cut/join/burn-in/inserts/effects/gen inserts.
3. **C-152** thin/overlapping prompts (graphics, cartoon, heygen, site, tg, clips, info-video) rewritten so no copy-paste of carousel wording onto video modules.
4. `designerUsesDesignMd` only for carousel + aesthetic-graphics; montage pipelines omit the «ВАЖНО: design.md» system suffix (custom-reels prompt may mention design.md only as a **запрет**).

## Checklist

- [x] No identical `copywriterPrompt` / `designerPrompt` strings across module families
- [x] `custom-reels` designer role ≠ «Дизайн / сборка»
- [x] `custom-clips-to-reels` designer role ≠ «Дизайн / сборка»
