# Плагины — client (Content Factory)

| Name | Type | Path | When |
|------|------|------|------|
| **client-scenarios** | skill | `.cursor/skills/client-scenarios/SKILL.md` | **клики, fill, wait, assert смены UI** |
| client-review | skill | `.cursor/skills/client-review/SKILL.md` | вердикт, guards |
| client-review / mobile-qa | skill doc | `.cursor/skills/client-review/mobile-qa.md` | iPhone/Android |
| web-visual-critic | skill | `.cursor/skills/web-visual-critic/SKILL.md` | арт-дирекшн |
| ticket-engine | skill | `.cursor/skills/ticket-engine/SKILL.md` | формат C-* |
| taste-skill | skill | `.cursor/skills/taste-skill/SKILL.md` | anti-slop |
| Playwright desktop | MCP | `playwright` @ 1440 | **сценарии + глаза** |
| Playwright iPhone | MCP | `playwright-iphone` | сценарии iOS |
| Playwright Android | MCP | `playwright-android` | сценарии Android |
| Chrome DevTools | MCP | `chrome-devtools` | сеть / консоль / perf |
| Image Compare / A11y / Lighthouse | MCP | `.cursor/mcp.json` | diff, a11y, CWV |

## Опционально позже (не блокер)

| Name | When |
|------|------|
| Stagehand MCP | если DOM часто «плывёт» и селекторы ломаются — `act`/`extract`/`observe` |
| Browser-Use MCP | не нужен для своей Studio; только чужие сложные сайты |

## Важно

Playwright MCP — это **не только фото**. Клиент обязан: snapshot → click/type → wait → assert → screenshot.
