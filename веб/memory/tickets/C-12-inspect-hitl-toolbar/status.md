# Status — C-12

| Field | Value |
|-------|-------|
| **Status** | `done` |
| **Owner** | — |
| **Updated** | 2026-09-18 |

## Log

- Ticket opened for Sprint 4 wave.
- Architect: spec+chain ready. Blocked until Frontend C-11 done.
- Frontend: HitlToolbar + ApproveScheduleModal done. Store consume OK (`rerollSelectedSlide`, `openApproveModal`, `confirmApproveSchedule`, `cancelApproveModal`). CarouselDeck already shows `v{n}` when version > 1; toolbar also shows `Slide #N · v{version}`. Next: Motion.
- Motion: CTA press (reroll `whileTap`, Approve/Confirm via ReactiveButton, Cancel `whileTap`); modal enter/exit (`AnimatePresence` + spring panel + fade scrim); celebrate on approve (status chip scale + gold flash, CTA label pop). Spring `{ damping: 25, stiffness: 300 }`, `useReducedMotion` → instant. Paths only HitlToolbar + ApproveScheduleModal. Next: Tester.
- Tester: `scripts/sprint4-guards.mjs` GREEN (reroll + openApproveModal + confirmApproveSchedule S2); `guards.md` written; anti-slop OK. Fixer not needed. Next: Deployer.
- Deployer: localhost `http://127.0.0.1:3000/studio/inspect/demo` → 200; `/studio` regression 200; sprint4-guards GREEN. Separate local API: N/A. Ready for Client.
- Client: ПРИНЯТО. S2 Approve: modal → `confirmApproveSchedule` → status `scheduled` + chip/CTA «Scheduled». Reroll bumps slide `version`. Playwright MCP gap — wiring + guards. Wave Sprint 4 закрыта.
