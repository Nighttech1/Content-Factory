# Decisions — C-05

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Orchestrator | Волна W-2026-09-18-sprint2 |
| 2026-09-18 | Architect | Spec+chain: FE = `FloatingCommandBar` + extend `studio-store` (topic, presets, `startGenerate`). **Не** Grid/Drawer/`page.tsx`. Старт после C-04 FE+Motion. |
| 2026-09-18 | Architect | Motion на этом тикете: gradient/pulse border на Generate Draft **только** в `FloatingCommandBar.tsx`. |
| 2026-09-18 | Architect | **Hard link C-05↔C-06:** Generate Draft → `startGenerate` → drawer open + mock pipeline. S1 Client gate закрывается на C-06; C-05 wiring обязателен. |
| 2026-09-18 | Architect | UX: Generate **disabled** (или no-op), если `selectedModuleId == null` — предпочтение disable + hint. |
| 2026-09-18 | Architect | `startGenerate` — единый store API; C-05 может seed `drawerOpen`; C-06 дописывает mock runner body. Без Backend/SSE. |
| 2026-09-18 | Architect | Chain: Frontend → Motion → Tester → Fixer → Deployer → Client. |
| 2026-09-18 | Frontend | Extended store: `topic`/`setTopic`/`applyPreset`/`startGenerate` (+ `drawerOpen` seed for C-06 body). `FloatingCommandBar`: centered input, 4 preset chips, Generate Draft with CSS gradient border; **disabled + hint** when `selectedModuleId == null`. Generate → `startGenerate`. Motion pulse unchecked. |
| 2026-09-18 | Motion | Generate Draft: infinite gradient `backgroundPosition` + boxShadow pulse when enabled; static when disabled/`prefers-reduced-motion`. Store wiring unchanged. |
| 2026-09-18 | Tester | GREEN. `command-input` + `generate-draft` → `startGenerate`; disabled without `selectedModuleId`; store early-return gate. anti-slop OK. Guards + `sprint2-guards.mjs`. No Fixer. |
| 2026-09-18 | Fixer | N/A / skipped — Tester reported GREEN; no code fix. |
| 2026-09-18 | Deployer | Localhost only. Started `npm run dev` on `:3000` (was down). Verified `http://127.0.0.1:3000/studio` → HTTP 200. No VPS/prod. Client URL: `http://127.0.0.1:3000/studio`. |
