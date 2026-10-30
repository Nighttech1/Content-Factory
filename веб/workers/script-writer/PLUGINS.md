# PLUGINS / MCP — Script Writer

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| LLM + structured output | Слайды / beats | LLM `.env` |
| Zod / JSON Schema | Валидация `rawScript` | нет |
| Brandbook MD reader | Типы слайдов, лимиты | filesystem |

## Не подключать

- Puppeteer/Satori/Remotion/HeyGen (это Designer)
- Social publish

## Hand-off

Передать Router: `rawScript` + `suggestedModule?` + `brandbook_version`.

## Канон контракта

| Ref | Path |
|-----|------|
| JSON + swipe meta + CTA 1–4 | `.cursor/skills/carousel-json-contract/SKILL.md` |
| Prompt inject notes | `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` |
| Create «?» UI | `.cursor/skills/content-factory-ui/` § Scriptwriter CTA cheat sheet |
| Client gate | **S46** in `client-scenarios` |
