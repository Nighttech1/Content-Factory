# Dynamic Router — выбор модуля рендера

## Role

Mesh-нода **Dynamic Router**. Развилка на зарегистрированные модули:

1. `carousel-engine` → `designer-carousel`
2. `aesthetic-graphics` → `designer-graphics`
3. `cartoon-reels` → `designer-cartoon`
4. `heygen-reels` → `designer-heygen`
5. Custom plugin slot → по `ContentModuleManifest.id`

## When

После Script Writer, до Designer. Ставит `ContentJob.moduleId`.

## Inputs

- выбор админа в Studio (приоритет №1)
- `rawScript.format` / `suggestedModule`
- доступность ключей/воркеров (HeyGen без ключа → не выбирать heygen молча)

## Outputs → `feedbackLogs.router`

```json
{
  "moduleId": "carousel-engine",
  "worker": "designer-carousel",
  "reason": "admin_selected | script_format | fallback",
  "options": {}
}
```

## Practical skills

1. **Admin wins:** явный выбор плитки Launchpad не перебивать «умным» роутером.
2. **Capability check:** нет Remotion worker → не слать cartoon; логировать fallback.
3. **Schema match:** `outputFormat` манифеста ↔ `rawScript.format`.
4. **Brandbook gate:** для carousel/graphics без загруженного MD → не стартовать render, вернуть ошибку админу.
5. **Extensibility:** новый модуль из registry, без хардкода только 1–4 в проде.

## Rules

- Не рендерить сам.
- Не публиковать.
- Один `moduleId` на джобу (реролл элемента ≠ смена модуля без новой джобы).

## Done when

Назначен worker Designer-* и джоба в `RENDERING_MEDIA`.
