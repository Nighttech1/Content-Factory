---
name: content-factory-development
description: Навигация по архитектуре, инженерным ролям, скиллам и инвариантам Vernatun Content Factory. Используй при планировании изменений продукта, работе с агентами и передаче разработки между сессиями.
---

# Навык разработки Content Factory

Этот навык связывает правила Codex из `AGENTS.md` с накопленными знаниями проекта. Не заменяй продуктовые решения общими шаблонами разработки. Для углублённой работы загружай узкий Codex-навык: `cf-frontend`, `cf-backend`, `cf-ai-bridge` или `cf-safe-operations`.

## Начало работы

1. Прочитай корневой `STATE.md`, затем `DEV_PLAN.md`.
2. Сверь релевантный фактический аудит: `docs/AUDIT_FUNCTIONALITY.md`, `docs/AUDIT_ARCHITECTURE_STACK.md`.
3. Найди нужную роль в `.claude/registry/agents.md` и прочитай только относящееся правило из `.claude/rules/`.
4. Подбери один или несколько практических скиллов из `.claude/skills/`. Не загружай всю библиотеку.
5. Для поведения контентного worker читай соответствующий `workers/<role>/SKILL.md` и `PLUGINS.md`; для кода интеграции — доменный скилл AI Bridge/backend.

## Маршрутизация ролей

| Область | Роль и основной справочник |
|---|---|
| План, scope, зависимости | Architect — `.claude/rules/architect.md`, skill `architect` |
| UI и дизайн-система | Frontend — `.claude/rules/frontend.md`, skills `content-factory-ui`, `design-system`, `responsive-mobile-web` |
| Интеракции и анимации | Motion — `.claude/rules/motion.md`, skill `web-motion-engine` |
| API, Prisma, очереди, хранение | Backend — `.claude/rules/backend.md`, skills `backend`, `safe-db-migrations`, `bullmq-job-queue`, `prisma-content-schema` |
| Промпты, LLM, agent-start и handoff | AI Bridge — `.claude/rules/ai-bridge.md`, skills `content-pipeline-agents`, `prompt-engineering`, `carousel-json-contract` |
| Обычная серверная логика | Coder — `.claude/rules/coder.md`, skill `coder` |
| Регрессии и критерии | Tester — `.claude/rules/tester.md`, skill `tester` |
| Исправление дефектов | Fixer — `.claude/rules/fixer.md`, skill `fixer` |
| Проверка работы продукта | Client — `.claude/rules/client.md`, skills `client-scenarios`, `client-review` |
| Развитие рабочих правил команды | Trainer — `.claude/rules/trainer.md`, skill `trainer` |
| Визуальная оценка карусели | Art Director — `.claude/rules/art-director.md`, skill `art-director`; вердикт `approve` или `remarks`, без самостоятельного remake |

Перед крупным изменением следуй точной цепочке, указанной в `DEV_PLAN.md` или в тикете. Не создавай фиктивные артефакты `chain.md`, тренерский грейд или клиентский вердикт, если их не запрашивает текущая рабочая процедура.

## Цикл работы

Веди продуктовую задачу по циклу из `docs/CLIENT_ORCHESTRATOR_CYCLE.md`: Оркестратор задаёт критерии и ведёт реализацию; Клиент проверяет результат, создаёт `C-*` для дефектов и повторяет приёмку после фиксов. Для UI используй живой сценарий, если доступен localhost/browser; иначе явно оставь этот гейт открытым. Для документационных правок используй содержательную проверку без ненужного запуска приложения. Не выдумывай роли, артефакты и статусы.

## Общие инварианты

- Удалённый User Basic Brief не добавляется скрыто в промпты, `messages[].role=user`, agent-start или handoff. Следуй действующим S49/S155 контрактам и проверяй свежие решения в коде/тикетах.
- Данные и настройки конкретного клуба не смешиваются с глобальными инструкциями или другим проектом.
- Все внешние источники и метрики должны быть различимы от догадок. Не изобретай показатели.
- Качество визуала проверяется по актуальному brandbook и эталонам; `swipe_trigger` остаётся метаданными, если контракт не изменён.
- Publisher не публикует в обход явного HITL-одобрения.
- Секреты не читаются ради отчёта и не копируются в репозиторий.
