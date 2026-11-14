# Повторяемый офлайн-бейк карусели

Работает внутри существующего carousel pipeline; не новый веб-продукт и не замена compositor в веб/lib/studio/. Основной порядок: [OPERATOR-RUNBOOK.md](../OPERATOR-RUNBOOK.md).

## Файлы

- contract.py + validate.py — входы, SHA256, 3×3 строки, геометрия, margins 54/54, B/W arrows; без браузера/LLM.
- preview.py — порт реально проверенного Cairo/Pango-композитора; job JSON вместо путей старого чата. Генерирует редактируемые HTML и маркированные preview PNG.
- canonical.py — проверка и экспорт этих HTML через Playwright Chromium. Ошибка не включает автоматический fallback и не оставляет успешный отчёт от прошлого запуска.
- case-v3.json — исторический replay-fixture с 15 фразами, координатами и хешами 11 входов. Не production-ID/brief. Для новой карусели создать новый JSON по своему брифу; не исправлять исторический fixture.
- test_contract.py — негативные guards.

## Входы и зависимости

Git не содержит PNG/ZIP/font копий. Для точного воспроизведения владелец имеет пакет `vernatun-type1-step4-v3.zip` (точное имя в case-v3.json; Library ID указан там). Развернуть архив и передать его assets/ как --asset-root. Для новой работы собрать собственный assets/ и записать фактические SHA256. Не отключать проверку хешей ради запуска. Никогда не переносить секреты или временные private URLs в Git.

Нужны Python 3.10+, Pillow; для preview — системные Cairo/Fontconfig/Pango, PyGObject и pycairo. Проверенный здесь системный /usr/bin/python3 имеет эти зависимости; обычный runtime Python может их не иметь. Для canonical — Python Playwright + Chromium и Pillow в одном окружении. Установка зависимостей/браузера не выполняется этими скриптами. WOFF2 Armenian в репозитории можно декодировать fontTools+Brotli; fixture использует уже сохранённый NotoSansArmenian.ttf. Исходники шрифтов: shared/brand/fonts/ и веб/public/fonts/noto-sans-armenian.woff2.

## Команды из корня репозитория

```bash
python3 -m unittest discover -s shared/pipelines/carousel/bake -p 'test_*.py' -v
python3 shared/pipelines/carousel/bake/validate.py --job shared/pipelines/carousel/bake/case-v3.json --asset-root /path/to/package/assets
/usr/bin/python3 shared/pipelines/carousel/bake/preview.py --job shared/pipelines/carousel/bake/case-v3.json --asset-root /path/to/package/assets --output /path/to/build
python3 shared/pipelines/carousel/bake/canonical.py --build /path/to/build --chromium /path/to/chromium
```

`preview.py` всегда PREVIEW_ONLY. `canonical.py` возвращает 0 только при TECHNICAL_PASS_PENDING_VISUAL_QA; 2 при BLOCKED_OR_FAILED. Это не арт-приёмка и не редакторский апрув. Если браузер не работает — не заменять статус на ACCEPTED. В текущей среде проверен именно корректный BLOCKED при запрете socket(); успешный canonical прогон здесь не подтверждён.

Технические проверки Chromium: загрузка fonts/images, DOM bounds, число cards/lines/arrows, logo 54/54, PNG 1080×1350; никаких внешних HTTP-запросов. HTML-макеты требуют отдельной визуальной проверки после canonical render: Cairo и Chromium могут по-разному раскладывать строки, поэтому совпадение между ними не утверждается.

## Детерминизм и артефакты

preview проверен на том же окружении и входах: все семь PNG и contact sheet совпали побайтно со сборкой до переноса. Это не обещание побайтной идентичности между разными ОС/версиями Cairo/Pango/Chromium. Сохранять versions, inputs/hashes, actual font weights/sizes, local contrast scores, rectangles и output hashes. После любого исправления повторять затронутые guards и просмотр full-size/360 px.

Формальная геометрия не умеет распознавать лицо, красоту, язык и смысл. Проверять руками/доступной vision-ролью по этапу 5; указывать фактический механизм, не выдумывать независимых агентов. Текущий fixture имеет известное расхождение primary font SHA256 со старым vernatun-fonts.json; это отмечено в отчёте и не является разрешением молча менять брендовый asset.
