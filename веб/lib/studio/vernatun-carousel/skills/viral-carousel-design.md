# Vernatun — Viral Instagram Carousel Design Skill (Framework B)

**Назначение:** один стандарт на маски одной LLM.  
**MAKE** → сценарист/промптер (собирает).  
**CHECK** → арт-директор (принимает / возвращает).

**Цвета:** только hex из активного Design (`load_design_colors`).  
**Кадр:** цельный GPT Image слайд; лого = native reference (не HTML-слой).

---

## MAKE

### СМЫСЛ И ВИРАЛЬНОСТЬ (главное — до картинок)
1. **Тема из брифа = закон.** Карусель должна отвечать на тему конкретно, не «мотиватор ни о чём».  
2. **Обложка:** ≤4 слов в headline, но зритель за 1 с понимает *о чём* (не «Начни здесь и сейчас»). **Body на обложке обязателен** — уточнение темы / боль / обещание.  
3. **Mid-слайды:** каждый = один полезный шаг/факт/совет. Запрет пустых общих фраз.  
4. **Драматургия:** hook (конкретный) → развитие (польза) → CTA.  
5. **CTA:** тип из брифа/Sheet (`speaking_meetup` и др.) — финал зовёт на действие Vernatun.  
6. **Не выдумывай** законы, цифры, гарантии. На фото-props (блокнот, экран телефона) — **запрет** выдуманных %/ставок/балансов, если их нет в EXACT copy.  
6a. **Словарь HARD:** каждый слайд — ровно одно HY—RU в `supporting_copy`; слово **по теме слайда** (RU-смысл в body/headline). Headline/body/cta без армянского.  
6b. **Серия style (HARD):** блоки одного смысла (vocab chip) — **идентичный** дизайн (заливка/радиус/тип); цвет из Design MD; расположение свободно.  
6c. **Layout craft:** mid = **фото full-bleed** (запрет сплошного чёрного/белого). List/checklist rows — **только** если body реально перечисляет 2+ пункта; иначе poster typography без фейкового списка. Запрет `image_need=none`.  
6d. **Logo air:** тихий угол сцены без любой отметки зоны лого (без пунктира/рамок/точек).  
6e. **FACT_CHECK:** если флаг Sheet `facts=1` — AD вызывает Research + Fact-Checker; при `0`/пусто — не вызывать.

### Форма кадра
7. **Формат:** 1080×1350 (4:5).  
8. **Один слайд — одна идея.** Mid обязаны «листать дальше».  
9. **type_system:** один на серию (headline/body/cta).  
10. **Лого:** pixel-faithful эталон на КАЖДОМ слайде, ровно один раз.  
11. **Пагинация (all-or-none):** либо на **каждом** `k/N`, либо **ни на одном**. Mode B default = без счётчика.  
12. **User-фото:** preserve; must-use.  
13. **Фон = тезис**; не концерт/сцена без метафоры.  
14. **Design colors only.**

### CLIENT HARD RULES
- FINAL only; полуфабрикат не сдавать.  
- major/blocker → не FINAL.  
- Пустой смысл / штамп-обложка = blocker substance (не FINAL).  
- Logo drift / wrong pagination / missing CTA = major.  
- Cover ≤4 слов + понятная тема; CTA финала ясен.

---

## CHECK

### Смысл (до визуала — AD сценария)
- [ ] Обложка называет тему (не пустой мотиватор)  
- [ ] Body обложки поясняет «о чём»  
- [ ] Каждый mid-слайд даёт конкретную пользу  
- [ ] Нет «карусели ради карусели»  
- [ ] CTA финала = тип из брифа / Vernatun  
- [ ] На каждом слайде ровно 1 HY + перевод в supporting_copy, связано с тезисом слайда

### Слайд (визуал)
- [ ] Хук/иерархия  
- [ ] Контраст  
- [ ] Один месседж  
- [ ] Лого эталонное, один раз  
- [ ] User-фото узнаваемы (если были)

### Серия (визуал)
- [ ] Обложка ≤4 слов  
- [ ] type_system единый  
- [ ] Соседи не template_clone  
- [ ] Пагинация all-or-none  
- [ ] Заголовки без «кавычек» и без HY (если script RU)  
- [ ] CTA финала  
- [ ] can_finalize=false при любом major

**Лого (B5.4):** bake **всегда TOP-RIGHT**. Safe zone в пикселях: см. `logoSafeZonePromptBlock()` (~200×236, margin 28). Edge margin ≥48px.

**Финальная приёмка = ДВА слоя:**
1) **Программный layout-QA:** `logo_collision` / явный `edge_margin` → major. `guide_artifact` → major только при видимой рамке; микроточка у края = minor.  
2) **ИИ vision AD** — только дефекты невооружённым глазом; разный vocab chip → major.

**Logo collision / edge / явная orange guide frame** → major + regen.

**Wordmark contrast (PER SLIDE):** белое на бежевом → `wordmark dark`; тёмное на тёмном → `wordmark white`. Tint только текст ниже круга.

**Armenian (B4):** exact quoted HY; letter-by-letter spellout в image-prompt; AD сверяет превью со `script.json` → major `hy_spelling` → regen.

**Дефект (major/blocker):** logo_collision; edge_margin; guide_artifact; hy_spelling; logo drift; wordmark нечитаем; 2/6; concert; нет CTA; major без repair.
