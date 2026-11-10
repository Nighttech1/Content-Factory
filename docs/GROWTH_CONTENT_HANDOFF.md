# Скаут → профильный руководитель → директор → проверенная сборка

10.11.2026, Москва. Контракт подготовки контента для Ситуационного центра. Авторитетная спецификация: `веб/memory/waves/W-2026-11-10-growth-content-import/architect-spec.md`; окончательные машинные поля/экспорты задаёт Backend. Этот документ не является отдельным workflow live-импорта и не объявляет исследования или approvals выполненными.

## Единственный транспорт

1. Скаут по отдельному ручному заданию исследует реальные публичные источники. Сохраняет versioned batch в ветке `codex/scout-handoff-20261109`:
   `projects/vernatun/departments/scout/prepared-units/<batchId>/units.json` и `evidence.json`.
2. Профильный начальник отдела проверяет применимость, сценарий и производственные ограничения. Его решение — отдельный реальный artifact, привязанный к конкретному unit/version/hash. Скаут не подписывает его от имени другой роли.
3. Контент-директор рассматривает exact pending catalog после решения отдела и отдельно сохраняет `director-approval.json`: решение, дата, роль, hash каталога и список точных unit/version/hash. Сам наличие prepared файла не означает утверждения.
4. Локальный импортёр проверяет источники/схему/версии/hashes и формирует approved build catalog `веб/data/growth/prepared-units.json` в ветке `codex/director-chatgpt-transfer`. Чтение Скаутской ветки pinned commit, не плавающий latest. Весь Scout branch не сливается с приложением.
5. Сохранённый source проходит обычный существующий QA: build, guards, реальные browser-сценарии и независимую приёмку Клиентом. Только после отдельного явного разрешения владельца existing release workflow доставляет **тот же** проверенный artifact на VPS через существующие SSH bindings.
6. Trusted startup/reconciliation применяет approved catalog к persistent workspace с idempotency/conflict guards и backup. Только это применение и проверка новой версии подтверждают, что материал появился на сайте.

**Нет отдельного data-only live workflow, runtime Git polling, браузерного fetch произвольных source URL или массовой перезаписи state.json из Git.** Код/каталог доходят одной проверенной сборкой. Публикация соцсетевого контента не выполняется при появлении карточки на доске.

## Что подготавливает Скаут

Для каждой единицы: стабильные unitId/version, существующий либо корректно заведённый производственный V-ID, полный inline brief, формат/каналы/этап воронки, сценарные входы, shots и обязательный public source URL. Evidence содержит реальную дату проверки, источник числовой метрики/её единицу/окно и ограничения. URL агрегатора хранится отдельно от прямого permalink на исходный материал.

Источники и ограничения: [датированная проверка агрегаторов](research/AGGREGATOR_RESEARCH_2026-11-10.md). Исторический референс не становится текущим трендом; недоступная метрика остаётся неизвестной. Полный текст чужой публикации не копировать, использовать оригинальную адаптацию под аудиторию/потребность/барьер клуба.

## Как подтверждаются роли и версии

- Pending phase: `provenance.director=null`, никаких фиктивных approved-подписей. Department decision содержит роль из существующего реестра, дату, обоснование и SHA256 её реального artifact.
- Содержательный hash считается детерминированно **без** director approval и вычисленных root/hash полей, чтобы не получить circular hash. `scout.sourceCommit` и `department.artifactSha256` входят в защищаемые данные.
- Директорский artifact указывает hash exact pending content и hashes exact unit versions. После изменения сценария/источника/версии требуется новый review, не редактирование готовой подписи.
- Импортёр не принимает решение за директора. Checkbox веба или строка «approved» в произвольном JSON не заменяет отдельный approval artifact и доказуемый ручной handoff.
- Если разные чаты пользуются одной GitHub-учётной записью владельца, раздельные роли являются процессом приёмки, а не криптографической идентификацией отдельных людей. Права записи/защита ветки проверяются фактически.

## Сохранность runtime

Approved catalog добавляет только проверенный контент. Existing facts, weekly snapshots, колонка/order, публикационные подтверждения и owner edits не перезаписываются. Повтор той же версии/hash — no-op; подмена hash под тем же unit/version отвергается. Если владелец уже изменил карточку, новая версия попадает в conflict/quarantine, а не затирает его работу.

Metadata/provenance/import receipts — отдельный sidecar, старый WorkspaceCard shape остаётся читаемым предыдущей сборке. Не восстанавливать старые runtime данные поверх новых пользовательских записей ради отката приложения. Пустой каталог означает «Нет утверждённых материалов», а не AI-заглушки.

## GitHub Actions и разрешения

Используется существующий [runbook деплоя](DEPLOY.md). Обычный docs/source push не объявляется доставкой на сайт. QA marker и release marker разделены; release проверяет successful QA/source/run/artifact/hash/expiry. Старые IDs из STATE не являются defaults для нового каталога.

GitHub поддерживает [branch/path filters](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), но произвольный новый trigger не создаётся этим handoff. Если позже выбирается workflow_dispatch для Scout setup, сначала проверяется фактическая доступность workflow в нужном ref/default branch. Файл workflow не доказывает возможность dispatch из текущего чата.

[Официальные рекомендации безопасности Actions](https://docs.github.com/en/actions/reference/security/secure-use): минимальные permissions, full-SHA actions, секреты только в защищённых bindings, никакого исполняемого кода из source payload. [Возможности environment protection](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) зависят от плана и видимости repo; не считать reviewers настроенными без проверки. В текущей проектной работе реальные paid calls/Scout execution/VPS deployment не запускались.

## Что должно быть доказано до выпуска

- Невалидная схема, unsafe/missing source URL, future date, duplicate ID, hash/version/ref mismatch, отсутствие реального department/director artifact → отказ.
- Pending catalog ничего не утверждает. Approved catalog проходит exact source QA; synthetic fixtures не выдаются за реальный контент.
- Reconcile idempotent, конфликт owner edit сохраняется, факты/история/kanban/publication не теряются, rollback старого store остаётся читаемым.
- В modal видны полный бриф, сценарий, первоисточник, evidence limitations и provenance ролей; пользователя не отправляют читать Git ради понимания задачи.
- После отдельного разрешённого release подтверждены новая версия/health и независимая live приёмка. До этого «подготовлено», «утверждено», «QA пройден» и «выложено» — разные состояния.
