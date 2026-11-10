# Фактические попытки QA

## Попытка1 — не принята

Source `c03f2d7dd9993cb12e31dcd00bcbd6740c82a1d8`, QA marker `2765c929ef019f8cea2a4a64888d15f3167fd166`, run https://github.com/Nighttech1/Content-Factory/actions/runs/42795772848. Gate PASS, QA FAILED, deploy SKIPPED. Clean install/typecheck/38legacy+11boundary/newserverguards/build/package PASS; real HTTPS browser открыл приложение и auth, но остановился на column wait после desktop native DnD/неоднозначного Home+Enter.

Evidence artifact13754695255: actual browser errors[]/external[], failure screenshot показывает карточку в «Съёмке» и не подтверждает keyboard return. Логи сервера без application errors. Это не успешный UI gate и не production readiness.

Клиент открыла C-QA-KEYBOARD-HANDOFF (P1 QA gate) и C-UX-KANBAN-HEIGHT (P2 UI): в screenshot длинный task-столбец растянул страницу, graph далеко. Исправления: meaningful physical ArrowUp+Tab с фактическим POST+DOM+serverassert; bounded equal-height columns с independent Yscroll, lastcard keyboard reachability/graph distance guards на4widths. Оба тикета остаются OPEN до нового actual CI и независимой приёмки.

Следующий source/QA marker будет отдельным. Release marker, VPS, production, paid API и Scout search не запускались.

## Попытка2 — частичная фактическая проверка, gate не пройден

Source `80dcf085ec12083c1e842f54919f8c516f972a1e`, QA marker `673f195c60980fae54244c3debf0713da517621f`, run https://github.com/Nighttech1/Content-Factory/actions/runs/42797132824. Build/type/server tests PASS, deploy SKIPPED. Evidence13753583207 подтверждает desktop1440: physical ArrowUp+Tab → POST200 → persisted task; board634px при viewport1000, все5колонок620px, chartgap30px, lastcardreachable/ownscrollPASS, browsererrors[]/external[].

Далее упал сценарий оборванного ответа Scout: generic role=alert мог совпасть с shadow-DOM NextRouteAnnouncer до завершения POST. Тест не ожидал окончания собственного route.fetch/abort и читал число запросов слишком рано. Это не доказанный дефект приложения: реальный экран показывает ответнеполучен, а его обработчик ещё busy. Tester заменила ожидание на точный application text, completion фактического upstream commit/abort и enabled control, сохранила exactcount+1/sameUUID replay/one durable request. Client отдельно уточнила future-publication guard: фактический POST400/future_evidence_date и ошибка внутри своего диалога. Appcode после source80dc этой правкой не меняется.

Оба C-* остаются OPEN: до окончания всех4widths и независимого Client CLI нельзя объявлять весь UI принятым. Следующая попытка отдельно.
