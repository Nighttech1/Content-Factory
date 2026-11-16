# Статьи для сайта Вернатуна

Каноническая папка готовых к доставке пакетов: projects/vernatun/articles/*.json.
Рабочие тексты и задания остаются в departments/article/jobs/<ID>/.
В этой папке пока нет одобренных статей. Пример лежит в examples/ и не попадает в сборку.

Поля content: id, job_id, revision, slug, title, description, author, category,
publish_at, updated_at, blocks, sources, telegram, cta. Формат блоков:
h2/h3/p с text либо image с url, alt, rights. Текст является обычным текстом,
не HTML. H1 создаётся из title. Внешнее медиа хранится по HTTPS.

release.status: draft, approved, withdrawn. Для approved нужны editor и owner:
by, at с часовым поясом, evidence со ссылкой на вердикт/решение и content_sha256.
Хеш: SHA256 JSON поля content, UTF-8, ensure_ascii=False, sort_keys=True,
separators=(',', ':'). Вычисление: функция digest в scripts/articles/publish.py.
Только редактор и владелец могут быть источниками своих одобрений. Скрипт
проверяет связь версии с записью, но не удостоверяет личность подписавшего.

Проверка:
```sh
python3 scripts/articles/publish.py
python3 -m unittest discover -s scripts/articles -p 'test_*.py'
```

Draft/withdrawn и будущие approved не отправляются. Withdrawn исключает
новую отправку, но НЕ удаляет ранее опубликованное: снятие публикации требует
отдельного серверного маршрута и подтверждения. Не используйте это поле как
экстренное удаление. Редактирование slug опубликованной статьи требует
редиректа и согласованной миграции на VPS.

Workflow .github/workflows/vernatun-articles.yml проверяет пакеты при PR,
доставляет из main при push или по часовому расписанию. Расписание проверяет
готовность дат, не пишет новые статьи. Его выполнение зависит от GitHub Actions,
задержки возможны.

Для доставки нужны Repository variable VERNATUN_ARTICLE_INGEST_URL и Repository
secret VERNATUN_ARTICLE_INGEST_SECRET. Они ещё не проверены. Само наличие
других SSH Secrets их не заменяет. При наличии подходящей статьи и отсутствии
настройки доставка завершается ошибкой, не объявляет публикацию успешной.

VPS должен реализовать контракт из DELIVERY.md. Сейчас endpoint и подключение
бота не подтверждены, поэтому сквозная автоматизация ещё не работает.
