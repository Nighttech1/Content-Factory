---
name: telegram-graphics
description: Produce accurate Vernatun quote cards and meeting announcement images for Telegram, with mandatory deterministic HTML/CSS/SVG logo and text overlay, review gates, and a bot-ready schedule manifest.
---

# Скилл: графические посты Telegram

Применяется `telegram-graphics-lead` для двух типов: `quote-card` и
`meeting-announcement`. Прочитай `shared/pipelines/telegram-graphics/README.md`,
`projects/vernatun/brand/brief.md` и `projects/vernatun/brand/design.md`.

## До дизайна

1. Прочитай ID/brief и проверь источник цитаты или событие.
2. Для цитаты зафиксируй проверку дословности, разрешение на публикацию и
   предпочтительную атрибуцию участника; без подтверждённого разрешения не рендерь.
3. Для анонса сверь дату, время и timezone, место, формат, цену, CTA/регистрацию
   по текущему месячному плану или подтверждённому источнику.
4. Проверь фактическую доступность файлов, Drive, генератора изображений,
   Puppeteer/Chromium и внешнего хранилища. Если инструмента нет, не называй его
   подключённым.

## Производство

1. Сделай короткую ясную композицию на один экран: главный смысл, второстепенный
   контекст, единый CTA. Для quote не переписывай смысл участника; для announcement
   выдели дату/время/место так, чтобы они сканировались первыми.
2. Арт-директор выдаёт точный layout brief и safe zones. Дизайнер создаёт/выбирает
   только фон; никаких букв, дат, логотипов или псевдоармянского текста в фоне.
3. `finish-art-director` берёт токены из `design.md` через `brand-kit` и накладывает
   **на каждый финальный файл** логотип, точный текст/плашки/event details/CTA на
   HTML/CSS/SVG-слое. Лого нельзя заменять текстом или генеративной имитацией.
4. Рендери в согласованном размере (по умолчанию 1080×1350), сохрани результат во
   внешнюю библиотеку, только если запись и доступ проверены; в Git оставь
   манифест и безопасный путь/ссылку.
5. Арт-директор просматривает фактический экспорт; editor проверяет факты, тон,
   разрешение на цитату, CTA и качество. Reject возвращается исполнителю.

## Манифест, очередь и доставка

`70-publication-manifest.json` должен содержать:

```json
{
  "contentId": "V-YYYYMM-TGP-NN",
  "kind": "quote-card | meeting-announcement",
  "assetVersion": 1,
  "assetRef": "approved stable file reference",
  "caption": "optional Telegram caption",
  "scheduledAt": "2026-11-05T18:00:00+03:00",
  "status": "awaiting_owner_approval",
  "editorApproved": false,
  "ownerApproved": false,
  "idempotencyKey": "contentId:assetVersion"
}
```

Не добавляй Telegram token/channel id; destination определяется безопасной
конфигурацией бота. Не ставь `ownerApproved=true` вместо владельца. Consumer обязан
игнорировать черновики/неодобренные файлы, работать по времени `scheduledAt`,
дедуплицировать доставку и сохранять post reference/error. Не заявляй, что bot
schedule активен, пока в конкретном runtime нет найденного и проверенного
consumer.

## Готово

Финал готов владельцу, когда фактическая картинка просмотрена, логотип есть и
наложен HTML-слоем, текст/данные подтверждены, права и решение редактора записаны,
а файл и манифест доступны. Публикация ждёт явного апрува человека и проверенного
расписания бота.
