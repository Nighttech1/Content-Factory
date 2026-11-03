---
name: brand-kit
description: Единый бренд-композитор обоих проектов. Читает design.md активного проекта и ДЕТЕРМИНИРОВАННО накладывает лого + текст/HTML/SVG-вставки поверх фона (HTML/CSS → рендер Puppeteer/Chromium в нужный размер). ИИ-генерация этого надёжно не делает — делает код. Любой визуальный шаг обязан грузить этот скилл; стиль не хардкодить в агентах.
---

# Скилл: brand-kit (единый композитор стиля)

Один источник стиля — `projects/<ACTIVE_PROJECT>/brand/design.md`. Этот скилл читает его и собирает финальный кадр. Переключение `ACTIVE_PROJECT` автоматически меняет стиль.

## Что делает
- Берёт **токены** из `design.md` (палитра, шрифты, тени, safe-zone, размеры кадров).
- Накладывает **лого** (из `веб/public/brand/vernatun-logo.svg|png`) и **текст/HTML/SVG-вставки** на HTML-слое поверх фона.
- Рендерит в PNG нужного размера через **Puppeteer/Chromium** (есть в контейнере): карусель 1080×1350, вертикаль 1080×1920, обложка YT 1280×720.
- **Без API** — чистый HTML/CSS/шрифты + headless-рендер.

## Как пользоваться (Финиш-арт / любой визуальный шаг)
1. Прочитать `ACTIVE_PROJECT` → `projects/<проект>/brand/design.md` (токены).
2. Собрать HTML-шаблон слайда: фон (картинка/цвет), текст в CG-шрифте, лого в углу, safe-zone по токенам.
3. Рендер headless Chromium в точный размер.

Пример рендера (детерминированно, без интернета):
```bash
node -e '
const {chromium}=require("playwright");
(async()=>{
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:2});
  await p.goto("file:///abs/path/slide.html",{waitUntil:"networkidle"});
  await p.screenshot({path:"/abs/out/slide-01.png"});
  await b.close();
})();'
```
HTML-шаблон слайда использует токены design.md (CSS-переменные): `--parchment:#F9F6F0; --terracotta:#C95B36; --sungold:#E6B25A; --azure:#2A5A84; --ink:#1E2930;` шрифт `Century Gothic`.

## Правила (HARD)
- Стиль — ТОЛЬКО из `design.md`; не хардкодить цвета/шрифты в агентах.
- Лого/текст — на HTML-слое, не в генерации фона. Чистое поле вокруг лого, safe-zone соблюдать.
- Выравнивание с вебом: веб-пайплайн каруселей использует ту же layered-html модель (`carousel-json-contract`, S57). Токены design.md ↔ дизайн-слоты веба держать согласованными.
- Тяжёлые PNG — во внешнее хранилище; в репо — ссылки/манифест.
- Century Gothic обязателен; Inter/системный как основной = FAIL.
