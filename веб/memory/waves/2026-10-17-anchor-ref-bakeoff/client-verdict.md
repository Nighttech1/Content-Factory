# Клиент — S54 bake-off verdict

**Дата:** 2026-10-17  
**Волна:** `2026-10-17-anchor-ref-bakeoff`  
**Папка compare:** `generatedMedia/карусель тест/bakeoff-20261017/`  
**README:** `generatedMedia/карусель тест/bakeoff-20261017/README.md`  
**Traces:** `docs/карусель тест/20–25-s54-*.md`

## Доказательство (HARD GATE)

| Шаг | Статус |
|-----|--------|
| Playwright MCP @1440 → `/studio` → Черновики `draft-s54-*` | **FAIL** — `localhost:3000` `ERR_CONNECTION_REFUSED` |
| Visual PNG side-by-side (image-compare style) | **OK** — все 24 PNG открыты Клиентом |
| Drafts в UI | не проверены (API/UI down) |

По исключению из запроса: при API down допускается visual PNG. Вердикт bake-off — **по PNG**. Повторный Playwright Черновики — когда localhost поднят.

## Arms

| Label | Path | Темы |
|-------|------|------|
| **etalon** (референс craft) | `pipeline=etalon/` | A-dark_notes · B-bento_glass · C-audit_poster |
| **e2e_diffusion** | `pipeline=e2e_diffusion/` | hy-letters · hy-sevan |
| **anchor_ref_pipeline** | `pipeline=anchor_ref_pipeline/` | mashtots-home · diaspora-kids · city-speech |

## Оценки 1–5

Шкала: **выше = лучше**. Колонка «близость к эталону» = насколько близко к expensive Instagram / etalon craft (5 = как эталон).

| Pipeline | Typography integration | Slide-to-slide continuity | Expensive feel | Readability | Близость к эталону |
|----------|------------------------|---------------------------|----------------|-------------|-------------------|
| **etalon** | 5 | 5 | 5 | 5 | 5 |
| **anchor_ref_pipeline** | 4 | **5** | **5** | **5** | **4** |
| **e2e_diffusion** | 4 | 3 | **5** | 4 | 3 |

### Кратко по критериям

**etalon** — канон: A = grid + marker/doodle + yellow badge system; B = glass/amber plate; C = poster blocks + HOOK chrome. Type *есть* композиция, не «текст поверх красивого фото». Continuity = общий chrome cover→N.

**anchor_ref_pipeline (WINNER среди generative)**  
- Continuity cover→02→03 реально держится: mashtots (стол/золотая Ա/уголь → буквы-комнаты → sketchbook CTA); diaspora (Ч/Б + золото + рука ребёнка + камень с буквами); city-speech (вывеска/улица → карта-голос → дверной звонок «сохрани голос»).  
- Expensive IG editorial: текстуры, chiaroscuro, gold accents, читаемая иерархия.  
- Type: сильный overlay (white/gold hierarchy), но ещё не эталонный «type-as-layout» (A/C).  
- Ближе к эталону как *серия*, не как отдельный постер.

**e2e_diffusion (runner-up)**  
- Отдельные кадры часто не хуже (hy-letters 01 золотая Ա; hy-sevan вода/золото — очень дорогой lifestyle).  
- Continuity слабее: hy-letters = три разных мира (буква+дым → картина Маштоца → статуя). hy-sevan лучше (вода/пауза locked), но в среднем arm = one-shot.  
- Дальше от эталонного *системного* craft (doodle/grid/poster kits).

## WINNER

**`pipeline=anchor_ref_pipeline`**

Ссылки:
- `generatedMedia/карусель тест/bakeoff-20261017/pipeline=anchor_ref_pipeline/mashtots-home/`
- `generatedMedia/карусель тест/bakeoff-20261017/pipeline=anchor_ref_pipeline/diaspora-kids/`
- `generatedMedia/карусель тест/bakeoff-20261017/pipeline=anchor_ref_pipeline/city-speech/`

**Runner-up:** `pipeline=e2e_diffusion`  
(особенно `hy-sevan/` — continuity + expensive; `hy-letters/` — сильные одиночные кадры, слабый world-lock)

**Etalon остаётся эталоном craft**, не участником «победы пайплайна»:  
`generatedMedia/карусель тест/bakeoff-20261017/pipeline=etalon/`

## Что ещё слабо у WINNER

1. Язык всё ещё cinematic photo/editorial, не A-dark_notes marker/grid и не C-audit_poster block kits.  
2. Типографика чаще «чистый UI-слой», не впечённая в материал (мел/бумага/значок как в эталоне A).  
3. Бренд Vernatun / логотипы плавают между слайдами и темами.  
4. city-speech slide_02 (инфографика-радар) чуть выбивается из photo-мира 01/03.  
5. Нет live-проверки Черновиков `draft-s54-a/b/c` в Studio (localhost down).

## Вердикт приёмки bake-off

**ПРИНЯТО С ЗАМЕЧАНИЯМИ** (выбор пайплайна по PNG).  
Не ship product UI. Повтор: Playwright @1440 + Черновики, когда API жив.

```
🧑‍💼 КЛИЕНТ — S54 BAKE-OFF
Вердикт: ПРИНЯТО С ЗАМЕЧАНИЯМИ (PNG compare; Playwright blocked)
WINNER: pipeline=anchor_ref_pipeline
Runner-up: pipeline=e2e_diffusion
```
