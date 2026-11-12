# V-202611-CAR-02 · Visual Pipeline Log

Тип: 1 · Словарь
Тема: армянские фразы для новичка на разговорной встрече
Цель: снять страх начать разговор и пригласить на встречу Vernatun
Формат: статичная карусель 1080×1350

## Гейты

| Этап | Роль | Статус | Доказательство |
|---|---|---|---|
| 00 | Клиентский brief | ACCEPTED | это задание чата |
| 01 | Тренер | ACCEPTED | 4 heroine refs, logo asset, type-1 rules and PNG QA confirmed |
| 02 | Сценарий | ACCEPTED | 6-slide journey, 4×3 phrase pairs, hook/final CTA |
| 03 | Арт-директор | ACCEPTED | six scene prompts; varied poses and clean text zones |
| 04 | Генерация | ACCEPTED | six new heroine backgrounds |
| 05 | Background QA | ACCEPTED | montage review: no logo/cards/pseudo-text; heroine on all frames |
| 06 | Bake | ACCEPTED | six 1080×1350 PNGs; logo and text layers composited |
| 07 | Design QA | ACCEPTED | contact-sheet review; slide 5 returned once for text-position defect |
| 08 | Fixer | ACCEPTED | slide 5 card gravity corrected; logo transparency cleaned |
| 09 | Final QA | ACCEPTED | dimensions, slide count, 3×4 phrase count and visual montage checked |
| 10 | Внутренний клиент-дизайнер | CLIENT_DESIGN_ACCEPTED | сама просмотрела contact sheet и все слайды; композиция принята |
| 11 | Внешний клиент | CLIENT_REVIEW | ждём твоего визуального согласования |

## Стоп-правила

- Наша героиня должна быть в каждом AI-фоне.
- Референсная картинка используется только для официального логотипа.
- Средние слайды: ровно 3 армянские фразы + перевод на каждом.
- AI-фон не содержит логотипа, псевдотекста и встроенных карточек.
- Bake получает только принятые фоны.
- Ни один этап не объявляется принятым без визуального доказательства.
- Архив нельзя отдавать внешнему клиенту до `CLIENT_DESIGN_ACCEPTED`.

## QA-заметка

Первая версия bake была возвращена на исправление: на слайде 5 часть текста вышла за карточки. После исправления повторно проверены отдельный слайд и общий contact sheet: все три фразы находятся внутри карточек, читаемы и не пересекаются с героиней.

## Артефакты

- `final_png_v3/contact-sheet-final.png` — общий визуальный контроль.
- `final_png_v3/01-hook.png` … `06-final.png` — шесть финальных PNG после bake.
- `V-202611-CAR-02-script.md` — согласованный сценарий.
