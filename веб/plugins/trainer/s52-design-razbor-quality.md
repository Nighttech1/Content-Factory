# S52 — Design tokens-only + Razbor draft + quality etalon

Когда: волна **2026-10-16** — Settings Design STRICT tokens; Razbor draft edit; Armenian themes; эталон карусели; budget 9 PNG.

| Lock | Value |
|------|--------|
| ticket_limit | default ≤3 (3 epic tickets) |
| shell_freeze | **true** for AppShell / left Studio nav |
| UI in scope | Settings Design card chrome + toolbar; Razbor modal |
| upgrade_only | true |
| no_pipeline_break | true — Create/Razbor agents shape |
| validation_budget_png | **9** (3×3) with images |
| etalon | `generatedMedia/эталон карусели/` |

## Proposed tickets (≤3)

1. **C-design-tokens-only** — 1.1–1.3 prefs + toolbar left + agent payload
2. **C-razbor-draft-edit** — 2.1–2.4 preview / no start / Выбрать / overwrite
3. **C-carousel-quality-etalon** — pipeline audit + etalon folder + 9 PNG Armenian

## Chain hint

```
Trainer (done) → Architect (spec+chain, shell_freeze + Design/Razbor in scope)
  → Frontend (Settings Design + Razbor modal only)
  → AI Bridge (tokens-only inject; random Armenian themes; draft context)
  → Backend (draft upsert/overwrite; payload shape if needed)
  → Tester (S52.A–C guards) → Fixer → Deployer → Client (Playwright S52)
```

Skills: `content-factory-ui` S52 · `content-pipeline-agents` S52 · `carousel-json-contract` · `ai-bridge` · `workers/designer-carousel` · `client-scenarios` S52 · `client.mdc` §18.
