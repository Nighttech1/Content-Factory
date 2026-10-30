# Guards — C-05

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| script / testids | `data-testid="command-input"` + `data-testid="generate-draft"`. | `components/studio/FloatingCommandBar.tsx` + `scripts/sprint2-guards.mjs` |
| script / Generate wiring | Generate Draft вызывает `startGenerate()`. Предотвращает мёртвую кнопку без store. | `FloatingCommandBar.tsx` + `scripts/sprint2-guards.mjs` |
| script / gate | Generate disabled / no-op без `selectedModuleId`; store `startGenerate` early-return если модуль не выбран. | `FloatingCommandBar.tsx` + `lib/studio-store.ts` + `scripts/sprint2-guards.mjs` |
| script / topic | Store: `topic`, `setTopic`, `applyPreset` + bar использует их. | `lib/studio-store.ts` + `FloatingCommandBar.tsx` + `scripts/sprint2-guards.mjs` |
| regress | C-04 grid + C-06 drawer/pipeline guards зелёные (`sprint2-guards.mjs`). | `scripts/sprint2-guards.mjs` |
| anti-slop | Нет indigo/violet slop на волне. | `python plugins/frontend/anti_slop_scan.py .` → OK |
| smoke | Static Generate→`startGenerate` + module gate; full S1 (drawer+steps) jointly C-06. | Tester 2026-09-18 |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`
