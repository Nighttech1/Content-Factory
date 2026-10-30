# 🧑‍💼 КЛИЕНТ — ПРИЁМКА ИТЕРАЦИИ (S57 LAYERED HTML)

**Wave:** `memory/waves/2026-10-17-layered-html-pipeline/`  
**Date:** 2026-10-17  
**Localhost:** http://localhost:3001  
**Viewport:** Playwright MCP @ **1440×900**  
**Author of code ≠ Client:** OK (Tester→Deployer→Client this turn)

---

## Вердикт: **ПРИНЯТО С ЗАМЕЧАНИЯМИ**

Layered HTML ship path accepted for S57. Score set of **4 PNG** reads as bg plate + HTML type (not type-on-PNG). Settings **Бренд** after Design still present. Taste vs etalon `#3` is in the right direction (dynamic scene, not wall of text) — not a pixel clone — but cut-out kinetic energy of `#3` is only partially matched (no hero in this smoke).

---

## HARD GATE evidence (Playwright MCP)

| Step | Evidence |
|------|----------|
| Resize 1440 | `browser_resize` 1440×900 |
| Navigate | `http://localhost:3001/settings` → click **Бренд** → `http://localhost:3001/studio` → click **Карусели Instagram** → `/studio/carousel-engine` |
| Snapshot | Brand panel active: name `Vernatun`, logo preview, «Сохранить бренд»; nav order Design → Brand → Персонажи |
| Screenshot | `client-s57-settings-brand.png`, `client-s57-studio.png` |
| Score PNG (Read) | `docs/карусель тест/layered-smoke-4/slide_01…04.png` + etalon `03-website-fast-cutout.png` |

---

## S57 checklist

### A) Single layered render

| Assert | Result |
|--------|--------|
| Product path = bg + HTML/Puppeteer (not type-on-PNG ship) | **PASS** — crisp HTML type/logo/CTA over photographic plates; timeline `pipeline: layered_html` |
| Finals 1080×1350 ×4 | **PASS** |
| CTA HTML button on cta slide | **PASS** — slide 04 gold button «Напишите в комментариях» (catalog 1) |
| Brand on HTML | **PASS** — VERNATUN top-left on all 4 |

### B) Bg ban + Brand + vision

| Assert | Result |
|--------|--------|
| Bg plates without baked letters/logos | **PASS** (visual review slides 01–04) |
| Settings Brand after Design | **PASS** (Playwright click + snapshot) |
| Персонажи present | **PASS** (nav + empty catalog OK; hero was null in smoke row) |
| Vision OFF | **PASS** (timeline/README + Tester guards) |

### C) Smoke folder + etalon taste

| Assert | Result |
|--------|--------|
| Old `smoke-useful-51-1-17` gone/empty | **PASS** (0 files) |
| ONE 4-slide folder `layered-smoke-4` + timeline/README | **PASS** |
| Budget 4 finals | **PASS** |
| Taste vs etalon #3 spirit (dynamic, not wall of text; invent OK) | **PASS with notes** — cinematic scenes + short primary + secondary; **not** wall of text. Missing #3’s cut-out / cross-frame kinetic punch (hero empty). Layout chrome (gold underline + text stack) repeats across slides more than #3’s invent energy. |

---

## Замечания (не блокируют PASS)

| Sev | Note |
|-----|------|
| P2 | Нет cut-out персонажа → слабее дух эталона `#3`; для следующего smoke задать hero / Персонажи. |
| P2 | Композиция HTML-слоя похожа слайд-к-слайду (brand + heading + gold rule + body); invent layout можно смелее. |
| P3 | Cover secondary чуть «вода» («простым и увлекательным…») — body tips (02–03) уже практичнее. |

**No P0/P1.** Prod/VPS не согласован этим вердиктом.

---

## C-* (optional follow-ups — not blockers)

- None opened as FAIL tickets. Optional polish: `C-s57-cutout-taste` (hero cut-out energy closer to #3) if product wants tighter etalon match.

---

## Следующий шаг

Оркестратору: волна S57 может закрываться с замечаниями P2. VPS — только после явного «да» пользователя. Guards: `memory/waves/2026-10-17-layered-html-pipeline/guards.md`.
