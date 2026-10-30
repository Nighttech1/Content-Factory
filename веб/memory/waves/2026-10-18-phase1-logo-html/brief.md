# Wave brief — 2026-10-18-phase1-logo-html

**Дата:** 2026-10-18  
**Trainer grade:** `memory/trainer/2026-10-18-phase1-logo-grade.md` (**C→B**)  
**Canon card:** `plugins/trainer/phase1-logo-wordmark-html.md`  
**ticket_limit:** `full-queue`  
**shell_freeze:** AppShell / left nav — **true**

## Резюме (простым языком)

На слайдах карусели логотип Vernatun должен быть **картинкой с прозрачным фоном** (слово Vernatun уже нарисовано внутри PNG). Рядом **нельзя** писать ещё раз название клуба текстом — получается двойная надпись. Лого кладётся **поверх фона** через обычный HTML-слой (как в режиме S57), не вшивается в картинку нейросети.

## Locks (Фаза 1 ONLY)

1. Source PNG (transparent):  
   `C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_logo-transparent-555fbf86-ea1d-4710-acc5-65722a5a1aa9.png`
2. Omit HTML club-name text (Vernatun / ARMENIAN CLUB) beside/under the mark  
3. S57 HTML `<img>` over bg, transparent; dual-path **raw** `logoRef`  
4. Keep bottom-RIGHT + enlarged mark (no new placement system)

## Proposed chain

```text
Trainer ✅
  → Architect (spec + chain.md)
  → Backend (Brand raw logo + composite omit .brand-name)
  → Tester (guards)
  → (optional) smoke re-composite
```

## НЕ делать

- Фаза 2: fonts / scale / vision prompt  
- Фаза 3: Character Pixar lock  
- VPS / publish / DB wipe  
- AI Bridge / Motion / Mesh redesign  
- paid MCP  
