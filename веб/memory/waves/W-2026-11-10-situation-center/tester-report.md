# Тестировщик — подготовка и независимые проверки

Дата: 10.11.2026, Москва. Роль из проектного реестра, отдельный субагент. Реальный browser QA ниже подтверждён после CI; независимый финальный вердикт остаётся за Клиентом.


## Актуальный итог после реального CI — PASS

Проверка: [GitHub Actions42704640983](https://github.com/Nighttech1/Content-Factory/actions/runs/42704640983), tested source `3ac253b6ad9ec307bc82dcde3fcc5465f01e7115`, evidence artifact `13712787361`, revision `situation-v2-20261110-01`. Тестировщик независимо прочитала скачанные `browser-report.json` и `nonempty-browser-report.json`: оба `status=passed`, `errors=[]`, каждый содержит четыре успешные ширины1440/390/412/360.

Основной прогон подтвердил все8 этапов,5 разделов,фильтры/сброс,раскрытые примеры,Plan/Fact isolation,tab recovery,keyboard,старый чат,24 задания и отсутствие overflow. Отдельная synthetic fixture подтвердила непустые графики,исторические переходы,period filters,tooltip provenance,посещаемость и строго одну synthetic публикацию. В её layout evidence `documentWidth=bodyWidth=viewportWidth`, `offending=[]` для всех четырёх ширин.

Дополнительно сверено: локальный canonical JSON **побайтно совпадает с tested source**; SHA256 `1d10feb7f1b5d6d9a60f44909fefa1304fc5704586df51be934a61f73f576f14`. В canonical нет `qa-only`, `qa-cohort`, `qa-isolated-not-production` или synthetic URLs; `meetings=[]`,все series.points пусты,подтверждённых публикаций0. Fixture не загрязнила общие данные. Production deploy в этой QA-волне не выполнялся; это не подтверждение появления /growth на VPS.

## Локальные проверки до CI

| Проверка | Результат |
|---|---|
| `node --import tsx memory/waves/W-2026-11-10-situation-center/tester-contract-boundaries.mjs` (cwd `веб`) | PASS, 11 независимых сценариев |
| `QA_FIXTURE_BUILD_ONLY=1 node --import tsx scripts/test-growth-center-browser-fixture.mjs` (cwd `веб`) | PASS: strict fixture validation и bundle настоящего компонента; браузер **не выполнялся** |
| `python plugins/frontend/anti_slop_scan.py components/growth-center` (cwd `веб`) | PASS |
| `python plugins/frontend/anti_slop_scan.py .` (cwd `веб`) | FAIL: единственное наследованное попадание `lib/studio/vernatun-carousel/mode-b-brand-chrome.ts:80`, pure #000; файл волной не изменён |
| `node --check` трёх browser scripts + independent boundary script | PASS |
| `git diff --check` | PASS на момент проверки |

11 boundary checks: 24 реальные задачи не раздуты идеями; все8 стадий имеют идеи, cold-stage humor/useful/series; legacy v2 без поля работает; неизвестные publication/job/date/person поля запрещены; неверные kind/status/stage/source и пустые тексты запрещены; duplicate IDs/stages запрещены; membership использует return; превышение базы отклоняется; unknown/estimate/mismatch не дают conversion; immature return блокирует current/history; пропавшая историческая база даёт gap.

## Реальный браузерный guard, подготовленный для CI

`/scripts/situation-center-browser-guards.mjs` вызывается двумя действующими QA-скриптами: `/scripts/growth-center-browser-qa.mjs` и `веб/scripts/test-growth-center-browser-fixture.mjs`.

На1440/390/412/360: пять ссылок по порядку и current state; все8 стадий, нужные потребность/барьер/идеи/CTA/метрика/источник; раскрываемые concrete examples; humor/useful/series/other filters; filter reset на смене стадии; фильтр идей не меняет задачи/24; stage selection из content/sources открывает detail; Fact скрывает proposed и Plan восстанавливает; keyboard activation; membership06 не side branch; отсутствие горизонтального переполнения. Сохранены прежние проверки реальных графиков/tooltip источника, synthetic1 публикации,24 V-ID, истории чата и отсутствия платных сетевых запросов.

Main QA сохраняет explicit passed/failed status и failure screenshot. Isolated fixture остаётся только в памяти и никогда не пишет в production dataset. Скриншоты/JSON не коммитятся в Git.

## Ограничения

Локальный Chromium launch root фактически попробовала, он заблокирован `socket() EPERM`; версия браузера сама по себе не является live PASS. Применимый браузерный gate фактически выполнен через QA-only GitHub Actions, как зафиксировано выше. Ни production deploy, ни платные API, ни внешние сообщения Тестировщик не выполняла. Независимая приёмка Клиентом с осмотром evidence остаётся отдельным этапом; этот отчёт не подменяет её.
