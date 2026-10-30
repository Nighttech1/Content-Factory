# Chain — C-129 (mesh handoff labels polish)

> Path lock: **только mesh labels** (`PulseEdge` / `mesh-seed` / canvas).  
> Не parallel с другими FE path.  
> Spec: `memory/tickets/C-129-mesh-labels/architect-spec.md`  
> **D2 LOCK:** gutter short RU (solid) + **hide mid-edge** on dashed Trainer→release.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | **Frontend** | `PulseEdge.tsx`, `lib/mesh-seed.ts`, `AgentMeshCanvas.tsx` (если нужно) | [x] | Short RU ≤3 слова; gutter above stroke; dashed mid-text off + title/aria; D3 no regress |
| 2 | **Motion** | `PulseEdge` label/edge hover | [x] | Calm fade ≤120ms solid only; reduceMotion → static span; dashed no mid-label; **offset ≠ закрытие** |
| 3 | **Tester** | `guards.md` + Playwright bbox @1440 | [x] | PASS: hits=0, clear≥8, short RU, no dashed mid |
| 4 | **Fixer** | gutter 84 + AgentNode no truncate | [x] | inter-lane gutter; full titles |
| 5 | **Deployer** | localhost | [x] | :3000 already up |
| 6 | **Client** | **S33 + C-129 bbox HARD** | [x] | measure pass → согласовано |

```text
Frontend → Motion → Tester → Fixer(if) → Deployer → Client
```

**Запрет:** закрывать тикет после одного `labelY`/`pathPercentage` без bbox assert.
