# Wave brief — 2026-10-18-vision-style-copy

**Дата:** 2026-10-18  
**Trainer grade:** `memory/trainer/2026-10-18-vision-style-copy-grade.md` (**B** после апгрейда)  
**Canon card:** `plugins/trainer/vision-style-copy.md`  
**ticket_limit:** `full-queue`  
**shell_freeze:** AppShell / left nav — **true**

## Резюме (простым языком)

Пользователь хочет эксперимент: взять **эталонную картинку** карусели и **скопировать её стиль глазами модели** (vision), а не через слабый парсер `layoutMap` и не через огромную таблицу шрифтов Manrope/Cormorant из DESIGN.md.

Девочка-проводник рисуется **внутри фона** (`in_image`). Вырезанный cutout поверх картинки — только старый режим, не по умолчанию.

Текст и кнопки Vernatun — наши; композиция, зоны, лого/номера/частичное фото — как на эталоне.

## Locks

1. `styleCopyMode=vision_ref` — эталон как image reference в Designer/draw  
2. BAN FULL DESIGN TOKEN CARD / stock typography.scale на этом path  
3. Brand Vernatun text+CTA (+ optional logo) отдельно  
4. `characterPaint=in_image` product default; `overlay_cutout` legacy  
5. Partial/inset bg OK (не всегда full-bleed cover)  
6. layoutMap — не единственный путь  
7. Variant A + S57 layered HTML KEEP  
8. Refs: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`  
9. Smoke keep A×6: `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/`

## Proposed chain

```text
Trainer ✅
  → Architect (spec + chain.md)
  → AI Bridge
  → Backend
  → Settings FE only if needed
  → Tester
  → smoke 6-slide carousel (path A in_image)
```

## НЕ делать

- overlay_cutout как default  
- «только починить layoutMap»  
- FULL TOKEN inject на vision_ref  
- paid MCP / AppShell redesign  
