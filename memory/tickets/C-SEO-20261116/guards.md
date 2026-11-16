# Проверки 16.11.2026

python3 -m unittest discover -s scripts/articles -p 'test_*.py': 11 PASS.
Проверены draft, future, stale approvals, отсутствие owner, опасные блоки/URL,
duplicate id/slug, timezone, HMAC, idempotency key, неверный receipt, отсутствие
настроек и запрет redirect. HTTP в тестах подменён mock, внешних отправок нет.
CLI --deliver: Eligible articles: 0, сетевых вызовов нет. Проверка YAML отдельно.
Секреты не читались. VPS, бот, дашборд и сквозной выпуск не тестировались.
C-SEO-20261116 частично выполнен, production остаётся открыт по DELIVERY.md.
