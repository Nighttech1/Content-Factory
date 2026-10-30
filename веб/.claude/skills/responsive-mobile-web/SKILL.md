---
name: responsive-mobile-web
description: >-
  Premium landing mobile adaptation: breakpoints, single-column collapse,
  safe-area, touch targets, no horizontal overflow. Use when Frontend (A) or
  Client adapts or accepts luxury sites on iPhone/Android viewports.
---

# Responsive Mobile Web (premium landing)

Профиль **Frontend A** + приёмка **Клиента**. Не Flutter. Код пишет Frontend; Клиент только смотрит и тикетует.

## Skill-first

1. Этот файл + [breakpoints.md](breakpoints.md)
2. Анти-slop: `taste-skill` §3.E / mobile collapse
3. UX-поиск: `ui-ux-pro-max` `--domain ux` → layout & responsive
4. Крафт: `luxury-web-craft` (токены `DESIGN.md` побеждают)
5. Пальцевый скролл/интерактив: `mobile-touch-scroll`
6. Глаза: MCP `playwright-iphone`, `playwright-android` (+ desktop `playwright`)

## Обязательные ширины

| Имя | CSS width | MCP |
|-----|-----------|-----|
| iPhone logical | 390 | `playwright-iphone` (device iPhone 15) |
| Android mid | 412 | `playwright-android` (device Pixel 7) |
| Small phone | 375 | resize в том же MCP при регрессе |
| Tablet | 768 | desktop `playwright` + `browser_resize` |
| Desktop | 1440 | `playwright` |

Не сдавай мобилку, пока нет скринов **минимум 390 и 412** по ключевым главам (hero, mid, footer).

## Жёсткие правила вёрстки

- Mobile-first: база = одна колонка; `md:` / `lg:` наращивают сложность.
- Каждый multi-column блок явно объявляет fallback `< 768px` в том же компоненте.
- Нет горизонтального скролла `document` / `body`. `overflow-x: clip` на корне при необходимости.
- Hero: `min-height: 100dvh` (не `100vh` — прыжок Safari).
- Safe area: `padding` с `env(safe-area-inset-*)` у fixed nav/CTA/footer.
- Touch targets ≥ 44×44 CSS px; между интерактивами ≥ 8px.
- Не полагайся на hover: те же действия доступны tap / `:active`.
- Крупная типографика на 390: заголовок не обрезан, CTA виден без горизонтального жеста.
- WebGL/тяжёлый canvas: упрощённый или static fallback на `< 768px` (см. `three-webgl-craft`).
- Fixed/sticky панели не перекрывают CTA и не крадут высоту без `dvh`/`svh`.

## Порядок работы Frontend

1. Прочитай `chain.md` и `DESIGN.md` — не ломай бренд-токены ради «сжатия».
2. Пройди секции сверху вниз: nav → hero → главы с интерактивом → footer.
3. На каждой главе: колонки → тип → отступы → overflow → tap.
4. Самопроверка MCP: iPhone + Android скрины до сдачи Тестировщику/Клиенту.
5. Motion/скролл-сцены — вместе с `mobile-touch-scroll` (не оставляй «потом»).

## Hard fail (Клиент выписывает C-* P0/P1)

- Горизонтальный скролл страницы на 390/412
- Обрезанный заголовок / недоступный CTA
- Сетка «россыпью» вместо одной колонки
- Интерактив только по hover
- Контент под вырезом/домашней полоской без safe-area

## Content Factory — S47 mobile notes

| Surface | Mobile rule |
|---------|-------------|
| Dual feed cards | Engagement row на фото не обрезается; plaque username truncates с ellipsis; dual columns → stack `< md` (уже wave3) |
| Razbor / Create modal | Full-viewport sheet на `< md`; **scroll lock body**; overscroll-contain на dialog — фон студии **не** скроллится пальцем |
| Preview crop | 9:16 / 4:5 без горизонтального overflow; index `N/M` читаем |
| Marketing Director | Projects rail → drawer/collapse `< md`; welcome + AIInput; после send composer sinks без перекрытия home-indicator (safe-area) |
| Font | Century Gothic остаётся; не уменьшать engagement ниже читаемого (~11–12px min) |

## Выход

`🎨 **FRONTEND:** responsive-mobile; viewports: 390+412 [+375/768]; overflow: ok|fail`
