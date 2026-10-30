# 🏗️ Архитектор — spec волны «Единая Sonnet-маска + vision→Бейк»

**Дата:** 2026-10-28 · **Профиль:** Content Factory (Next.js 15 / lib pipeline).
**Источник правды схемы:** запрос пользователя (см. грейд Тренера `memory/trainer/2026-10-28-grade-one-brain-vision-bake.md`).

## Эталон (целевая схема)
Одна LLM **Sonnet** с масками и ОБЩИМ контекстом (как Оркестратор в разработке):
1. `scriptwriter` → сценарий
2. `script-AD` → проверка/доводка сценария
3. → **GPT image 2.0** рисует только фоны (scene-only, S57)
4. `vision` → смотрит СГЕНЕРИРОВАННЫЙ кадр
5. `vision→layout` → выдаёт **Бейку** раскладку HTML (где заголовок/body/CTA/лого, цвет под фон) ПОД реальный кадр
6. `vision-final` → замечания **Бейку** по готовой карусели → Бейк правит HTML **без регенерации** картинок

## Текущее состояние (as-is, подтверждено по коду)
- Активный путь: `lib/intake/correct-pipeline-job.ts` → `runCreateCarouselDraw` (`carousel-html-renderer.ts`) → (product path) `draw-bridge.ts` → `runVernatunCarouselJob` (`vernatun-carousel/orchestrator.ts`).
- Единый мозг `JobLlmSession` (`job-llm-session.ts`) есть, общий транскрипт. База = `resolveTextOrchestratorModel()` = `gemini-3.8-flash`. Sonnet-свап только для `scriptwriter` + `artDirectorFinal` (`qa`/`imageGen` — свои).
- **Дубли:** correct-pipeline гонит свой `runScriptArtDirector` (Sonnet) + `runArtDirectorReview` (Sonnet) ПОВЕРХ джоба, у которого внутри свои `artDirectorScript` (gemini) + `runArtDirectorFinal` (Sonnet).
- Раскладка HTML = Designer (`designer-variant-a-pack.ts`, Sonnet-3.7) из ТЕКСТА, до картинки. Бейк = `renderByMode` (`renderer.ts`) + пиксель-бейки (logo/vocab/arrow).
- Vision (`artDirectorFinal`) только судит финал; findings → `applyRepairs` → при `MAX_REPAIR>0` **регенерит картинки** (orchestrator 919–939).

## Тикеты (≤3, фокус; P0→P1→P2)

### C-ONE-BRAIN-01 — P0 — одна Sonnet-голова + убрать дубли
- База `JobLlmSession` = **Sonnet** (env `CAROUSEL_MODEL_TEXT=anthropic/claude-sonnet-4`; `resolveTextOrchestratorModel` default оставить, но продуктовый прогон на Sonnet). Все текст-маски (`orchestrator`/`artDirectorScript`/`imagePlanner`/`designer`/`artDirectorFinal`) идут через ОДНУ сессию с общим транскриптом. `imageGen` = GPT image 2.0 (отдельно, не трогаем).
- **Консолидация дублей:** один `script-AD` (Sonnet, в джобе, с общим контекстом; correct-pipeline перестаёт делать ВТОРОЙ) и один `final-AD` (в джобе; correct-pipeline не вызывает `runArtDirectorReview` повторно — или наоборот, но строго ОДИН). CTA-флаг-гарантия (детерминированная) остаётся.
- Acceptance: `role-models.json` джоба показывает Sonnet у всех текст-масок; `session-transcript.json` содержит все маски одной сессии; в прогоне нет второго script-AD / второго final-AD.

### C-VISION-LAYOUT-02 — P1 — vision планирует раскладку Бейку из кадра
- Новая маска `vision_layout` (та же сессия/Sonnet, с картинкой): вход = сгенерированный фон (PNG) + тексты слайда; выход = раскладка для Бейка (анкеры заголовок/body/CTA/лого, цвет текста/плашек под фон, safe-zone). Вызов — ПОСЛЕ `prepareSlideImages`, ДО бейка текста в `renderByMode`.
- Designer-из-текста остаётся фолбэком (если vision-layout недоступен/нет ключа) — не стоп волны.
- Бейк (`renderer.ts`) принимает раскладку от vision_layout как источник позиций/цветов (вместо шаблонных по умолчанию).
- Acceptance: в дев-логе есть `vision_layout` на каждый слайд; позиции/цвет текста отличаются слайд-к-слайду под фон; safe-zone соблюдён; scene-only (буквы не в фоне).

### C-REMARKS-TO-BAKE-03 — P2 — замечания → ребейк без регена
- Финальные findings vision → **только дешёвый ребейк HTML** (пересдвиг/перекрас/safe-zone через тот же путь, что vision_layout), **без** `prepareSlideImages`.
- Запретить image-regen в петле для продуктового пути: ветку «re-generate flagged slides via GPT Image» (orchestrator 919–939) отключить/загейтить (`CAROUSEL_ALLOW_IMAGE_REGEN=1` только для спец-прогонов). Бюджет картинок = **1 ген/слайд**.
- Acceptance: прогон с замечаниями делает ребейк HTML, число вызовов image-gen = число слайдов (нет повторной генерации); гайд в тесте проверяет счётчик генераций.

## Границы / path-lock
- Трогаем: `lib/studio/vernatun-carousel/{orchestrator,job-llm-session,role-models,renderer,art-director-final}.ts`, `lib/studio/vernatun-carousel/prompts.ts` (новый vision_layout промпт), `lib/intake/correct-pipeline-job.ts` (убрать дубли), `.env` (CAROUSEL_MODEL_TEXT).
- НЕ трогаем: UI Create/Studio, Publicist/schedule, fact-check ветку, контент-правила сценариста, пиксель-геометрию бейков (меняем только источник позиций/цвета).
- Overlapping paths не параллелим: тикеты идут строго по порядку (01→02→03) — все в одной зоне оркестрации.

## chain
См. `chain.md`.
