# Клиент — вердикт волны E2E image carousel (S53 HARD)

**Дата:** 2026-10-16  
**Роль:** Клиент (не автор кода)  
**Маршрут:** `http://localhost:3001/studio/carousel-engine`  
**Viewport:** Playwright MCP desktop **1440**

---

## Вердикт

**ПРИНЯТО С ЗАМЕЧАНИЯМИ**

S53 HARD (HTML text overlay как primary paint path) — **не сработал reject**.  
Основной путь рисования: **E2E DIFFUSION** (текст в пикселях картинки), не HTML/CSS overlay.

---

## HARD GATE — Playwright @1440

| Шаг | Результат |
|-----|-----------|
| `browser_resize` 1440×900 | ok |
| `navigate` `/studio/carousel-engine` | ok |
| Click вкладка **Черновики** (счётчик 2) | ok |
| Click черновик **E2E A** (`draft-e2e-a`) | ok — открылся dialog разбора |
| RIGHT preview | slide **1/3**, img `/generated/carousel/e2e-a-…/slide_01.png` (1122×1402, loaded) |
| DOM overlay (`[class*=overlay]`, `data-html-overlay`, `.carousel-html-overlay`) | **0** |
| Screenshot | `memory/waves/2026-10-16-e2e-image-carousel/client-draft-e2e-a-1440.png` |

**RIGHT preview не пустой:** на слайде виден заголовок «Буква дышит?» (белый + золото), крупная буква с дымом/светом, body copy, логотип VERNATUN — типографика **вшита в PNG**, не отдельный HTML-слой поверх фона.

---

## Доказательства вне UI (файлы волны)

### MD 10–13 (`docs/карусель тест/`)

- Designer sessions: `Paint path: E2E DIFFUSION — image-2 paints scene + typography in pixels`
- Meta на слайдах: **`html_overlay=none`**
- Промпты содержат `Paint EXACT readable headline …` + body/CTA
- Post-process: Legacy Playwright/HTML text **skipped**; paint path `e2e_diffusion`

### PNG артефакты

`generatedMedia/wave-e2e-image-carousel/{a,b}/slide_01..03.png` — 6 файлов, все с читаемой встроенной типографикой (не blank / не «фон + пусто»).

### Код (проверка контракта, не замена Playwright)

`runCreateCarouselDraw` — Phase4 E2E по умолчанию ON (`CAROUSEL_E2E_TEXT_IN_IMAGE !== "0"`): generate image → skip `carouselHtmlBuilder` + Playwright text overlay.

---

## Честная оценка качества vs «expensive Instagram»

**В целом — да, уровень дорогой IG-карусели**, не «фиолетовый AI-slop» и не плоский HTML-макет.

| Карусель | Сильные стороны | Слабые места |
|----------|-----------------|--------------|
| **A** (буквы / Маштоц) | Кинематографичный свет, текстура камня/металла, буква взаимодействует с паром, золото Vernatun, иерархия cover→point→CTA | AI-глифы иногда «живописные» (не идеальная типографика студии); CTA-пилюля чуть «шаблоннее» сцены |
| **B** (Севан / пауза) | Сильный cover с озером и текстурным headline; mid-slide с контурами по воде — ощущение интеграции; sunset CTA атмосферный | Body/CTA чуть слабее «журнального» ядра A; бренд `sevam_silence` на CTA уместен, но не Vernatun |

Итог по вкусу: **выше mid-tier AI carousel**; для приёмки волны S53 достаточно. До «топ-редакционного IG-агентства» — ещё полировка глифов и стабильность CTA-кнопки.

---

## Замечания (не валят S53)

1. **P2 — кракозябры в названиях черновиков** в списке Черновики: `E2E A: ??????? / ??????` (кодировка/шрифт в label карточки). Сам preview и PNG — нормальные русские буквы. Ожидание: читаемые заголовки в списке.
2. **P3 — chrome:** вкладка отображается как «Черновики2» без пробела; заголовок modal «Разбор конкурента» при открытии **нашего** черновика — путаница формулировки.

Тикеты на оркестратор (по желанию следующей волны):  
- `C-e2e-draft-title-encoding` [P2]  
- `C-razbor-ours-modal-title` [P3]

---

## S53 checklist

| Критерий | Статус |
|----------|--------|
| HTML overlay **не** primary | ✅ PASS (`html_overlay=none`, E2E default ON) |
| Промпты с headline text | ✅ PASS (MD 11/13) |
| PNG не пустые, type baked-in | ✅ PASS (a/b × 3) |
| Live Черновики → draft-e2e-a → RIGHT preview с типографикой | ✅ PASS (Playwright screenshot) |
| Quality ≥ expensive IG (честно) | ✅ достаточно для ПРИНЯТО; не идеал |

---

## Следующий шаг

Оркестратору: зафиксировать закрытие S53 / C-e2e paint path с guard; мелкие P2/P3 — в следующую пачку или оставить. Prod не трогать без отдельного согласования.
