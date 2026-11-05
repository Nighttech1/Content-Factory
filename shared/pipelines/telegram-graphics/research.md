# Исследование готовых решений для Telegram-карточек

Дата проверки GitHub API и Hugging Face Spaces API: 2026-11-05. Число stars —
снимок поиска, динамическая метрика; не показатель качества или вирусности.

## Лучшее соответствие проекту

1. **`shared/skills/brand-kit/SKILL.md` — уже в репозитории.** Самое точное решение
   для обязательной части: берёт наши бренд-токены и детерминированно накладывает
   лого/текст HTML/CSS/SVG поверх фона, затем рендерит через Chromium. Не нужен
   отдельный ChatGPT plugin для логотипа.
2. **`shared/skills/publisher-telegram/SKILL.md` — уже в репозитории.** Описывает
   отправку фотографий через Telegram Bot API `sendPhoto` и human-approval gate.
   В README указан Bot API, но кодовый scheduled consumer этой очереди при аудите
   не найден; нужна отдельная проверка существующего бота/расписания.
3. **`shared/skills/marketing-methods/modules/visual.md` — уже в репозитории.**
   Использовать как метод арт-дирекшена для композиции, точного текста, прав,
   safe-zones и реального просмотра экспорта. Новый узкий pipeline skill
   `telegram-graphics` дополняет его правилами цитат/анонсов и обязательного logo bake.

## Внешние GitHub-кандидаты

| Решение | Stars на дату проверки | Применение | Вердикт |
|---|---:|---|---|
| [anthropics/skills — canvas-design](https://github.com/anthropics/skills/tree/main/skills/canvas-design) | 187,573 у репозитория | Художественная концепция и оригинальные статичные изображения | Можно брать как необязательный источник идей для чистого фона. Свободная художественная композиция не заменяет шаблоны, точные данные, бренд-токены и HTML logo bake; не копировать в наш процесс как обязательный генератор |
| [vercel-labs/agent-skills — web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | 33,567 у репозитория | Проверка веб-интерфейсов | Для PNG-карточек Telegram слабое соответствие; не подключать |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | 6,389 | Рендер видео/движущихся графических сцен | Уместно только для будущих animated announcements; текущие статичные картинки проще и надёжнее делать через наш HTML/CSS → Chromium |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | 209,603 | Cron/workflow integrations, в т.ч. внешние API | Это развёртываемая платформа, не skill/plugin. Рассматривать лишь если существующий бот не умеет читать очередь и публиковать по времени; не добавлять новый сервис до аудита бота |
| [grammyjs/grammY](https://github.com/grammyjs/grammY) | 3,794 | TypeScript framework для Telegram Bot API | Библиотека разработчика, а не чатовый плагин. Не нужна, пока используем текущего бота |
| [uasneppy/telegramscheduler](https://github.com/uasneppy/telegramscheduler) | 0 | Самостоятельный планировщик для Telegram-медиа | Слабые сигналы зрелости; не ставить вместо существующего бота без security/maintenance аудита |

Ссылки на README/API и число stars проверялись напрямую по открытым endpoint.

## Hugging Face и ChatGPT plugins

Поиск Hugging Face Spaces по запросам `social media poster generator`, `quote card
generator`, `telegram scheduler bot` не вернул подходящих Spaces. HF полезен для
поиска моделей генерации фонов, но модель не является готовым агентским плагином и
не гарантирует точный текст/логотип; при необходимости API/квоты/лицензия модели
проверяются отдельно.

В доступных этому рабочему чату инструментах нет plugin-management или
Telegram/Canva scheduling connector. Поэтому нельзя утверждать, что внешние
ChatGPT plugins установлены или доступны всем чатам. Для нашего сценария
специализированный plugin не обязателен: локальные skills + approved renderer +
существующий Telegram Bot API. У каждого отдельного чата всё равно проверяются
фактические инструменты и права.

## Решение

Не импортировать внешний скилл как обязательную зависимость. Использовать
собственные `brand-kit` + `marketing-methods/visual` + новый
`telegram-graphics` + `publisher-telegram`. Для генерации разрешать только чистый
фон; точный текст и логотип всегда накладывает локальный HTML-композитор. Сначала
проверить существующий бот и его расписание; n8n/grammY/другого бота не ставить
параллельно без доказанного пробела.
