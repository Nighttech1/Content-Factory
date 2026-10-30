# Status — C-34
| Status | done |
| Deploy | deployed_localhost |
| Client | **ПРИНЯТО** |
| Wave | согласовано with C-32/C-33 |

## How to add your key
1. Файл `.env` уже можно создать из `.env.example` (Backend follow-up).
2. Вставьте ключ: `AGGREGATOR_API_KEY=ваш_ключ` (без кавычек).
3. При необходимости: `AGGREGATOR_BASE_URL=...`
4. Модели агентов — в UI `/settings` (localStorage `cf-llm-agent-models`), не в `.env`.
5. Restart `npm run dev`
6. Never commit `.env`

Подробнее простым языком: `docs/ENV_AGGREGATOR.md`.
