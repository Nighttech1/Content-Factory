---
name: flutter-motion-engine
description: >-
  Emil Kowalski motion rules adapted to flutter_animate: 120–200ms springs,
  no ease-in, Transform/Opacity only. Use for Flutter UI motion. For websites
  use web-motion-engine instead.
---

# Flutter Motion Engine

Адаптация Emil Kowalski (`emil-design-eng`, `review-animations`) под **Dart**.  
Полные кривые: `emil-animate` / `review-animations`. Для веба — `web-motion-engine`.

## Стек

Разрешено: `flutter_animate`, `AnimationController`, `Transform`, `Opacity`, `SlideTransition`, `RepaintBoundary`.  
Запрещено: Framer Motion, CSS `transition`, `Curves.easeIn` (и `easeIn*` кроме необходимости `easeInOut` на кроссфейде цвета — лучше не использовать).

## Бюджеты

| Тип | ms | Кривая |
|-----|-----|--------|
| Press | 120–160 | scale 0.97–0.98, easeOutCubic / spring |
| Micro (pill, toggle, row) | 150–200 | spring / `Curves.easeOutCubic` |
| Шторка премодерации | 220 | `Curves.decelerate` |
| Page | ≤ 280 | easeOut |

100+/день (IndexedStack, хоткеи) — **без** анимации.

## Нельзя

- `scale(0)` → старт 0.92–0.97 + opacity
- Анимация width/height/margin
- Декоративный бесконечный glow
- Копипаста `animate={{`

Перед сдачей: `design-token-guardian` поймает `Curves.easeIn`.
