---
name: design-token-guardian
description: >-
  Static linter for Aedifica.Core Flutter UI: bans raw Color(0xFF) in widgets,
  default Card/ElevatedButton, Curves.easeIn, Material DataTable on registries.
  Use before Frontend handoff, on /audit, and as Tester check on changed Dart.
---

# Design Token Guardian

Программный защитник `DESIGN.md`. Не заменяет скрин Клиента.

## Когда

Frontend: шаг `/audit` до передачи на `:8787`.  
Тестировщик: по изменённым `app/lib/**/*.dart` волны.

## Запуск

```powershell
py -3 .cursor/skills/design-token-guardian/scripts/guard.py
# или все файлы UI (шумно на легаси):
py -3 .cursor/skills/design-token-guardian/scripts/guard.py --all
# конкретные файлы:
py -3 .cursor/skills/design-token-guardian/scripts/guard.py app/lib/ui/screens/foo.dart
```

Обёртка: `.\scripts\design_token_guardian.ps1`

Exit `0` = чисто. Exit `1` = нарушения. Не сдавай экран при `1`.

## Правила (изменённые файлы вне allowlist)

Allowlist (hex здесь можно): `app/lib/core/theme/`, `app/lib/core/constants/`.

| Запрет | Зачем |
|--------|--------|
| `Color(0x…)` / `fromRGBO` / `fromARGB` в виджетах | Только `Theme.of(context)` / preset / `AedificaPlutoGridTheme` |
| `Colors.blue/purple/indigo/grey/black` | Slop / `#000` |
| `Card(` | Не дефолтный Material card |
| `ElevatedButton(` | Кастомный UI-кит / янтарь-кнопка |
| `Curves.easeIn` (+ `easeInX` кроме явного исключения) | Ватная анимация |
| `DataTable(` в `lib/ui` | Только PlutoGrid на реестрах |

Исправление: вынести цвет в тему, заменить контрол, `Curves.easeOutCubic`.

## Легаси

Полный `--all` сейчас красный (старые экраны). Волна чинит **свои** файлы. Не размазывай рефактор на весь `lib/` без chain.
