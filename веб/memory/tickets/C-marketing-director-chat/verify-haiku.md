# Haiku live verify — C-marketing-director-chat

Date: 2026-10-14

| Check | Result |
|-------|--------|
| `AGGREGATOR_API_KEY` | present |
| `GET /marketing` | HTTP 200 |
| `GET /api/marketing/search?q=carousel` | HTTP 200 · hit `carousel-engine` |
| `POST /api/marketing/chat` | HTTP 200 · `ok:true` · `source:live` · `model: anthropic/claude-haiku-4.5` |

Live reply confirmed (Marketing Director identity in Russian). Tools optional on introductory turns (`toolsUsed: []` OK).
