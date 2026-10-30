# Guards — C-87 Settings agents dual MultiButton

Тикет закрыт **только** если `/settings` → «Агенты» показывает два expanded MultiButton: content-type + agent pack.

| # | Guard | Verdict | Evidence |
|---|-------|---------|----------|
| G1 | Content-type filter (`settings-content-type-filter`) | **PASS** | `components/settings/SettingsShell.tsx` |
| G2 | Agent pack filter (`settings-agent-filter`) | **PASS** | SettingsShell |
| G3 | `contentTypeItems` wired to MultiButton | **PASS** | SettingsShell |
| G4 | `agentPackItems` wired to MultiButton | **PASS** | SettingsShell |

## Executable checks

```powershell
npx tsx scripts/smoke-c82-c87-ux-wave5.ts
# expect: SMOKE_C82_C87_OK (C-87 asserts)
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-87**.

## Fixer?

**Нет.**
