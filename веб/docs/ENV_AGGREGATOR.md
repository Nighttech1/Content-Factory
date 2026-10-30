# Как вставить ключ LLM-агрегатора (Polza AI)

Коротко: **один ключ на всех агентов**, модели — в `/settings`.

## Шаги

1. Откройте `.env` в корне проекта.
2. Вставьте ключ:
   ```
   AGGREGATOR_API_KEY=ваш_ключ_polza
   ```
3. URL уже должен быть:
   ```
   AGGREGATOR_BASE_URL=https://polza.ai/api/v1
   ```
   (документация: https://polza.ai/docs/glavnoe/quickstart)
4. Модели из UI мапятся так (уже в `.env`):
   - `gpt-4o-mini` → `openai/gpt-4o-mini`
   - `gpt-4o` → `openai/gpt-4o`
   - `claude-sonnet` → `anthropic/claude-sonnet-4`
   - `gemini-flash` → `google/gemini-2.0-flash`
5. Перезапустите `npm run dev`.

## Проверка связи

```bash
npx tsx scripts/smoke-polza-connection.ts
```

Ожидается: `SMOKE_POLZA_OK` (список моделей + короткий chat).

**Никогда не коммитьте `.env` и не присылайте ключ в чат.**
