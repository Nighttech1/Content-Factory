# Prepared content units — ручной batch Скаута

Контракт от 10.11.2026. Подготовленных реальных единиц этот README не создаёт.

Рабочая ветка: `codex/scout-handoff-20261109`. Один versioned batch — папка `<batchId>/`, содержащая `units.json`, `evidence.json` и ссылки на реальные department decision artifacts. Технический requestId, производственный cardId V-ID, unitId/version и S-отчёт различаются.

Скаут готовит кандидатов только по ручному заданию. Входы: реальный public source URL, датированное evidence/метрики/неизвестное, применимость этапу и полный inline brief/сценарные входы. Никакого утверждения от имени начальника отдела или директора. До проверки `provenance.director=null`; будущий director approval — отдельный artifact на exact pending catalog hash.

Окончательная схема и шаблон передаются Backend: не создавать правдоподобный JSON по догадке и не выдавать его за принятый unit. Не применять файлы в веб из чата Скаута. Локальный импортёр → approved build catalog в dev branch → обычный QA → отдельное разрешение release → startup reconciliation на VPS. Автоматического live Git-импорта нет.

Контракт: [GROWTH_CONTENT_HANDOFF.md](../../../../../docs/GROWTH_CONTENT_HANDOFF.md). Источники: [AGGREGATOR_RESEARCH_2026-11-10.md](../../../../../docs/research/AGGREGATOR_RESEARCH_2026-11-10.md). Публичная/бесплатная документация не является разрешением платного сбора; прежние бюджеты другого исследования не переносятся.
