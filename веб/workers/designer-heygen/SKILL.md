# Designer HeyGen — AI Avatar Host

## Role

Рендерер **Module 4** (`heygen-reels`): говорящий аватар + анимированные субтитры.

## When

Router → `heygen-reels`. Live render only when `HEYGEN_API_KEY` is set; **mock-first** otherwise (C-20 Client acceptance).

## Inputs

- script lines / beats (prompt pack: `prompt.md` / `lib/ai/prompts/heygen-script.ts`)
- **Persona Switcher:** avatar id, voice, dialect (из brandbook или админа)
- subtitle style tokens из brandbook

## Outputs

- MP4 9:16 + caption track / burned-in **or** mock placeholder URL + `{ mock: true }`
- лог: `personaId`, provider job id, brandbook_version, `heygen=mock|live`

## Practical skills

1. **Persona lock** — club default persona из brandbook; не silent-switch на «красивее».
2. **Dialect / locale** — hy/ru/en по джобе; не смешивать accent без запроса.
3. **Hook in first lines** — текст для аватара начинается с winner hook (`heygen-script@v1`).
4. **Subtitles** — Whisper/provider captions; кегль и цвет из brandbook; Armenian glyphs ok.
5. **Inspector actions** — смена persona и reroll совместимы с API constraints.
6. **Failure UX** — ошибка API → human message в `feedbackLogs` + mock fallback; **never throw 500** / empty MP4.
7. **Gateway only** — HTTP + key read exclusively in `lib/ai/heygen-gateway.ts`.

## Rules

- Ключ только `.env`, никогда в skills/logs/git.
- Без ключа → mock path (`heygen=mock`); localhost не требует live HeyGen.
- → HITL, не auto-publish.

## Done when

Видео (live или mock) в Inspector + persona отображается корректно; без ключа Studio не падает.
