# Decisions — C-03

| When | Role | Decision |
|------|------|----------|
| 2026-09-16 | Orchestrator | В волне W-2026-09-16-sprint1 |
| 2026-09-16 | Architect | Locked path split: C-03 owns `components/ui/GlassCard.tsx`, `NeonBadge.tsx`, `ReactiveButton.tsx` + demo section only in `app/studio/page.tsx`. Motion only `components/ui/**` (spring 25/300). Must run after C-02. No shell/RBAC/token rewrites. No Backend/AI Bridge. |
| 2026-09-16 | Frontend | Added GlassCard (blur+border), NeonBadge (blue/gold/terracotta/neutral + cobalt/muted aliases), ReactiveButton (basic press/hover glow; Motion to refine spring). Demo section on `/studio` with Armenian «Բարև». |
| 2026-09-16 | Motion | GlassCard hover lift `y:-3` + shadow; NeonBadge soft glow/scale pulse; ReactiveButton press `scale:0.97` + border highlight. Spring 25/300; `useReducedMotion` disables. Shell untouched. |
| 2026-09-16 | Tester | GREEN. GlassCard/NeonBadge/ReactiveButton + Design primitives demo on `/studio`; spring 25/300; C-02 RBAC regress still green; anti-slop OK. NeonBadge aliases blue↔cobalt, neutral↔muted accepted. No Fixer. |
| 2026-09-16 | Fixer | N/A / skipped — Tester reported GREEN; no code fix. |
| 2026-09-16 | Deployer | Localhost only. Reused running `npm run dev` on `:3000`. Verified `http://127.0.0.1:3000/studio` → HTTP 200. No VPS/prod. Client URL: `http://127.0.0.1:3000/studio`. |
