# AI Bridge — протокол owner-chat updates

Дата: 09.11.2026. Spec: `architect-spec.md`; chain: `chain.md`. Выполнено по отдельному заданию root, только документация. Runtime prompt, модель, chat.ts и API не менялись; LLM/внешние API не вызывались. Этот документ не является реализацией чатового write tool.

## Контракт владельческого входа

Принимать обезличенный агрегат с сущностью (meeting ID/date, stage/metric ID либо V-ID), периодом/когортой там, где нужна совместимость, единицей, значением или явным unknown, source и observedAt. Оценки маркировать `owner_estimate`, цели — отдельным target; прямое слово «факт» не отменяет проверки единиц/источника/периода. Для показателя оплаты намерение/выбор пакета не считать покупкой.

Публикационный статус `published` допустим только вместе с валидными http(s) permalink, publishedAt и sourceId. «Готов», «апрув», «поставил в расписание» не интерпретировать как опубликованный. Не присваивать неизвестным значениям 0, не переносить максимум посещений на конкретную встречу, не использовать подписчиков как уникальный cohort reach. Не принимать PII/контакты/секреты или массивы участников в canonical dataset. Отменённая встреча — статус, не нулевой замер.

## Pipeline изменения

`owner input → read canonical version/revision → evidence/units/cohort check → minimal edit → strict validation → Git revision → QA/build → authorized release → deployed revision + route/API verification`.

Канон: `веб/data/growth/vernatun.json`, `version:2`, shared bundled dataset. Server loader и `GET /api/growth-center` читают этот же источник; write API в scope отсутствует. Изменение bundled JSON не является runtime-sync: новая версия видна всем после успешной сборки/release и обновления страницы. Legacy browser-local v1 snapshots `/marketing` не перезаписываются и не мигрируют автоматически.

Проверки согласно Backend-контракту: allowlist и referential integrity; уникальные IDs; действительные и не будущие календарные даты относительно updatedAt; published proof; null/zero; совместимые cohort/denominator; return maturity; уникальный подсчёт V-ID при multi-stage mapping. Использовать фактические команды текущей реализации (`scripts/test-growth-center.ts`, типизацию/build и UI smoke); не считать перечисление checks успешным прогоном. Если валидация не пройдена, сохранить прежний исправный dataset и вернуть конкретные ошибки.

Release — только в рамках явного разрешения владельца, после QA и по release-spec. Target только `content.vernatunspeakclub.com`; `admin.*`, БД/медиа и destructive reset не затрагиваются. До release — статус «подготовлено/сохранено», после успешной проверки фактической revision — «обновлено на сайте». Коммит и запуск workflow не равны успешному release. Не создавать release-manifest до выполнения gates.

## Пользовательский слой и ссылки

Короткая применимая инструкция и два шаблона сообщения находятся в [`projects/vernatun/content-plan/GROWTH_CENTER_UPDATES.md`](../../../../projects/vernatun/content-plan/GROWTH_CENTER_UPDATES.md). В ней есть прямые ссылки canonical JSON/spec/chain/playbook в ветке `codex/director-chatgpt-transfer` и честное различие «получено/сохранено/проверено/выложено». Markdown — протокол работы человека/агента, не обещание автосохранения из любого чата.

## Проверка этого изменения

Прочитаны актуальные spec+chain W-2026-11-09-growth-center. Изменены только два разрешённых документа. Проверены локальные ссылки на spec/chain/playbook/user guide; canonical JSON — путь по контракту Backend, на момент начала работы файл ещё создавался другим исполнителем. `git diff --check` применён к документам. Runtime integration, live update, commit/push и deployment этим этапом не выполнялись.
