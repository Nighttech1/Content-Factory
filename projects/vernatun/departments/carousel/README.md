# Отдел каруселей

> Актуальный порядок для carousel-чата: `shared/pipelines/carousel/OPERATOR-RUNBOOK.md` (решения владельца 2026-11-14). Он уточняет старые отступы, стрелки, нумерацию этапов и границы preview/production. Внутри порученного этапа исправлять и перепроверять автономно; не просить согласования каждой внутренней правки.

Код и команды запуска: `shared/pipelines/carousel/bake/README.md`. Тип 1: 3×3 строки на middle, канонический логотип с отступами 54/54, стрелки B/W. Шаг 5 после бейка — финальная арт-проверка + редактор + внутренняя дизайн-приёмка, без публикации.


## Гейт производства

ID + brief + references + approved script → Art Director prompt → generation with heroine → Art Director background acceptance → bake with extracted logo → Art Director final bake acceptance → QA/editor → explicit client approval.

Любой `REGENERATE` или `RETURN` останавливает следующую стадию.

## Классы

- **Привлечение:** AI-атмосфера и hook/final typography; точные блоки — HTML.
- **Полезная:** AI-фон и HTML-бейк.
- **Словарь:** AI-hook/final по утверждённому стилю; middle-слайды по 3 фразы и переводы в HTML-бейке.
- **Интерактивная:** motion HTML/CSS/SVG/JS без картинок.

## Жёсткое правило ассетов

Пример-картинка используется только для вырезки официального логотипа. Героиня всегда берётся из отдельного набора референсов и обязана быть в каждом сгенерированном фоне. Логотип добавляется на bake справа сверху; AI не генерирует логотип.

## Папка задания

`00-brief.md` → `10-script.md` → `20-art-direction/visual-system.md`, `background-prompts.md`, `bake-task.md` → `30-design-manifest.md` → `40-bake-manifest.md` → `50-art-qa.md` → `60-editor-verdict.md`.

## Обязательная проверка

Арт-директор дважды принимает работу: сначала фон/AI-art с героиней, затем итоговый bake с вырезанным логотипом и HTML-слоем.
