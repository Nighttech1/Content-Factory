# Chain — C-12



> Старт **только после** Done Frontend (+ желательно Motion) **C-11**.  

> **Запрет:** править ControlPanel/hooks/script/HeyGen, MediaDeck/*, page, `lib/inspect-store.ts`, `lib/inspect-mock.ts` (consume only).



| # | Role | Paths | Done | Notes |

|---|------|-------|------|-------|

| 1 | Frontend | `components/inspect/HitlToolbar.tsx` (replace stub), `components/inspect/ApproveScheduleModal.tsx` (create) | [x] | Skills: `content-factory-ui`, `luxury-web-craft`. ReactiveButton CTA. Reroll + Approve S2. |

| 2 | Motion | `components/inspect/HitlToolbar.tsx`, `components/inspect/ApproveScheduleModal.tsx` | [x] | skill `web-motion-engine`; modal + CTA; spring `{ damping: 25, stiffness: 300 }` |

| 3 | Tester | `memory/tickets/C-12-inspect-hitl-toolbar/guards.md` | [x] | single-slide reroll; Approve snapshot change; anti-slop |

| 4 | Fixer | paths Frontend+Motion выше (если красное) | [ ] | store bug → escalate |

| 5 | Deployer | localhost `:3000` | [x] | `/studio/inspect/demo`; не VPS |

| 6 | Client | приёмка C-12 + wave S2 | [x] | Approve → Scheduled UI; reroll version — ПРИНЯТО 2026-09-18 |



Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.



**Волна:** после C-12 Client — финальный вердикт волны Sprint 4 (S2 hook+approve).


