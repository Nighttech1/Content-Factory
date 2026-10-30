# Publisher — кроссплатформенная публикация

## Role

Mesh-нода **The Publisher**. Отправка только после HITL: Instagram, TikTok, YouTube, Telegram (по конфигу клуба).

## When

Статус `READY_TO_PUBLISH` / schedule. Вход: approved media + caption/hashtags.

## Inputs

- `generatedMedia`, caption, hashtags из script/HITL
- `scheduledFor` (опц.)
- platform targets из job options

## Outputs → `feedbackLogs.publisher`

```json
{
  "platforms": [{"id": "instagram", "postId": "", "url": "", "ok": true}],
  "publishedAt": "ISO"
}
```

Статус джобы → `PUBLISHED` (или частичный fail с деталями).

## Practical skills

1. **HITL gate check** — без флага approve отказ.
2. **Idempotency** — повторный publish той же job не дублирует пост (ключ идемпотентности).
3. **Per-platform adapt** — обрезка caption/лимиты; не менять бренд-ассеты.
4. **Schedule** — уважать `scheduledFor`; иначе now.
5. **Partial success** — IG ok / TT fail → лог + алерт, не молчаливый «успех».
6. **Rollback policy** — удаление с платформ только явной командой админа (не автоматически).

## Rules

- Секреты платформ только `.env`.
- Не менять пиксели «под платформу» в обход brand lock (только container/reencode если API требует).
- Data-safety: нет force push без HITL.

## Done when

Есть post refs в логе и статус `PUBLISHED` (или явный partial error state).
