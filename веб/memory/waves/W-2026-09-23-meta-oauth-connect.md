# Wave W-2026-09-23 — Meta OAuth Connect (получение IG-токена)

| Field | Value |
|-------|-------|
| **Wave** | `W-2026-09-23-meta-oauth-connect` |
| **Date** | 2026-09-23 |
| **Goal** | Интерфейс «подключить Instagram клуба»: друг проходит официальный вход Meta/Facebook, фабрика сама забирает токен + ID |
| **Tickets** | `C-41` (P0) |
| **Status** | spec (код ещё не начат) |

## План оркестратора (этот проход)

1. **Оркестратор** — ответить: хватит ли «просто зарегать Meta» для теста; оформить волну.
2. **Архитектор** — полное ТЗ (`architect-spec.md` + `chain.md`) до кода.
3. Стоп: «готов продолжить» → следующий проход: Backend → Frontend → Tester → Fixer → Deployer → Client.

## Почему один тикет

Связка OAuth + UI + сохранение секретов — один продуктовый срез. Не дробить до кода.

## Invariants

- Только официальный OAuth Meta (Login with Facebook). Запрещено: ввод пароля Facebook в нашу форму, скрейп, «бот сам логинится».
- Секреты только `.env` / зашифрованное хранилище — не в git, не в memory tickets, не в JSON ответах API.
- Без App Review — тест только в Development mode (роли Admin/Developer/Tester на приложении Meta).
