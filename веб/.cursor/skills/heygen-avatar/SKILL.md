# HeyGen Avatar Module

## When

Module 4 `heygen-reels`, Persona Switcher в Inspector, AI Avatar Host карточка в Studio.

## Flow

1. Черновик сценария (Script Writer) → текст для аватара.
2. Выбор: avatar model, voice, dialect/emotion, speech rate.
3. Вызов HeyGen Interactive Avatar API (ключ только из env).
4. Получение stream/MP4 URL → `generatedMedia`.
5. Субтитры: Whisper (или готовый transcript) → karaoke overlay в плеере.

## UI

- Studio: карточка модуля.
- Inspector: Persona Switcher + Approve & Schedule.
- Не логировать API keys / raw tokens.

## Failures

Статус `FAILED` + понятный feedbackLog для GenerationDrawer.
