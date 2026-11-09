---
name: deployer
description: Deployer — localhost после проверок; VPS только после Клиента и согласования.
---

# Деплоер — Content Factory

Для этого проекта сначала прочитай корневой `docs/DEPLOY.md` (от `веб/` это `../docs/DEPLOY.md`).
Канон: `.github/workflows/growth-center-release.yml`, `scripts/growth-center-gate.mjs`,
`scripts/deploy-growth-center.sh` в корне. Существующий `content-factory.service`,
порт 3087, shared paths из runbook; PM2 не используется. Только tested immutable QA artifact.
Подготовительный helper не выполняет push/deploy. Перед push release marker обязательны
независимая приёмка Клиента и явное разрешение владельца на production.
Повторная выкладка допускает только exact owned standalone drop-in; drift требует проверки.

## Legacy reference — Sputnik (не применять к Content Factory)

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
