# Wave brief — 2026-10-18-logo-placement-v2

**Дата:** 2026-10-18  
**Trainer grade:** `memory/trainer/2026-10-18-logo-placement-v2-grade.md` (**C→B**)  
**Canon card:** `plugins/trainer/logo-placement-v2.md`  
**ticket_limit:** `full-queue`  
**shell_freeze:** AppShell / left nav — **true**  
**Cycle until:** Client report contains **«согласовано»** (Playwright HARD GATE)

## Резюме (простым языком)

На карусели снова только картинка-логотип Vernatun (без повторного названия текстом). Берём **новый** файл логотипа, кладём его в папку бренда с **прозрачным** фоном (чёрную подложку убрать). На обычных слайдах логотип — **внизу слева**; на обложке и на последнем (CTA) — **сверху** (лучше сверху слева). Размер примерно **в два раза крупнее**, чем сейчас. Шрифты и персонажи в этой волне не трогаем. Приёмка — только живым Playwright, пока Клиент не напишет «согласовано».

## Locks (HARD)

1. **Source:**  
   `C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_________VERNATUN__________________-9f51e9dd-8f09-4890-b9a2-00ea9c84e867.png`
2. **Install:** `public/brand/vernatun-logo.png` — transparent; strip black matte if present
3. **Placement:** body → `bottom-left`; COVER + LAST (cta) → TOP prefer `top-left`
4. **Size:** `BRAND_LOGO_SIZE_PX` = **2×** current (`88` → `176`)
5. **Chrome:** logo-only HTML (no `.brand-name`)
6. **Out:** Phase2 fonts · Phase3 character · VPS/publish/DB wipe

## Proposed chain

```text
Trainer ✅
  → Architect (spec + chain.md)
  → Backend (PNG+alpha · role placement · 2× size)
  → Tester (guards)
  → Deployer (localhost if needed)
  → Client (Playwright → «согласовано»; full-queue cycle)
```

## НЕ делать

- Phase 2: fonts / type scale / vision prompt  
- Phase 3: Character Pixar / cutout locks  
- Return of `.brand-name` / name-beside  
- Bake logo into image-model background  
- paid MCP / AppShell redesign  
