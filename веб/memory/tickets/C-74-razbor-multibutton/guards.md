# Guards C-74 — Razbor MultiButton + CTA над чатом

| ID | Check | Result |
|----|-------|--------|
| G1 | `components/ui/multi-button.tsx` exists (Dark Luxury) | PASS |
| G2 | AgentChatComposer uses MultiButton send/mic/handoff | PASS |
| G3 | Нет «Аналитик готов…»; `razbor-start-btn` в `aboveInput` | PASS |
| G4 | Handoff testids: razbor-send-designer / publisher-designer | PASS |

Smoke: `npx tsx scripts/smoke-c73-c75-ux-wave3.ts`
