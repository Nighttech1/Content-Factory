# Checkpoint: две маски сценария (сценарист ↔ AD)

**Цель:** смысл APPROVED до GPT Image; 1 HY-слово + перевод на каждый слайд.

## Команда
| Маска | Skill | Файл |
|-------|-------|------|
| Сценарист | MAKE viral + vocab | `skills/scriptwriter-viral.md` |
| AD сценария | CHECK marketing/viral | `skills/art-director-script-viral.md` |
| Дизайн/визуал | MAKE+CHECK кадр | `skills/viral-carousel-design.md` |

## DEV budget
- 1 карусель / ход агента
- `CAROUSEL_MAX_REPAIR=0` (default)
- Без script APPROVED → `BLOCKED_WITH_REMARKS`, картинки не жжём

## Smoke
`npx tsx scripts/smoke-vernatun-two-masks-hy4.ts`  
Читать: `prompts/01_script_ad_verdict.json` + `prompts/AD_VERDICT.md`

## Тренер после демо
Если REMARKS — усилить MAKE/CHECK skills и механический gate `hy-vocab`, не жечь dual gen.
