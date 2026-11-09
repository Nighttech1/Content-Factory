# Chain — Ситуационный центр

Дата: 10.11.2026. Ветка: `codex/director-chatgpt-transfer`. Spec: `architect-spec.md` рядом. Только существующие роли из `.claude/registry/agents.md`.

1. **Оркестратор** — scope и критерии пользователя; только голос Клиента сообщает, какая роль что делает.
2. **Тренер** — аудит завершён до спеки: B UI/data, C release; идеи отдельно от jobs, настоящий local Chromium попробовать, membership/mobile gaps.
3. **Архитектор** — текущие spec+chain до продуктового кода; не пишет финальную реализацию.
4. **Backend** — строгий additive contentMechanics контракт, shared JSON ideas/provenance/revision, selector, membership denominator+definition и относящиеся model guards. Передать FE реальные exports/shape.
5. **Frontend** — stage-reactive idea cards/filter, честный plan/fact, название/пятый пункт/menu order/mobile пять ссылок/metadata/ссылки из marketing, основной шестой шаг подписки. Использовать Backend contract, не дублировать data, preserve shell.
6. **Тестировщик** — независимая проверка model/type/build/семантики и браузерных сценариев; production fixture никогда не писать в canonical JSON. Ошибки → конкретные C-*.
7. **Деплоер** — локальный запуск/URL для приёмки; при подтверждённом Chromium EPERM использовать существующий QA-only Actions. Доставка исходников в текущую ветку + изменение только QA marker разрешены Оркестратору; VPS/release marker запрещены. Backend/Frontend checks должны быть применимо зелёными.
8. **Клиент** — отдельный независимый исполнитель принимает живым desktop/mobile браузером, а не по словам инженеров. Проверяет весь scope, создаёт C-* с expected/actual/evidence.
9. **Оркестратор → Фиксер/владелец файла → Тестировщик → Клиент** — исправления и повторная приёмка до закрытия **всех** тикетов. Общие пути менять только после передачи lock.
10. **Клиент → владелец** — только после внутренней приёмки показать результат, доказательства и ограничения доставки. Финальная приёмка владельца отдельна. Ни разработка, ни internal accept не разрешают production автоматически.

## Path locks

| Роль | Разрешённые пути | Передача/ограничение |
|---|---|---|
| Архитектор | Только `memory/waves/W-2026-11-10-situation-center/{architect-spec,chain}.md` | Product code запрещён |
| Backend | `lib/growth-center/model.ts`, `data/growth/vernatun.json`, `scripts/test-growth-center.ts`, `projects/vernatun/content-plan/SITUATION_CENTER_MECHANICS.md`; относящиеся модельные expectations в прежнем wave boundary guard при необходимости | Не UI/shell/brand/jobs/prompt. Передать exports и lock до FE integration |
| Frontend | `components/growth-center/**`, `components/shell/SidebarNavigation.tsx`, `app/growth/page.tsx`, минимальная link-label правка `components/marketing/GrowthDashboard.tsx` | Не старый чат/store, не model/JSON. AppShell только если выявлен обязательный новый mobile blocker и lock согласован |
| Тестировщик | Новые/актуализированные browser guards `scripts/growth-center-browser-qa.mjs` (root scripts), `веб/scripts/test-growth-center-browser-fixture.mjs` + report/guards wave | Не app fixes; semantic expectation update после сравнения spec. Артефакты screenshot не коммитить в Git |
| Деплоер | Local process/build/start, report wave | Не release marker/workflow changes/VPS/credentials; разрешён только QA marker после фикса source SHA |
| Клиент | `scripts/situation-center-client-qa.mjs` — независимые read-only UI-сценарии для QA-only CI; report/tickets/evidence wave | Никаких app mutation; найденные баги возвращать владельцу пути. Отдельный вызов сценария в QA job интегрирует Деплоер |
| Фиксер | Только явно переданные файлы конкретного C-* | После фикса lock возвращается Tester/Client |
| Оркестратор | Scope/STATE/DEV_PLAN handoff, финальная интеграция после освобождения locks | Не править активный путь другого агента; QA-only source push и marker, не release |

## Пропущенные роли

- AI Bridge: нет изменения ИИ, prompts, API интеграций/MCP или parser сообщений. Редакционные идеи — данные UI; отдельный контентный запуск не требуется.
- Motion: отдельный слой/новые анимации не нужны; FE использует существующий reduced-motion.
- Art Director: не производим визуальный контент/карусели, UI качество независимо принимает Клиент.
- Кодер: профильных Backend+Frontend достаточно, монолитный альтернативный исполнитель не нужен.

## Handoff и доказательства

Backend → FE: `ContentMechanic`, `GrowthCenterDataset.contentMechanics`, `getStageContentMechanics(dataset, stageId)`; `kind` union и все поля согласно spec. Semantic membership change отдельно перечислить. FE → Tester: затронутые файлы, testids и новая логика filters. Tester → Client: только фактические команды/results+local URL; старый QA source не использовать как новый PASS. Для C-* сохранять шаги, expected/actual, фикс, повторный guard. Пользователь видит только реальную работу ролей без вымышленных независимых проверок.
