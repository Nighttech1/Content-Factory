# Backend Zero-Data-Loss

Читать вместе с `SKILL.md`.

## WAL + один писатель

- SQLite открывает **только** серверный процесс проекта (WAL, `busy_timeout`).
- Запрещено писать в файл БД вторым процессом, «мимо API», по SMB или MCP `--allow-write`.
- MCP sqlite — **read-only**. Мутации — через API приложения.
- Не открывать БД по сетевому пути `\\server\share\…`.

## Изоляция

- Пользовательские ключи/строки содержат id сущности (tenant / workspace / project).
- Запрос A не читает и не пишет B.
- `UPDATE`/`DELETE` без scope запрещены.

## Премодерация и Undo

- Прямая запись от LLM в хранилище **запрещена**.
- Перед mutating-действием ИИ — снимок `before` в audit log.
- Неизвестный verb → очередь, не запись.

## Идемпотентность

- Повтор mutating-запроса с тем же `actionId` не дублирует строки.
- Sync: идемпотентный upsert по scoped key.

## Перед сменой схемы

1. MCP: `PRAGMA user_version` / `integrity_check` / выборка по двум tenant id.
2. Код миграции по `safe-db-migrations`.
3. Не выполнять `UPDATE`/`DELETE`/`DROP` через MCP.
