### [C-audit-04] Literal markdown asterisks painted on carousel slides

- **Зона / Экран:** Studio → Карусели → Черновики → AUDIT-FIX A (modal + PNG deliverables)
- **Факт:** На live localhost @1440 в modal и на `deliverables/a/slide_02.png` / `slide_03.png` в заголовках видны сырые `*рецепта*` и `*ритуал*` — markdown не снят до HTML/CSS paint.
- **Ожидание по DESIGN.md / S50:** On-slide copy = чистый текст (italic через CSS/`<em>`), без символов `*` в кадре.
- **Приоритет:** P1
- **Скрин-улика:**
  - `memory/waves/2026-10-16-carousel-audit-fix/evidence/06-modal-a-slide2-asterisks.png`
  - `memory/waves/2026-10-16-carousel-audit-fix/evidence/07-modal-a-slide3-cta.png`
  - `generatedMedia/wave-carousel-audit-fix/deliverables/a/slide_02.png`
  - `generatedMedia/wave-carousel-audit-fix/deliverables/a/slide_03.png`
- **Зона:** AI Bridge / Backend (sanitize Scriptwriter→Designer JSON) + Frontend render strip if any residual markdown
- **Wave:** 2026-10-16-carousel-audit-fix
- **Accept:** Playwright open AUDIT-FIX A slides 2–3 — zero `*` glyphs in visible headlines
