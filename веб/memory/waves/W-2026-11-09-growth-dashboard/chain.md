# Chain и path locks

Дата: 09.11.2026. Волна: W-2026-11-09-growth-dashboard. Спецификация: `architect-spec.md` рядом. Before SHA: `f40eb963b4628ee5e8a5ac58f90d70e7630f8e76`.

## Порядок

1. Оркестратор: scope C-GROWTH-01/02/03 и входы пользователя.
2. Тренер: грейд B, выполнен реальным субагентом; предметные gaps перечислены.
3. Архитектор: этот chain + spec, до кода.
4. Backend/data: pure typed contract, schema/import validation, conversion/scenario math. Сначала отправляет Frontend публичные exports/shape. Не создаёт unnecessary API/DB.
5. AI Bridge: в независимых файлах метод/playbook/реальный prompt; сохраняет API raw-user/system separation. Может работать параллельно data после spec; не правит data/UI.
6. Frontend: после подтверждённого data API интегрирует workspace с lifecycle/контентом/рынком/старым чатом; micro-motion/reduced-motion в рамках роли FE. Сложная Motion-сцена не нужна — отдельный Motion не вызывается.
7. Маркетинговый исследователь: доказательства/сегменты/альтернативы в одном evidence-файле; parallel, не меняет app.
8. Тестер: существующие уместные проверки + новые содержательные guards data/пустоты/импорта; реальный desktop/mobile сценарий при доступном браузере.
9. Фиксер: только конкретные дефекты, последовательный lock передачи от владельца файла. Повтор затронутых проверок, без ослабления.
10. Деплоер: только локальный запуск и read-only smoke. Production не разрешён.
11. Клиент: независимая сверка критериев/скриншотов/сценариев. Без живого browser UI gate открыт. Слово «согласовано» — только решение владельца, не автоматический итог кода.

## Path locks

| Исполнитель | Разрешённые записи | Не трогать |
|---|---|---|
| Архитектор | `веб/memory/waves/W-2026-11-09-growth-dashboard/architect-spec.md`, `chain.md` | Финальный код, другие wave guards |
| Backend/data | `веб/lib/marketing/growth-model.ts`, `growth-content.ts`; `веб/scripts/test-growth-model.ts` | UI, prompt.ts, schema/migrations, projects-store |
| AI Bridge | `веб/lib/marketing/prompt.ts`; `projects/vernatun/brand/growth-marketing-playbook.md`; `projects/vernatun/.claude/agents/content-director.md`, scout.md, analyst.md; предметные `shared/skills/marketing-methods/modules/{director,research,analytics}.md` по необходимости | `chat.ts`, API, growth-model/content, frontend, чужая memory |
| Исследователь | `projects/vernatun/brand/growth-market-evidence-20261109.md` | Остальные файлы |
| Frontend | Новые `веб/components/marketing/Growth*.tsx`, `growth-dashboard.module.css`; `веб/app/marketing/page.tsx`; минимально `веб/components/shell/AppShell.tsx` + route-scoped css при необходимости | Существующий MarketingDirectorClient, проекты/storage, SidebarNavigation, общие data/prompt файлы |
| Оркестратор/root | Integration fixtures/корректировки после явной передачи lock; STATE.md, DEV_PLAN только связанная запись; ноябрь/декабрь канон и экспорт-карта после новой стратегии; отчёты проверок/guards | Параллельная запись активных файлов специалистов |
| Тестер/Фиксер/Клиент | Отчёты/guards в этой wave; точечные fixes только после передачи lock | Чужие незавершённые файлы и production |

Backend и Frontend согласуют exports сообщением до импорта. Данные evidence для UI копируются только как краткая атрибутированная проекция в growth-content, после завершения исследователя; исходный evidence остаётся каноном анализа. UI не читает произвольный markdown как исполняемую инструкцию.

## Пропущенные этапы

- Отдельный Motion: не нужен для ступеней/фильтров; reduced-motion и лёгкие переходы реализует FE по текущим примитивам.
- DDL/миграции/очереди: отсутствуют в scope, данные верифицированных агрегатов вводятся локально с явным статусом.
- Платный LLM/API smoke: не вызывается; prompt guard — офлайн, отсутствие реального ответа не выдаётся за проверенный маркетинговый эффект.
- Production deploy/соцпубликация: запрещены до отдельного разрешения.
