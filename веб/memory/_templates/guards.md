# Guards — C-{{xx}}

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| test | … | путь к тесту |
| rule / validation | … | путь к коду |
| prompt / tool schema | … | путь |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`

Формат: `| C-xx | симптом | guard | путь |`
