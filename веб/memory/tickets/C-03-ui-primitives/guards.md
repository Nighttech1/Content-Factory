# Guards — C-03

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| script / files | Существуют `GlassCard`, `NeonBadge`, `ReactiveButton`. Предотвращает удаление примитивов DS. | `components/ui/*.tsx` + `scripts/sprint1-guards.mjs` |
| script / GlassCard | `backdrop-blur` + `border-glass` / `--bg-card`. Предотвращает плоский серый блок вместо glass. | `components/ui/GlassCard.tsx` + `scripts/sprint1-guards.mjs` |
| script / NeonBadge | Tones cobalt/blue + gold + terracotta (aliases muted/neutral). Предотвращает бейдж без бренд-акцентов. | `components/ui/NeonBadge.tsx` + `scripts/sprint1-guards.mjs` |
| script / ReactiveButton | `whileTap` + spring `{ damping: 25, stiffness: 300 }`. Предотвращает мёртвую кнопку без tactile press. | `components/ui/ReactiveButton.tsx` + `scripts/sprint1-guards.mjs` |
| script / demo | `/studio` импортирует и рендерит все три примитива в секции Design primitives. Предотвращает пустой studio без демо. | `app/studio/page.tsx` + `scripts/sprint1-guards.mjs` |
| regress | C-02 RBAC/tokens guards всё ещё зелёные (тот же `sprint1-guards.mjs`). | `scripts/sprint1-guards.mjs` |
| anti-slop | Glow мягкий; нет indigo/violet slop. | `python plugins/frontend/anti_slop_scan.py .` → OK |
| smoke | `GET /studio` → 200, HTML содержит демо-зону. | Tester 2026-09-16 |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`
