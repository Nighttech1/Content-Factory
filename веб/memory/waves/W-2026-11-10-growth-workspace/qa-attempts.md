# Фактические попытки QA

## Попытка1 — не принята

Source `c03f2d7dd9993cb12e31dcd00bcbd6740c82a1d8`, QA marker `2765c929ef019f8cea2a4a64888d15f3167fd166`, run https://github.com/Nighttech1/Content-Factory/actions/runs/42795772848. Gate PASS, QA FAILED, deploy SKIPPED. Clean install/typecheck/38legacy+11boundary/newserverguards/build/package PASS; real HTTPS browser открыл приложение и auth, но остановился на column wait после desktop native DnD/неоднозначного Home+Enter.

Evidence artifact13754695255: actual browser errors[]/external[], failure screenshot показывает карточку в «Съёмке» и не подтверждает keyboard return. Логи сервера без application errors. Это не успешный UI gate и не production readiness.

Клиент открыла C-QA-KEYBOARD-HANDOFF (P1 QA gate) и C-UX-KANBAN-HEIGHT (P2 UI): в screenshot длинный task-столбец растянул страницу, graph далеко. Исправления: meaningful physical ArrowUp+Tab с фактическим POST+DOM+serverassert; bounded equal-height columns с independent Yscroll, lastcard keyboard reachability/graph distance guards на4widths. Оба тикета остаются OPEN до нового actual CI и независимой приёмки.

Следующий source/QA marker будет отдельным. Release marker, VPS, production, paid API и Scout search не запускались.
