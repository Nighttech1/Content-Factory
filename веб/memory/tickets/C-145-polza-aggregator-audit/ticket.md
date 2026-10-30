# C-145 — Polza / aggregator audit (memory only)

| Field | Value |
|-------|-------|
| **ID** | `C-145` |
| **Priority** | P1 |
| **Area** | ai / content-generation wiring audit |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Status file** | pending |
| **[MKT]** | Понятно, где реально Polza, а где ещё заглушка |

## Repro

1. Env docs mention Polza (`AGGREGATOR_BASE_URL`, smoke script).
2. Unclear whether carousel/reels/Razbor/Create drafts call `lib/llm/aggregator` or stay on mock.
3. No single memory verdict with file evidence.

## Expected

- **Audit only in memory** (this ticket + architect-spec): verdict **connected** / **partial** / **not wired**.
- Gap list with **file paths** (no secrets, no API keys in memory).
- Backend confirms/extends Architect evidence; **no app code required** to close this ticket.
- Follow-up wire tickets only if Orchestrator opens them later.

## Actual

See architect-spec **Verdict (2026-10-10)**.

## Notes for Orchestrator

Path 4. Backend + Architect. Skills wrongly bundled Settings UI into «C-145» — Settings UI is **C-144/C-143**; this ID is **audit-only**.
