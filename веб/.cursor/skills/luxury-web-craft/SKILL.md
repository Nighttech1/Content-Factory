---
name: luxury-web-craft
description: >-
  Craft expensive marketing and brand websites: typography, materials, 8pt grid,
  anti-slop, DESIGN.md tokens. Use when building luxury sites, landing pages,
  studio sites, case-study layouts, or when Frontend implements visual tickets.
---

# Luxury Web Craft

Пишешь HTML/CSS/JS или React/Next/Vue. Не объявляешь приёмку — это Клиент.

Канон: `DESIGN.md` в корне проекта побеждает вендорские скиллы и `ui-ux-pro-max`.

## Skill-first

1. Этот файл + [materials.md](materials.md)
2. **Адаптив:** `.cursor/skills/responsive-mobile-web/SKILL.md`
3. **Палец/скролл:** `.cursor/skills/mobile-touch-scroll/SKILL.md`
4. Motion: `.cursor/skills/web-motion-engine/SKILL.md` + `emil-animate` / `review-animations`
5. 3D только если спека: `.cursor/skills/three-webgl-craft/SKILL.md`
6. Анти-slop: `taste-skill` (запреты), генерация направления: `ui-ux-pro-max --design-system` **не** перебивает токены
7. `/audit`: `design-token-guardian` + `plugins/frontend/anti_slop_scan.py`
8. Самопроверка MCP: `playwright-iphone` + `playwright-android` перед сдачей

## Барьер цены

Сайт должен выглядеть как работа студии (Lusion / Active Theory / Basic / Pentagram-web), не как шаблон SaaS.

- Иерархия за 0.5 сек: одна доминанта на экран
- Тип важнее декора: 2 семейства максимум, оптический размер, нормальный tracking
- Материалы: бумага, металл, стекло, плёнка — не «карточки в тени»
- Пустота платная: крупные поля, не сетка из 8 одинаковых карточек
- Фото/видео реальные или честно абстрактные. Запрещены стоковые улыбки и 3D-иконки из UI-кита

## Запреты (AI slop)

- Сине-фиолетовый градиент, indigo glow, «mesh gradient hero»
- Чистый `#000` + серые Card на всё
- Inter/Roboto как единственный голос люкса без причины
- `box-shadow: 0 20px 50px` на каждую плитку
- Бесконечный `backdrop-filter` blur
- Анимация «потому что можно»

## Стек по умолчанию

Дешёвый инструмент, который тянет задачу:

| Задача | Инструмент |
|--------|------------|
| Маркап и сетка | HTML + CSS (Grid/Flex), 8px |
| Компоненты | React/Next или Vue — если проект уже на них |
| Скролл | Lenis или CSS `scroll-behavior` |
| Motion UI | CSS / WAAPI / GSAP — см. web-motion-engine |
| 3D | Three / R3F — только по chain |

## Порядок

1. Прочитай `chain.md` — только свои paths.
2. Если меняется язык — сначала `DESIGN.md`, потом токены, потом блоки.
3. Собери богатство ремеслом, не количеством секций.
4. Прогони anti-slop scan + reduced motion.

## Выход

`🎨 **FRONTEND:** [страницы/блоки]; craft-audit: ok|список`
