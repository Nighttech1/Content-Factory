### [C-48] Продуктовые описания custom-плиток не доходят до UI
- **Зона / Экран:** Studio Launchpad `/studio` — карточки `custom-reels` / `custom-clips-to-reels` / `custom-info-video`
- **Факт:** В `data/local/custom-modules.json` лежат нормальные RU-описания, но live `GET /api/modules/register` (и после hydrate сетка) отдаёт `Custom worker · http://127.0.0.1:9/no-worker`. Причина: `createRemoteFromRecord` → `createRemoteContentModule` игнорирует `record.description`.
- **Ожидание:** На карточке видно продуктовое описание из seed (как в architect-spec C-45), целиком, без подмены на worker stub. CORE-описания не трогать.
- **Приоритет:** P1
- **Скрин-улика:** live API `/api/modules/register` 2026-10-05; визуал `/studio`
- **Зона:** Backend (+ Frontend только если mirror/storage тоже затирает description)
- **Wave:** follow-up к W-2026-10-05-studio-tiles-cleanup
