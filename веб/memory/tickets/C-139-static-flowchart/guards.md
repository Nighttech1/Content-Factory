# Guards — C-139 static flowchart

## Assert Playwright @1440 `/studio/carousel-engine/mesh`

1. No `.react-flow` / no MeshPipelineSwitcher MultiButton
2. Agents visible: Пользователь, Разборщик, Копирайтер, Дизайнер, Публицист, Скаут, Аналитик, Тренер
3. Labels: запрос, разбор, сценарий, медиа, фильтр, выводы
4. No dashed mid-text: дообучение / корректировка / skill patches
5. design.md chip on Designer
6. Copy TZ button present
7. User click → brief accordion (джаз/ЦА); drawer stays closed until agent click
8. Agent click → drawer tabs: Инструкция | Скиллы & Инструменты | Модель & Параметры
9. User card not clipped under sidebar (`left >= main.left`)

## Evidence 2026-10-10

- Static PASS: no xyflow, no MultiButton, all labels/agents, design.md, Copy TZ
- User accordion + drawer 3 tabs PASS
- Layout fix: page negative margin removed; flowchart left-aligned + pl-16
