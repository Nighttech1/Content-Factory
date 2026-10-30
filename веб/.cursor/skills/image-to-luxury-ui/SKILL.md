---
name: image-to-luxury-ui
description: >-
  Перерисовка экрана/окна в premium luxury web UI по одной референс-картинке.
  Workflow: reference → DESIGN.md → HTML/React + GSAP/Lenis motion. Не Flutter.
---

# Image → Luxury UI

Используй когда пользователь даёт **одну картинку** (скрин, мокап, референс) и просит premium-редизайн с люкс-анимациями.

## Стек (обязательно)

**Не Flutter.** Для premium visual + scroll/micro-motion:
- **Next.js / React** или чистый HTML/CSS/JS
- **GSAP + ScrollTrigger** — сцены, stagger, timeline
- **Lenis** — smooth scroll (один движок на страницу)
- Токены: `DESIGN.md` в корне UI-пакета

## Workflow

1. **Референс** — разобрать композицию, типографику, материалы, ритм, акценты (можно через vision MCP / скрин).
2. **DESIGN.md** — `.cursor/skills/create-design-md/SKILL.md` (режим image/screenshot).
3. **Вёрстка** — `.cursor/skills/luxury-web-craft/SKILL.md` + `design-token-guardian`.
4. **Motion** — chain зовёт Motion: `web-motion-engine`, `emil-animate`, `review-animations`.
5. **Приёмка** — Клиент: Playwright + image-compare MCP, `web-visual-critic`.

## Когда Flutter остаётся

Flutter (`sputnik_flutter/`) — для data-heavy Life OS (таблицы, sync, offline). Premium shell — отдельный web-слой или embed WebView только если Архитектор явно разрешил в chain.

## Антипаттерны

- Переносить luxury scroll в Flutter Web — джанк и слабый motion.
- Копировать картинку пиксель-в-пиксель без DESIGN.md.
- Несколько scroll-библиотек сразу.

`🖼️ **IMAGE→LUXURY:** [референс; DESIGN.md; стек; motion plan]`
