# Chain — C-11



> Старт **только после** Done Frontend (+ желательно Motion) **C-10**.  

> **Запрет:** править `app/studio/inspect/**`, `MediaDeck`/`Reels*`/`Carousel*`, `HitlToolbar`, `lib/inspect-store.ts`, `lib/inspect-mock.ts`.



| # | Role | Paths | Done | Notes |

|---|------|-------|------|-------|

| 1 | Frontend | `components/inspect/InspectControlPanel.tsx` (replace stub), `components/inspect/ViralityMeter.tsx` (create), `components/inspect/HookAlternatives.tsx` (create), `components/inspect/ScriptEditor.tsx` (create), `components/inspect/HeyGenPersonaSwitcher.tsx` (create) | [x] | Skills: `content-factory-ui`, `image-to-luxury-ui`, `luxury-web-craft`, `heygen-avatar` (UI only). Consume inspect-store. Score display derives from active hook (no store edit). |

| 2 | Motion | `components/inspect/HookAlternatives.tsx`, `components/inspect/ViralityMeter.tsx`, `components/inspect/InspectControlPanel.tsx` | [x] | skill `web-motion-engine`; swap feedback; spring `{ damping: 25, stiffness: 300 }` |

| 3 | Tester | `memory/tickets/C-11-inspect-hook-panel/guards.md` | [x] | S2 hook swap snapshot; counters; Armenian; anti-slop |

| 4 | Fixer | paths Frontend+Motion выше (если красное) | [ ] | store touch только если C-10 action bug — зафиксировать в decisions |

| 5 | Deployer | localhost `:3000` | [x] | `/studio/inspect/demo`; не VPS |

| 6 | Client | приёмка C-11 | [x] | S2 hook swap wired (selectHook → ACTIVE/SWAP + ViralityMeter) — ПРИНЯТО 2026-09-18 |



Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.



**Волна:** после Done Frontend(+Motion) C-11 → Оркестратор стартует **C-12 Frontend**.


