---
name: web-motion-engine
description: >-
  Motion for expensive websites: GSAP, Lenis, WAAPI, CSS, scroll-driven scenes.
  Maps Emil Kowalski rules to marketing pages. Use when adding animations,
  parallax, page transitions, sticky chapters, or hover cinema.
---

# Web Motion Engine

Реализация motion. Критика — `review-animations`. Аудит кода — `improve-animations`. Сборка с нуля по философии Emil — `emil-animate`.

## Стек (дешёвый → дорогой)

1. CSS transition / `@starting-style`
2. CSS animation / WAAPI
3. GSAP (+ ScrollTrigger) — сцены, scrub, pin
4. Lenis — гладкий скролл, не «анимация ради анимации»
5. Motion (`motion.dev`) — springs в React-приложении. **Content Factory Studio:** 21st-пасты с `motion/react` переводить на **`framer-motion`** (уже в deps); не ставить второй runtime.
6. Three/R3F — только через `three-webgl-craft` и chain

Не ставь Framer Motion + GSAP + AOS + Wow.js сразу.

## Жёсткие правила

- Анимируй **transform/opacity** (и sanctioned `clip-path`). Не width/height/top/left.
- Не `scale(0)`. Старт `0.92–0.98` + fade.
- Не `ease-in` на вход. Выход можно чуть быстрее входа.
- Микро UI: **120–200ms**. Шторки/панели: **220–320ms**. Кино на скролле: scrub, не 2s ease.
- `prefers-reduced-motion: reduce` — мгновенные состояния, без scrub-сцен.
- Скролл-сцены не блокируют контент: текст читается без WebGL.
- Hover-cinema только на маркетинге, не на формах и не на 100+ действий/день.
- **Studio dual-feed (C-61):** `transform/opacity` — для карточек/CTA, **не** для chrome шапки колонки. `showRefetchHint` opacity pulse на title/count = баг, не «тихий индикатор».
- **App Shell route enter (UX wave 2):** **запрещён** full-page / layout-wrapper `initial={{ opacity: 0 }}` → animate to 1. Цель — «как обычный сайт»: клик → сразу chrome. Допустимо: короткий fade **вложенного** блока (≤120–150ms), skeleton, или без enter-fade. Sidebar/shell **не** в opacity-0. Бюджет perceived ≤300–500ms до видимого маршрута; **замеры обязательны** (`content-factory-ui` § Nav). `prefers-reduced-motion: reduce` → без enter animation.
- **Carousel slide switch — C-131 smooth crossfade (supersedes wave3 hard cut AND wave2 fade-to-black):** смена слайда в CreateCarouselModal / Razbor preview / feed stack = **crossfade** overlapping layers (outgoing opacity→0 **одновременно** с incoming opacity→1), duration ~180–280ms ease-out / spring soft. **Запрещён:** (1) hard cut wave3; (2) **чёрная вспышка** / empty frame между кадрами; (3) unmount old → mount new с `bg-black` / canvas clear gap; (4) fade всего превью в black потом в next. Реализация: два слоя (prev/next) absolute stack **или** keep-both-until-fade-end; фон превью = тот же glass/card, не `#000` flash. L/R сбоку превью; без анимации «Слайд N/N». `prefers-reduced-motion` → hard cut OK.
- **Carousel slide switch — S48 expensive horizontal L/R (extends C-131, does not restore black flash):** смена кадра = **дорогая горизонталь**: next slide enters from L or R (`transform: translateX` ±8–16% + slight opacity), current exits opposite; duration **280–420ms** soft spring / ease-out (Emil: no ease-in entrance). **Можно** лёгкий overlapping crossfade **вместе** с translateX — но горизонталь = primary signal. **Preload:** все slide bitmaps уже в памяти до gesture (см. `content-factory-ui` § S48 preload) — motion **никогда** не ждёт network mid-swipe. **Запрещён:** (1) hang/blank на swipe; (2) layout thrash width/left; (3) fade-to-black; (4) only opacity without X travel when user asked «expensive L/R». Surfaces: Razbor + Create preview + любой module preview со слайдами. `prefers-reduced-motion` → instant cut OK (preload всё равно).
- **Schedule DnD / hover popup (wave 2 + UX-4):** короткий lift на drag (scale 1.02), drop settle ≤200ms; popup fade+Y ≤150ms. Не блокировать pointer на весь календарь.
- **Schedule sticky hover (UX wave 4):** popup слота остаётся видимым при `pointer` на popup (hit-area / bridge). **Запрет:** `pointer-events: none` на popup, если нужен hover-stay; unmount на первый leave ячейки без grace. Close: leave trigger **и** popup (+ grace ≤150ms) или Esc.
- **Schedule sticky modal Save/Cancel (UX wave 5 supersedes leave-close для edit):** один opaque sticky popup; **закрытие только Save / Cancel** (Esc OK). Клики в time / platform / controls **не** unmount. DnD **не** спавнит дополнительные floating popups. Motion: open ≤150ms spring; без fade всего календаря.
- **Schedule date↔date DnD (UX wave 4):** drag chip/слота между day-cells — тот же lift/settle; update day без full-calendar remount flash.
- **Schedule popup drag + rail resize (UX wave 8 / C-108…C-110):** popup position **не** layout-dependent от expand file-tree (portal/fixed). Drag popup: handle + transform translate (compositor); без layout thrash календаря. Rail width resize: drag handle, persist `cf.schedule.rail.width`; transition width ≤150ms optional. Reduced-motion → instant position/width.
- **Settings Floating Motion TOC (UX wave 5):** справа floating оглавление секций; scroll-spy / spring highlight активного якоря; Dark Luxury tokens; reduced-motion → без parallax.
- **MultiButton chamfer hover (UX wave 6 / C-88, C-96):** сегменты `MultiButton` — **плавное** изменение ширины при hover/focus (CSS `transition` на width 180–220ms ease-out **или** `motion` `layout` spring). **Запрет:** мгновенный пересчёт `style.width` без transition (визуальный «скачок»). Container: chamfer rect, не `rounded-full`. `prefers-reduced-motion` → width step без blur/scale label.
- **MultiButton vertical stack (UX wave 7 / C-98):** при breakpoint сужения — layout `flex-col` + flush-left; transition row→column ≤200ms layout (без jump). Reduced-motion → instant reflow.
- **Analytics filter dropdown dual-row (UX wave 7 / C-102):** top-right motion dropdown = **две строки** (content-type + platform); open spring ≤150ms; не один mixed list.
- **Mesh edge handoff labels (UX wave 8 / C-107 + C-129):** PulseEdge + human label; label fade-in ≤120ms с edge; не анимировать «JSON» chrome. **C-129:** motion/offset не «закрывает» тикет — label bbox **не** пересекает node bbox @1440; prefer short RU / gutters / hide mid-labels на dashed Trainer edges (`xyflow-agent-mesh` HARD).
- **Команда выпуска STATIC (C-139):** связи = **SVG** `stroke-dashoffset` dashflow (как artifact `.flow-dashed`); **не** xyflow `PulseEdge`. User accordion: `max-height`/`opacity` ≤350ms ease (artifact `accordion-transition`); **не** drawer slide для User. Drawer агента: slide-in ≤300ms. Reduced-motion → static strokes + instant accordion.
- **Release-team pan (C-141):** grab-pan контейнера (cursor grab/grabbing); transform translate на diagram layer; **не** ReactFlow. Click vs drag: порог ~4–6px чтобы карточки кликались. Touch: one-finger pan; не блокировать drawer open. Reduced-motion → pan без inertia.
- **Thinking 9-cube assemble + shimmer (C-158):** пока live Polza chat ждёт ответ — иконка **3×3 кубов** (assemble: кубы съезжаются / появляются stagger transform+opacity, 180–320ms loop или one-shot+hold). Рядом label **«Thinking...»** с **shimmer** (gradient mask на text или opacity sweep; compositor-friendly). **Не** width/height thrash. `prefers-reduced-motion` → static cubes + static label. Снять статус на first assistant token / error.

## Lenis

- `lerp` 0.08–0.12 на desktop. Не убивай нативный скролл на мобиле без нужды.
- На `< 768px`: native **или** Lenis с рабочим touch (`syncTouch` / актуальная опция версии). Если палец лагает — **выключи Lenis на mobile**.
- Якоря и focus должны работать.
- Не комбинируй Lenis с `scroll-behavior: smooth` на `html`.
- Полный ритуал пальца: `.claude/skills/mobile-touch-scroll/SKILL.md`.

## GSAP / ScrollTrigger

- Один ScrollTrigger на главу, не на каждый абзац.
- `invalidateOnRefresh: true` после шрифтов и картинок; `ScrollTrigger.refresh()` после ресайза/мобильного layout.
- Pin-секции: фиксируй высоту, не прыгай CLS; на mobile упрощай pin или заменяй вертикальным рассказом.
- Kill/revert при SPA unmount.
- Touch/жесты: см. `mobile-touch-scroll` (не `preventDefault` на document touchmove).

## Бюджет

| Страница | JS motion | WebGL |
|----------|-----------|--------|
| Hero + 4 главы | GSAP core + ScrollTrigger | 0 или один canvas |
| Кейс | CSS + 1 scrub | нет |
| Experience | GSAP + Lenis | по спеке Архитектора |

Подробные кривые: `emil-animate` / `RECIPES.md`. Перф: `web-perf-motion`.

## Выход

`🎞️ **MOTION:** [что движется, инструмент, reduced-motion: да]`
