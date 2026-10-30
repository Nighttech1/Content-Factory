# IMAGE LLM prompt — audit + cleaned draft (Phase 2)

## Что уезжает СЕЙЧАС (плохо / мешает)

Сборка: `buildVisionRefBackgroundImagePrompt` → `sanitizeBackgroundImagePrompt`  
+ **приложенный** эталон-слот PNG (`referenceImagePath`).

### Вредные / конфликтующие строки (по одной)

| # | Строка сейчас | Почему мешает |
|---|---------------|---------------|
| 1 | `MATCH … solid color plate + ONE isolated 3D/product OBJECT (like house)` | Жёстко навязывает RE-грамматику вместо «смотри на attached ref» |
| 2 | `SOLID bright orange (#FF5A1F)` / `SOLID clean white` по `idx % 2` | Стоковая палитра в image-промпте; игнор цвета эталона |
| 3 | `Photoreal/CGI single object` | Тянет стиль в фото/CGI, ломает рисовку эталона и персонажа |
| 4 | В хвост попадает сырой `visual_prompt` («Светлая кухня…») | Прямо бьётся с BAN kitchen — модель слушает оба |
| 5 | Длинное описание Ануш текстом без sheet-ref | Модель выдумывает Pixar (Phase 3), не копия листа |
| 6 | `Palette lock: orange #FF5A1F · white · black/gray` | Ещё один stock inject |
| 7 | Текст говорит `1080×1350`, API часто `1024×1280` | Расхождение размера |
| 8 | (Designer path отдельно) Manrope/scale в composite | Не image-промпт, но итоговый слайд «сток» — чистится Backend Phase 2 |

---

## ИТОГОВЫЙ ПРОМПТ → IMAGE LLM (черновик канона Phase 2)

**Вход:** текст ниже + **одна картинка-эталон** (слот cover/midA/midB/cta) как reference / edit image.  
**Выход:** только фон 4:5, без букв/лого.

```text
You are generating ONE Instagram carousel BACKGROUND plate (vertical 4:5).

ATTACHED IMAGE = STYLE + COMPOSITION source of truth (etalon slide for this slot).
HARD-COPY from the attached image:
- overall layout balance and empty vs filled zones
- how much of the frame is solid plate / color field vs photo or object
- object placement and scale (inset / partial / full-bleed ONLY if the etalon does that)
- lighting mood and material language of the etalon (do NOT invent a new design system)

OUR CONTENT (subject only — not layout):
- Topic object / scene subject: {{VISUAL_SUBJECT}}
- Slide {{N}} of {{TOTAL}}
{{CONDUCTOR_BLOCK}}

STRICT BANS (pixels):
- NO text, letters, numbers, captions, watermarks
- NO logos, brand marks, UI badges, buttons
- NO slideshow chrome

DO NOT:
- force a stock orange/white palette table
- force “always solid plate + one 3D house-like object” if the etalon shows otherwise
- force photoreal/CGI/Pixar restyle against the etalon’s drawing language
- expand the subject into a busy full-room lifestyle set unless the etalon is that set

Return a single background image that a human would recognize as the SAME layout grammar as the attached etalon, with our subject swapped in.
```

### Плейсхолдеры

| Token | Откуда |
|-------|--------|
| `{{VISUAL_SUBJECT}}` | Короткий subject из `visual_prompt` / primary (≤120 chars), **без** «светлая кухня на весь кадр» если эталон — object-on-plate |
| `{{N}}` / `{{TOTAL}}` | индекс слайда |
| `{{CONDUCTOR_BLOCK}}` | Если `in_image` и cover/cta: одна строка «optional conductor matching catalog identity — same drawing language as etalon, not 3D Pixar invent». Иначе: omit / «no character» |

### Reference (пример smoke)

```
referenceImagePath =
  generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/_slots/01-real-estate-orange-grid/cover.png
```

(для slide 2 → midA.png, …, slide 6 → cta.png)

---

## Logo text color (параллельный контракт Phase 2)

Сейчас слово Vernatun **внутри PNG** → цвет HTML-ом не меняется.  
Качество: PNG 1024×682 → CSS max **176px** + fringe после strip чёрного мата.

План продукта Phase 2:
- LLM/Designer в `html_layout` отдаёт `logo.textColor` (hex), зная placement + фон эталона
- Composite: emblem (circle) PNG crisp + HTML wordmark «VERNATUN» / «ARMENIAN CLUB» цветом из JSON  
  **или** CSS color on split layers
- Увеличить display size / `image-rendering` / без повторного агрессивного matte crush
