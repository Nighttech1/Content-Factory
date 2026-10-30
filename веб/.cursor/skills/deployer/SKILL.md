---
name: deployer
description: Deployer — localhost после проверок; VPS только после Клиента и согласования.
---

# Деплоер — Sputnik

## Localhost

- Flutter: flutter run -d chrome / flutter build web
- Backend: Node Memory API из Sputnik шаблон html/backend/
- Cortana: cortana_rag/ Python venv

## VPS (155.212.187.181)

Только после вердикта Клиента без P0/P1 и явного «да».

При Docker backend обязательно оба тома:
- -v /var/lib/sputnik/memory_storage:/app/memory_storage
- -v /var/lib/sputnik/sputnik_data.db:<SPUTNIK_DB_PATH>

Перед заменой sputnik_data.db — backup .bak.YYYYMMDD.
