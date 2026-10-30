# Chain — C-51

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-49 → C-50 → **C-51**.  
> **Обоснование ролей:** FE сначала shell (welcome / remove designer UI / right panel mount); AI Bridge — pipeline copy без Designer; Motion — play/scrubber после DOM hooks.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/workspace/RazborModal.tsx`, optional `components/studio/workspace/RazborReelPlayer.tsx`, wire from `FeedPostCard` unchanged entry | [x] | Welcome + «Начать разбор»; remove Designer tab + «Готовая карусель»; no `upsertDraft` from razbor; right panel shell for play/scrubber |
| 2 | AI Bridge | `lib/studio/razbor-pipeline.ts` (± agent packs under `agents/` / workers copy if referenced) | [x] | Analyst welcome; Analyst→Scriptwriter only; full script fields; strip designerMessages/draft from razbor cascade |
| 3 | Motion | `RazborModal.tsx` and/or `RazborReelPlayer.tsx`; patterns from `CapCutEditorShell.tsx` (read-only ref) | [x] | Play toggle spring damping 28; playhead/fill spring + reduced-motion instant; no autoplay (`autoPlay={false}`, idle `playing=false`) |
| 4 | Tester | `memory/tickets/C-51-razbor-script-only/guards.md` | [x] | No auto-start; no Designer / «Готовая карусель»; script fields; scrubber; supersede C-30 designer asserts |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical; не возвращать Designer в razbor |
| 6 | Deployer | localhost | [x] | Verified 200 on /studio/carousel-engine + /settings; no restart needed; no VPS |
| 7 | Client | приёмка | [ ] | `client-scenarios` S-razbor welcome→start; visual critic right panel |

Skills: `content-factory-ui`, `content-pipeline-agents`, `prompt-engineering` (AI Bridge), `web-motion-engine`, `21st-ui-catalog` (scrubber adapt optional), `client-scenarios`.  
**Не звать:** Backend, Coder monolith, WebGL, Deployer VPS.
