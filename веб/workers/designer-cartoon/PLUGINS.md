# PLUGINS / MCP — Designer Cartoon

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| Remotion / Lottie pipeline | Сборка 9:16 | системные deps |
| TTS / voiceover provider | Озвучка | API key `.env` |
| Brandbook reader | Цвета субтитров, end-card | filesystem |
| Media store | MP4 path | storage |
| (опц.) Whisper | Субтитры по аудио | model/local or API |

## Не подключать

- HeyGen avatar API (другой модуль)
- Publisher
- Запись ключей в memory tickets

## Perf notes

Долгий render → BullMQ job + SSE progress (`RENDERING_MEDIA`), не блокировать Studio HTTP.
