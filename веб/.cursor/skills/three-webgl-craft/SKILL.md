---
name: three-webgl-craft
description: >-
  Three.js / R3F / shaders for luxury websites. Use when the Architect chain
  includes a WebGL scene, 3D hero, particles, or GPU-backed visual — not for
  ordinary UI motion.
---

# Three / WebGL Craft

3D — дорогой слой. Без строки в `chain.md` не добавляй canvas.

## Когда да

- Герой, который **не** заменить хорошим видео/типографикой
- Один объект-икона бренда
- Переход между главами, который несёт смысл

## Когда нет

- Фон «частицы как у всех»
- 3D-иконки вместо SVG
- Второй canvas «для вау» рядом с уже тяжёлым героем

## Бюджет

- Один renderer на страницу. `powerPreference: "high-performance"` только если нужен.
- DPR cap `Math.min(devicePixelRatio, 2)` (часто 1.5 на retina).
- Pause `requestAnimationFrame`, когда canvas вне viewport.
- Нет 4k HDRI + 50k точек без спеки.
- Fallback: статичный кадр / CSS. Сайт должен жить без WebGL.

## Стек

- Vanilla Three.js или React Three Fiber — как в проекте.
- Текстуры: compressed (KTX2/WebP), не PNG 8K.
- Шейдеры короткие; шум — simplex, не тяжёлый FBM в 5 октав на mobile.
- Не грузи GLTF, пока пользователь не доскроллил до сцены (кроме LCP-героя, тогда — критический прелоад одного меша).

## Доступность

- Сцена не единственный носитель смысла. Рядом текст.
- `prefers-reduced-motion` → статичный постер.
- Не перехватывать скролл страницы без Lenis-интеграции из `web-motion-engine`.

## Выход

`🧊 **WEBGL:** [сцена, полигоны/текстуры, fallback, pause-offscreen]`
