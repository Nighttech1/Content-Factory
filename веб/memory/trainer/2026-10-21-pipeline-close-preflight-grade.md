# Тренер — preflight перед закрытием DEV_PLAN Vernatun A

**Дата:** 2026-10-21  
**Грейд:** B (идти можно после ответов на 10 вопросов; критичных «стоп» нет, есть риск моделей/бюджета)  
**ticket_limit:** full-queue (пользователь намерен закрыть весь план)

## План хода

Пользователь хочет уточнить scope, затем прогнать `tasks/DEV_PLAN.md` шаги 0–9 и добить Mode A × 4 слайда.

## Аудит

| Слой | Статус |
|------|--------|
| ARCHITECTURE + DEV_PLAN в `tasks/` | есть, шаги 0–9 все ⬜ |
| Код `lib/studio/vernatun-carousel/` | каркас есть; gap vs v2 открыт (модели, findings, промпт 34–40 px) |
| Последний job | `329ecf17-…` → BLOCKED_WITH_REMARKS (карточки/заголовки) |
| `promts` | был битый/урезанный указатель → обновлён под волну |
| Plugin волны | добавлен `plugins/trainer/vernatun-a-pipeline-close.md` |

## Пробелы

1. Defaults моделей ≠ целевые (`gpt-4o` / Claude вместо единой `gpt-5.4`).
2. Types ближе к v1; нет полного `ArtDirectorFinding` + `quality_status`.
3. Нет явного подтверждения: тема демо, бюджет API, критерий «достаточно FINAL vs честный BLOCKED».
4. Session/transcript на job ещё не реализован как общее окно.

## Добавлено

- `promts` — канон старта волны A
- `plugins/trainer/vernatun-a-pipeline-close.md`
- этот грейд

**Команда готова:** да, после ответов на уточняющие вопросы (особенно модели, тема, что считать успехом демо).
