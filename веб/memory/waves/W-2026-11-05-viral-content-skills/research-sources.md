# Внешние источники и проверка

Поиск GitHub выполнен 2026-11-05 через публичный GitHub Search API по запросам
Reels/video editing skills, Remotion reels templates и Instagram carousel skills.
Звёзды и описания — снимок на дату поиска; это не оценка качества или способности
обеспечить охват.

| Репозиторий | Наблюдение | Решение |
|---|---|---|
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | зрелый агентный видеопроект, широкий набор пайплайнов и production files | изучить выборочно позже; не импортировать огромную систему в текущий ручной процесс |
| [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | 4.5k+ stars в снимке поиска; локальный video editing skill + MCP tools | не копировать его MCP/код; использовать как ориентир по явным video tool contracts |
| [0xsline/OpenChatCut](https://github.com/0xsline/OpenChatCut) | зрелый local-first video editor с agent skills и timeline | возможный будущий инструмент, сейчас не подключён и не установлен |
| [EricTechPro/instagram-carousel-skills](https://github.com/EricTechPro/instagram-carousel-skills) | небольшой проект с исследованием/копирайтом и branded 1080x1350 slides | идеи композиции адаптированы; малое число stars не трактовать как качество |
| [ishort-pro/instagram-claude-skills](https://github.com/ishort-pro/instagram-claude-skills) | набор ролей для Reels, каруселей, календаря и анализа конкурентов; связан с IShort MCP | MCP/платформа не добавлены: сторонняя зависимость не подтверждена/не нужна для MVP |
| [LeFrancilien/remotion-reels-starter](https://github.com/LeFrancilien/remotion-reels-starter) | небольшой data-driven 9:16 Remotion starter | шаблонный подход можно применить в локальном motion skill; код не импортирован |

Hugging Face API query `video editing` вернул модели/демо, но подходящего переносимого
skill/plugin/MCP для этих чатов не обнаружено. В текущем инструментальном списке
нет Plugin Management, а подключать Hugging Face модель как агентский skill нельзя.

Не скопированы внешние файлы и зависимости. Добавлены оригинальные внутренние
инструкции с ссылками на источник и локальными критериями проверки.
