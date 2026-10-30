# PLUGINS / MCP — Designer HeyGen

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| `lib/ai/heygen-gateway.ts` | Avatar render (mock if no key) | `HEYGEN_API_KEY` в `.env` only |
| Whisper / captions | Субтитры | опц. API |
| Brandbook reader | subtitle + persona defaults | filesystem |
| Media store | MP4 | storage |
| SSE progress bridge | Лог в Generation Drawer | нет |

## Не подключать

- Прямой publish в соцсети
- Логирование raw API key / webhook secrets
- Remotion cartoon как замена аватару

## Safety

HITL + data-safety: не пушить медиа в соцсети в обход апрува.
