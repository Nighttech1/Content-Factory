# Touch scroll checklist — premium landing

Прогон на **iPhone 15** (`playwright-iphone`) и **Pixel 7** (`playwright-android`).

## База

- [ ] Вертикальный флик по странице плавный, без рывков
- [ ] Нет `preventDefault` на document `touchmove`
- [ ] `html`/`body` без `overflow: hidden` «навсегда» после меню (меню закрылось → скролл жив)
- [ ] Burger/menu: open/close не ломает последующий скролл
- [ ] Address bar iOS: hero не прыгает (`dvh` / `svh`)

## Lenis / smooth

- [ ] На mobile либо native, либо Lenis с рабочим syncTouch
- [ ] Нет двойного smooth (`Lenis` + CSS `scroll-behavior: smooth`)
- [ ] Якорные ссылки доезжают

## Интерактивные главы

- [ ] Pin/scrub не блокирует выход из главы пальцем
- [ ] Horizontal chapter: вертикальный жест не «съеден» навсегда
- [ ] После pin — нет дыры/наложения секций
- [ ] Tap по CTA внутри сцены срабатывает (не только hover)

## Перф

- [ ] Нет видимого jank на mid-scroll скрине/записи
- [ ] Тяжёлые эффекты упрощены на `< 768px`
- [ ] `prefers-reduced-motion` читаем
