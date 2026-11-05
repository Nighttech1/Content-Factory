# Отдел графики для Telegram

Отдел выпускает одиночные брендированные изображения для Telegram-канала:
`quote-card` с цитатой участника и `meeting-announcement` с анонсом встречи.

## Что читать

1. Корневые `AGENTS.md`, `CLAUDE.md`, `ACTIVE_PROJECT`.
2. `projects/vernatun/.claude/agents/telegram-graphics-lead.md` и память lead.
3. `projects/vernatun/brand/brief.md`, `projects/vernatun/brand/design.md`.
4. `shared/pipelines/telegram-graphics/README.md` и `research.md`.
5. `shared/skills/telegram-graphics/SKILL.md`, `brand-kit`, `publisher-telegram`.
6. Месячный план и `jobs/<ID>/`.
7. `intelligence/` — адресные заметки скаута о постах/темах Telegram.

## Структура задания

Код `TGP`, ID `V-ГГГГММ-TGP-NN`:

```text
00-brief.md                    → тип карточки, цель, согласие/факты, дата выхода
10-copy.md                     → точный текст на картинке, caption, CTA
20-art-direction.md            → компоновка, safe zones, фон и style brief
30-background-manifest.md      → источник/права на фон (если применяется)
40-bake-manifest.md            → HTML-слой, логотип, параметры PNG/JPEG, asset ref
50-art-qa.md                   → фактический просмотр экспорта
60-editor-verdict.md           → редакторский gate
70-publication-manifest.json   → одобрение и расписание для bot consumer
```

Шаблоны лежат в `jobs/_TEMPLATE/`. Тяжёлые медиа хранятся вне Git; в Git только
тексты, права/источник и безопасные references.

## Обязательный бейк и публикация

Логотип клуба накладывается HTML/CSS/SVG отдельно **на каждый финальный файл**.
Запрещено полагаться на генератор фона для лого, даты, цитаты, армянских плашек,
места, CTA или любого текста. Используй `brand-kit` и фактически проверяй готовый
файл.

Для цитат нужны точный текст и разрешение участника на публикацию с согласованной
атрибуцией. Для анонса дата, время/timezone, место/ссылка и CTA подтверждаются
актуальным планом. Без входного подтверждения не выдумывать.

Публикация возможна только после `editor ACCEPT` и явного апрува владельца. Бот
должен забирать одобренный манифест по расписанию и защищать от дублей. В текущем
репозитории пока не подтверждён реальный scheduled consumer для фото; до его
проверки manifest является handoff-контрактом, а не доказательством автопоста.
