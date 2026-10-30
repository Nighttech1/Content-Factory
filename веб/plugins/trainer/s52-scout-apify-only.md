# S52.D — Scout-only Apify (Competitors = snapshot)

Когда: волна **2026-10-16** — Apify bound **only** to Scout; Competitors never scrapes on open.

| Lock | Value |
|------|--------|
| ticket_limit | default ≤3 |
| shell_freeze | **true** AppShell / left nav |
| NE prod | **true** |
| paid path | Scout **«Разведать»** OR auto-scout schedule |
| feed path | last Scout snapshot only (**0** Apify) |

## Proposed tickets (≤3)

1. **C-scout-apify-bind** — Backend Scout run + snapshot SoT + schedule/filters wire + counters
2. **C-scout-razvedat-ui** — Team Scout: bottom «Разведать» + filters + frequency; mesh defaults
3. **C-competitors-snapshot** — Studio Competitors FE: no Apify on load/focus/remount

## Chain hint

```
Trainer (done) → Architect (spec+chain, shell_freeze)
  → Backend (Scout entrypoint + snapshot; feed GET = 0 Apify)
  → Frontend (Team Scout panel + Competitors snapshot bind)
  → AI Bridge (no scraper tools / no feed refresh)
  → Tester (S52.D guards / smoke counters) → Fixer → Deployer (localhost)
  → Client Playwright S52.D
```

Skills: `apify-scraper-cost-discipline` · `backend` · `xyflow-agent-mesh` · `content-factory-ui` · `ai-bridge` · `client-scenarios` S52.D · `client.mdc` §18.

Grade: `memory/trainer/2026-10-16-scout-apify-only-grade.md`
