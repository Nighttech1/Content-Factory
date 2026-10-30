# Команда РАЗРАБОТКИ веб-приложения (не работники контент-завода)

> Эти агенты строят **веб-приложение** Content Factory (папка `веб/`). Их цикл — `веб/CLAUDE.md`
> (Тренер → Архитектор → Frontend/Motion/Backend/AI Bridge/Кодер → Тестировщик → Фиксер → Деплоер → **Клиент**).
> Пользователь общается **только с Клиентом**; финал — словами Клиента после «согласовано».
>
> ⚠️ НЕ путать с **работниками контент-завода** (`projects/<проект>/.claude/agents/`:
> `content-director`, `reel-lead`, …) — те производят КОНТЕНТ (планы/рилсы/карусели), а эти пишут КОД.
>
> Правила ролей — `веб/.claude/rules/<role>.md`. Скиллы — `веб/.claude/skills/`. Плагины — `веб/plugins/<role>/`.
> Реестр — `веб/.claude/registry/agents.md`.

## Состав
| Агент | Роль-метка | Правило |
|---|---|---|
| orchestrator | 🧩 ОРКЕСТРАТОР | rules/orchestrator.md |
| client | 🧑‍💼 КЛИЕНТ | rules/client.md |
| architect | 🏗️ АРХИТЕКТОР | rules/architect.md |
| frontend | 🎨 FRONTEND | rules/frontend.md |
| motion | 🎞️ MOTION | rules/motion.md |
| backend | ⚙️ BACKEND | rules/backend.md |
| ai-bridge | 🤖 AI BRIDGE | rules/ai-bridge.md |
| coder | 🧰 КОДЕР | rules/coder.md |
| tester | 🧪 ТЕСТИРОВЩИК | rules/tester.md |
| fixer | 🔧 ФИКСЕР | rules/fixer.md |
| deployer | 🚀 ДЕПЛОЕР | rules/deployer.md |
| trainer | 🎓 ТРЕНЕР | rules/trainer.md (+ agents/trainer.md) |
| art-director | 🎨 ART DIRECTOR | rules/art-director.md (+ agents/art-director.md) |
