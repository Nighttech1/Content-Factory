# Chain — Центр роста

Дата: 09.11.2026. Before SHA `1ea460c`. Спецификация: `architect-spec.md` рядом. Режим: пользователь запросил весь связанный scope + production target content.* после QA.

1. Оркестратор — запрос, семь шагов до кода, scope и критерии.
2. Тренер — architecture B / release C; устранить build/QA/release blockers, не имитировать readiness.
3. Архитектор — текущие spec+chain ДО implementation.
4. Backend/data — schema, canonical JSON, loader, read-only API, pure plan/fact/conversion/series helpers и guards. Первым прислать FE exports/props.
5. Frontend — новый `/growth` и navitem, крупная interactive funnel, stage detail, content plan/fact, charts и responsive; использует только Backend helpers, старый `/marketing` сохраняет.
6. Release Fixer — отдельным lock исправляет inherited TS/sharp build blockers без изменения scope dashboard и без weakening checks.
7. Оркестратор интегрирует маркетинговые источники/24brief projections, проверяет provenance и новую стратегию.
8. Тестировщик — guards, типизация, clean install, build, live desktop/mobile; фиксирует конкретные дефекты и передаёт владельцам файлов.
9. Фиксер — локальные дефекты и повтор затронутых проверок; path передаётся последовательно.
10. Деплоер — QA gate → versioned deploy только content.vernatunspeakclub.com → route/API/revision checks + rollback ready. Никаких admin.* и удаления общей data.
11. Клиент — независимо проверяет фактическое поведение и deployed proof; пользователь принимает итог словом «согласовано». Сохранение/сборка/деплой/приёмка — разные статусы.

## Path locks

| Исполнитель | Разрешено | Запрет / передача |
|---|---|---|
| Архитектор | `веб/memory/waves/W-2026-11-09-growth-center/{architect-spec,chain}.md` | Не пишет app code |
| Backend | `веб/lib/growth-center/**`, `веб/data/growth/vernatun.json`, `веб/app/api/growth-center/**`, `веб/scripts/test-growth-center.ts` | Не UI/nav/prompt, не schema/DB, не write API |
| Frontend | `веб/components/growth-center/**`, `веб/app/growth/**`, минимальный navitem в `components/shell/SidebarNavigation.tsx`, route-scoped mobile extension в `AppShell.tsx` и соответствующем existing shell CSS | Не трогать старый `/marketing` и data helpers, не redesign shell. После integration отдаёт Tester/Fixer |
| Release Fixer | Точные файлы inherited ошибок/lockfile, перечисленные в его diagnosis; package.json/package-lock.json для sharp sync | Не `ignoreBuildErrors`, не исключения TS; если файл пересекается Backend/FE — сначала запросить передачу lock |
| Deployer | Новый отчёт release-discovery.md и release spec в wave; после согласования root — изолированный `.github/workflows/growth-center-release.yml`, `scripts/deploy-growth-center.sh` и release-manifestpath | До QA никаких production mutations. Atomic release с preserved shared data/rollback, только content.*. Release trigger только manifestpath/director, не любой code push; точные пути закрепляет её release-spec перед кодом |
| Root | Scope/guards/release summary; evidence/strategy/canon и lifecycle content mapping после передачи dataset lock; STATE/DEV_PLAN относящаяся запись | Не менять активные FE/Backend файлы параллельно |
| Tester/Client | Отчёты/guards/screenshots в wave, без app mutation | Fixes через владельца файлов или явную lock передачу |

## Контракт handoff

Backend → FE: `GrowthCenterDataset` **version:2** с `awareness/desire`, server `getGrowthCenterData()`, validate helper, stage content stats/planfact/series helpers; frontend page получает dataset props. Version:1 legacy `/marketing` не мигрируется молча. Canonical JSON в bundled build: shared update через чат требует commit → build → deploy. Read-only `GET /api/growth-center` возвращает тот же dataset/revision. При необходимости уточнить имена модулей сообщением до кода FE.

Независимы после spec: Backend, FE scaffold до final data wiring, Release Fixer (с согласованными файлами), deployment discovery read-only. Все shared file edits последовательны. Отдельный Motion не нужен: FE применяет existing motion/reduced-motion; AI Bridge не переписывает live agent prompts этой волной, кроме отдельного задания root.
