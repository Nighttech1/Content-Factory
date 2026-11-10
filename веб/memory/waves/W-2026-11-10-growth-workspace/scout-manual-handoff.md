# AI Bridge — ручная эстафета growth → Скаут

10.11.2026, Москва. Исходный код и UI AI Bridge не меняет; фактический поиск, LLM, платные API, workflow dispatch и production не запускались.

## Подтверждённая развилка веток

- В development `codex/director-chatgpt-transfer` нет `projects/vernatun/departments/scout/START-CHATGPT.md`.
- Read-only `git fetch origin codex/scout-handoff-20261109` успешен. Исходный HEAD Скаута: `f4c64646e772af4a9ab8d7ddc40e0dcb63989d9f`.
- Прочитанный START закрепляет именно Scout branch, профиль и ручной режим. Поэтому запись очереди только в development branch не обеспечивает обещанный запуск по одной короткой команде в чате Скаута.
- Runtime `GROWTH_SCOUT_BRANCH` отдельно от `GROWTH_GITHUB_BRANCH` резервных копий. Target очереди по спецификации: `codex/scout-handoff-20261109`; target файла: `projects/vernatun/departments/scout/requests/growth/<requestId>/00-request.json`.
- В read-only inventory Scout branch найден единственный workflow `.github/workflows/scout-data.yml`; trigger — `workflow_dispatch`. Push узких queue/docs файлов сам не запускает сбор. Перед фактическим push root повторно проверяет актуальный head и triggers.

## Контракт и честные состояния

API DTO `ScoutRequest`: `id`, `cardId`, `status=queued|git_pending|git_saved`, `createdAt`, `gitPath`, `commitSha`. Эти статусы отражают только доставку. Машинное тело `00-request.json` задаёт Backend; обязательный смысл — технический ID, существующая карточка, этап/формат, известный source/неизвестное, owner question, expected research, evidence criteria и «Не запускать без сообщения владельца “обновляй инфу”».

Не смешивать technical request ID, производственный V-ID и номер отчёта S-ID. Нет runtime Git credentials — серверное сохранение допустимо, но Git not configured/not sent должен быть видим. Connected GitHub в чате инженера не является токеном приложения VPS.

## Подготовленный bootstrap

Вне репозитория подготовлены additive версии актуальных Scout START и README, а также та же intake README. Они не переключают локальную ветку, не сливают истории и не изменяют main. Публикует только root через existing GitHub connector после QA, отдельным narrow commit с expected-head CAS; при stale ref сначала перечитать diff.

Bootstrap добавляет обработку growth-очереди только после owner-команды. Исторический paid budget не переносится; Скаут не подменяет начальника отдела и не объявляет обновлённым веб. Автоматический импорт будущих отчётов в карточки вне scope. Source/source-date/metrics и решение отдела остаются проверяемыми отдельными состояниями.

Инструкция очереди: `projects/vernatun/departments/scout/requests/growth/README.md`. Последующая публикация bootstrap и runtime-настройка должны подтверждаться отдельно; наличие этих файлов не означает, что действующий чат уже перечитал новую инструкцию.


## Фактическое сохранение bootstrap после QA

Root сохранила три подготовленных файла в Scout branch `codex/scout-handoff-20261109`, commit `77896642ab91c93a41b9f4df1d85ce6b8b1b266d`, parent f4c64646e772af4a9ab8d7ddc40e0dcb63989d9f с expected-head CAS без force/merge. Перед записью повторно подтверждён exact ref; оригинальные START и README сохранены, additive intake only. Только manual workflow_dispatch, реальное исследование не запускалось. Runtime queue requests ещё не отправлялись: VPS credentials/feature activation отдельно. Открытый чат Скаута должен реально перечитать актуальные инструкции после команды владельца.
