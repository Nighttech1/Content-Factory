### [C-audit-05] Empty / sparse carousel frames (white dead space + dark void)

- **Зона / Экран:** Studio drafts AUDIT-FIX A/B + deliverable PNGs
- **Факт:** S50 pickiness — B slides 01–03 = flat white with headline + bottom CTA and ~60–70% empty middle; A slide 02 = large unused black field after short headline. Looks unfinished, not publish-ready editorial carousel.
- **Ожидание:** Dense dark_notes / clean-poster composition (doodles, bridges, secondary beats, safe-zone filled intentionally) — not typography floating over blank canvas.
- **Приоритет:** P1
- **Скрин-улика:**
  - `memory/waves/2026-10-16-carousel-audit-fix/evidence/03-audit-b-slide2.png`
  - `memory/waves/2026-10-16-carousel-audit-fix/evidence/06-modal-a-slide2-asterisks.png`
  - `generatedMedia/wave-carousel-audit-fix/deliverables/b/slide_01.png`…`slide_03.png`
  - `generatedMedia/wave-carousel-audit-fix/deliverables/a/slide_02.png`
- **Зона:** AI Bridge (Designer HTML kits / layout density) + Frontend HTML-first templates
- **Wave:** 2026-10-16-carousel-audit-fix
- **Accept:** Re-render A+B; Client Playwright @1440 — mid-frame not majority empty; composition matches golden dark_notes / clean poster density
