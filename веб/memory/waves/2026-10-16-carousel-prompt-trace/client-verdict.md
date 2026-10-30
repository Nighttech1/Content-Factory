# 🧑‍💼 CLIENT — вердикт волны carousel-prompt-trace

**Date:** 2026-10-16  
**Scope:** MD session logs `docs/карусель тест/` + spot-check PNG `generatedMedia/wave-carousel-prompt-trace/{a,b}/` vs `generatedMedia/эталон карусели/`  
**Hard gate note:** это приёмка **артефактов prompt-trace** (не live Studio UI). Playwright Studio @1440 здесь не применялся — вердикт про цепочку Scriptwriter → Image → HTML.

---

## Вердикт

**ПРИНЯТО С ЗАМЕЧАНИЯМИ** (как debug-волна: JSON + 6 PNG + exact prompts в MD есть)  
**Primary weak link: Image prompt** (сборка промпта к image-2), не Scriptwriter JSON и не «отсутствие HTML».

Командный README / `weak-link-verdict.md` («Primary: none / PASS») — **не согласен**. После глаз на PNG слабое звено видно.

---

## Haiku fallback (обязательно зафиксировать)

Оба Scriptwriter-рана: **`anthropic/claude-haiku-4.5`**, не Sonnet.

| Источник | Доказательство |
|----------|----------------|
| `01-scriptwriter-hy-letters.md` шапка | `Model: anthropic/claude-haiku-4.5` |
| `02-scriptwriter-hy-sevan.md` шапка | то же |
| `docs/карусель тест/README.md` §«Вердикт волны» | Sonnet `claude-3.7-sonnet` degraded → Haiku |

Craft по checklist §6 прошёл, но это **не Sonnet-only evidence**. Повтор с здоровым Sonnet — если нужен канон качества сценариста.

---

## Слои

| Layer | Verdict | Почему |
|-------|---------|--------|
| **Scriptwriter JSON** | PASS (с оговоркой Haiku) | Hooks curiosity gap; CTA 1–4; META swipe; topic=user; visual_prompt concrete. См. `01`/`02` §6 checklist. Оговорка: «Буква дышит?» буквально из PASS-примеров system (§2 Rules / VIRAL CRAFT) — Haiku мог **пересказать few-shot**, а не изобрести свежий hook. |
| **Image prompt** | **FAIL / PRIMARY** | См. ниже. |
| **HTML overlay** | WEAK / secondary | Текст читается, swipe не красят — OK. Но empty gold pill (a/03), плоский sans vs etalon marker hierarchy, CTA дублируется в body+button. |

---

## Primary: Image prompt — где умерло

Открыть: **`03-designer-hy-letters.md` §3** и **`04-designer-hy-sevan.md` §3** (exact prompts).

### 1) Конфликт «нарисуй букву» ↔ «никаких букв»

- Scriptwriter `visual_prompt` (handoff §6 в `01`): *single Armenian letter (Ա)*, *hand-drawn Armenian script*.
- Exact image prompt (Designer §3): **«ABSOLUTELY NO readable text, letters…»** + тот же visual brief с буквой.

**PNG a/slide_01:** большая светящаяся **кириллическая «Ц»**, не армянская **Ա**. Модель выбрала «безопасную» букву под запрет readable letters / не дотянула Armenian glyph.

### 2) Preset lock `dark_notes` поверх `dark_editorial` / lake

- Handoff letters: `promptForDesigner` / kit = **dark_editorial**.
- Handoff sevan: lake editorial, cool-warm, без халкборда.
- Exact prompts: каждый slide начинается с полного **DesignPresetFile preset=dark_notes** (chalk, yellow marker, coffee steam doodles, checklist…).

Итог на PNG:
- **a/02** — сильный метафорический кадр (буква-дом), но kit = chalk + washi tape, не чистый editorial.
- **a/03** — doodle-город + **чашка кофе** (topic pollution из dark_notes few-shot kit) при теме алфавита/диаспоры.
- **b/01–02** — фото Севана сильные; **b/03** — фото церкви/озера + chalk arrows / washi / empty yellow block — **два языка дизайна сразу**.

### 3) CTA chrome в image+HTML

- **a/slide_03:** рядом с кнопкой «Подписывайся» — **пустая золотая pill** (артефакт layout/image).
- Дубль CTA-copy: secondary уже говорит «Подписывайся…» / «Напиши в комментариях…», HTML снова рисует ту же кнопку.

---

## HTML overlay — secondary

Открыть: `03`/`04` **§4 Post-process**.

| Check | Result |
|-------|--------|
| `swipe_trigger` painted? | no — OK |
| primary/secondary читаются | OK на всех 6 |
| Safe-zone / contrast | в основном OK |
| Craft vs etalon | HTML = plain white bottom-left sans; etalon `A-dark_notes` / `A-audit_html` = marker title blocks, checklist, structured hierarchy |

HTML **не** главная смерть контента, но **не дотягивает etalon kit craft**.

---

## Сравнение с эталоном

Папка: `generatedMedia/эталон карусели/` (README: A-dark_notes, A-audit_html, B-bento_glass, C-audit_poster).

| Эталон | vs trace PNG |
|--------|----------------|
| `A-dark_notes` / `A-audit_html` | Чёткий HTML-first chalk kit, жёлтый title block, иконки/стрелки как система. Trace a/* — cinematic AI scene + тонкий текст снизу; density kit ниже. |
| `C-audit_poster` | Структурированные cards + CTA. Trace — photo collage, не poster system. |
| Фото-качество b/* | По «красивости озера» часто выше chalk-эталона; по **брендовой системе Vernatun (marker/bridges/type)** — ниже и грязнее на CTA (b/03). |

Тема эталона (кофе) = style craft only — это учтено. Сравнивался **язык дизайна**, не сюжет.

---

## PNG spot-check (6/6)

| PNG | Заметка |
|-----|---------|
| `a/slide_01.png` | Hook OK; буква = **Ц** не Ա; HTML снизу читается |
| `a/slide_02.png` | Сильная метафора «дом из букв»; overlay OK |
| `a/slide_03.png` | Empty gold pill; coffee doodle; CTA duplicate |
| `b/slide_01.png` | Сильный lake cover; HTML clean |
| `b/slide_02.png` | Water texture + amber rim — image OK; copy OK |
| `b/slide_03.png` | Photo + chalk doodles + washi + cut pomegranate — kit clash |

Budget: `_png_budget.json` count=6 — OK.

---

## Что открыть руками (точные секции)

1. `docs/карусель тест/README.md` — индекс + командный PASS (оспорить).  
2. `01-scriptwriter-hy-letters.md` — шапка Model=Haiku; **§4 reply** + **§6 Final JSON** + checklist.  
3. `02-scriptwriter-hy-sevan.md` — то же для Севана.  
4. `03-designer-hy-letters.md` **§3 slide_01…03** — conflict no-letters vs Ա; dark_notes dump.  
5. `04-designer-hy-sevan.md` **§3** — lake brief внутри dark_notes shell.  
6. PNG: `generatedMedia/wave-carousel-prompt-trace/a|b/slide_0*.png`.  
7. Рядом: `generatedMedia/эталон карусели/A-dark_notes/` + `A-audit_html/`.

---

## Next (для Оркестратора, не код от Клиента)

1. Починить **сборку image prompt**: не форсить полный dark_notes markdown, когда handoff = dark_editorial / scenic lake; разрешить glyph-якорь (Ա) как illustration, не «readable UI text».  
2. HTML CTA: одна кнопка, без empty sibling pill; не дублировать catalog phrase в secondary+button.  
3. Опционально: re-run Scriptwriter на Sonnet для fair craft evidence.  
4. Не закрывать Image-слой как PASS, пока a/01 буква и a/03 pill/coffee не исправлены на новых PNG.
