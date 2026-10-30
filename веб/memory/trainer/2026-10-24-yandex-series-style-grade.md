# Trainer grade — 2026-10-24 yandex + soft series style

- **grade:** A (пробелы закрыты до кода)
- **ticket_limit:** default≤3
- **пробелы:** жёсткий orange bottom-left chip душил вёрстку; HY мог быть «с воздуха»; GPT Image дорого
- **добавлено/усилено:**
  - soft rule: одинаковый дизайн *смысловых* блоков, свобода layout
  - vocab colors = Design MD hex (не locked orange)
  - HY обязан быть в сценарии и связан с тезисом слайда (body содержит RU-смысл)
  - image model → `yandex/yandex-art`
- **команда готова:** да (к коду)
- **после live `46f46a82`:** YandexART на агрегаторе SERVICE_UNAVAILABLE; Gemini flash image **не умеет** точный RU/HY type-on-PNG → AD BLOCKED. Усилить: не рисовать instruction text; для текста на кадре нужен image-model с glyph fidelity или layered HTML.