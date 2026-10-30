---
name: mobile-touch-scroll
description: >-
  Finger-smooth scroll and interactive scroll scenes on iPhone/Android for
  premium landings (Lenis, GSAP ScrollTrigger, horizontal chapters). Use when
  Frontend A or Motion adapts touch scrolling, or Client accepts mobile motion.
---

# Mobile Touch Scroll (premium)

Цель: на телефоне палец листает **так же плавно**, как колесо/Lenis на десктопе. Интерактивные главы (горизонтальный scrub, pin, sticky-stack) не рвут жест и не блокируют нативный скролл без нужды.

Роли: **Frontend A**, **Motion**, приёмка **Клиент**.

## Skill-first

1. Этот файл + [touch-checklist.md](touch-checklist.md)
2. `web-motion-engine` (Lenis / GSAP бюджет)
3. `web-perf-motion` + `fixing-motion-performance` при джанке
4. `responsive-mobile-web` для сетки/overflow
5. Глаза: `playwright-iphone` / `playwright-android` — жест скролла + скрины mid-scroll

## Жёсткие правила

### Палец = основной ввод

- Не отключай `touch-action` глобально на `body`/`html`.
- Интерактивные зоны: явный `touch-action: pan-y` (вертикаль) или `pan-x` (горизонтальная глава).
- Не ставь `touch-action: none` на всю страницу — только на узкий canvas/drag, если ТЗ требует.
- Слушатели touch/wheel: `{ passive: true }`, если не вызываешь `preventDefault`.
- Не вызывай `preventDefault` на `touchmove` у document — классическая причина «сайты не скроллятся».
- **Studio dual-feed (C-61):** каждая колонка — свой `overflow-y` + `overscroll-behavior: contain`. Wheel/touch не должны прокручивать соседнюю колонку или `body`.

### Lenis на мобиле

- По умолчанию на `< 768px`: **либо** нативный smooth (без Lenis), **либо** Lenis с `syncTouch: true` / актуальной touch-опцией версии в проекте.
- Не комбинируй Lenis + `scroll-behavior: smooth` на `html`.
- `lerp` на touch чуть выше десктопа допустим (0.1–0.15), но без «резины» и без потери 1:1 с пальцем.
- Если Lenis на touch лагает или глотает жест — **выключи Lenis на mobile**, оставь native; люкс = плавность, не бренд библиотеки.
- Якоря, keyboard focus, browser back — не ломай.

### GSAP / ScrollTrigger

- `ScrollTrigger.normalizeScroll(true)` — только если доказан конфликт; иначе часто хуже на iOS.
- После шрифтов/картинок/ресайза: `ScrollTrigger.refresh()`.
- Pin-секции: фиксированная высота трека; на mobile упрощай (меньше pin-дистанции) или заменяй на короткий scrub / статичный layout.
- Горизонтальные главы: на mobile предпочти **вертикальный** рассказ или короткий snap; длинный horizontal pin часто ломает палец.
- Один ScrollTrigger на главу; kill/revert при unmount.
- `invalidateOnRefresh: true`.

### Производительность жеста

- Анимируй только `transform` / `opacity` (и sanctioned clip-path).
- Не `filter` / тяжёлый blur на скроллящихся слоях.
- Grain/noise — только `position: fixed; pointer-events: none`, не на scroll-контейнере.
- WebGL: pause offscreen; на mobile — static poster, если FPS < 50.
- Цель: визуально ≥ 50–60 fps при флике пальцем по localhost-эмуляции.

### Reduced motion

- `prefers-reduced-motion: reduce` → без scrub/pin cinema; обычный скролл контента остаётся.

## Порядок внедрения

1. Проверь, скроллится ли страница **нативным** пальцем без библиотек.
2. Подключи Lenis/GSAP так, чтобы жест не деградировал (см. правила выше).
3. Пройди каждую интерактивную главу на `playwright-iphone` и `playwright-android`:
   - drag/swipe вниз и вверх;
   - mid-chapter screenshot;
   - нет «залипания», нет борьбы двух скроллов.
4. Lighthouse mobile (MCP `lighthouse`) — INP/TBT не раздуты скролл-логикой.

## Hard fail для Клиента (C-* P0/P1)

- Страница не скроллится пальцем / скролл «резиновый» или рваный
- Горизонтальная сцена перехватывает вертикальный жест без выхода
- После ухода с pin — контент прыгает (CLS) или мёртвая зона
- Hover-only управление сценой на телефоне

## Выход

`🎞️ **MOTION/TOUCH:** lenis: on-mobile|native; ST refresh: yes; touch-action: ok; fps: ok|jank`
