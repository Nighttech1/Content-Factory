# Chain — W-2026-10-15-sprint9-live-gen

> **ticket_limit:** `full-queue` (один контур gen↔critic, не UI-пачки)  
> **shell_freeze:** `true`  
> **upgrade_only:** `true`  
> **no_pipeline_break:** `true`  
> **budget:** **3 carousels × 3 slides = ≤9 PNG** (overwrite drafts between rounds)  
> **modules:** `carousel-engine` only  
> **no social publish** — только **Черновики** (Postgres Sprint 8)  
> Wave spec: `memory/waves/W-2026-10-15-sprint9-live-gen/architect-spec.md`  
> Predecessor: `W-2026-10-15-sprint9-carousel-reels` (ПРИНЯТО С ЗАМЕЧАНИЯМИ; F-s9-11-c live eye-pass)

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | Trainer | — | optional grade if Orchestrator ran step 0 | [ ] / N/A | Gaps closed **or** Orchestrator skipped (user locked LIVE-GEN) |
| 1 | **Architect** | wave | `architect-spec.md` + this `chain.md` | [x] | Spec locked; **no product code** |
| 2 | **AI Bridge** | **C-live-gen-01** | Live Create Scriptwriter→Designer→Publish→Draft; prompts read Sprint 9; refs R1–R3 **read**; `generatedMedia/wave-live-gen/`; Draft API. Themes LG-A coffee×R1, LG-B community×R2, LG-C heritage×R3. **slideCount=3**, **3 drafts**. **Не** shell/UI redesign | [x] | 3 drafts in Postgres Черновики; ≤9 PNG; titles `LIVE-GEN R1: LG-*`; links in `round-1-report.md` + `artifacts/round-1/{a,b,c}/` |
| 3 | **Client** | **C-live-gen-02** | Playwright @1440 Черновики + visual critic vs refs; `critic-r1.md` | [ ] | Words: why fail / what to strengthen; HARD REJECT if mock/panorama/>3 slides |
| 4a | **Fixer** and/or **AI Bridge** | **C-live-gen-03** (strengthen) | `create-carousel-prompts.ts`, `agent-defaults` **carousel-engine only**, critic packs, worker SKILLs — **upgrade_only** | [ ] | Prompt diffs address critic-r1; no pipeline break |
| 4b | **AI Bridge** | **C-live-gen-03** (regen) | Same gen path; **overwrite** same draft ids / soft-replace; still ≤9 deliverable PNG | [ ] | New PNGs in Черновики; `critic-r{N}.md` ready for next Client |
| 4c | **Client** | critic r2 | same as step 3 | [ ] | PASS → jump to 6; FAIL → step 5 if rounds left |
| 5 | **Fixer/AI Bridge → Client** | loop ≤3 | same as 4a–4c for **r3** only | [ ] | After r3 gen+critic — **stop** (no r4) |
| 6 | **Deployer** | localhost if needed | update local API / ensure :3001 (or current) Ready for Client | [ ] | Live localhost; **skip** if already green |
| 7 | **Client** | **C-live-gen-04** final | Playwright Черновики @1440 + refs; `client-verdict.md` | [ ] | ПРИНЯТО / ПРИНЯТО С ЗАМЕЧАНИЯМИ / НЕ ПРИНЯТО |

## Path locks (no overlap writers)

1. **Architect docs first** — no product code in step 1.  
2. **AI Bridge gen (01)** before any Client critic.  
3. **Client critic** before strengthen — не «усиливать на глаз без critic md».  
4. **Strengthen + regen** — один writer на overlapping prompt files (Fixer **или** AI Bridge sequential, не parallel).  
5. **Overwrite drafts** between rounds — не копить >9 PNG deliverable.  
6. **Shell / Create chrome / mesh graph / Prisma:** **0** edits.  
7. **Deployer** только если localhost недоступен для Playwright.  
8. **Loop cap:** max **3** gen rounds total (r1 + up to 2 strengthen/regen).

## Out of chain

Frontend (default) · Motion · Backend (unless Draft API regress → escalate Architect) · custom-reels · social publish · Apify · Auth UI · Sprint 10+.

## Budget reminder

| Item | Cap |
|------|-----|
| Carousels | 3 |
| Slides each | 3 |
| PNG deliverable | ≤9 |
| Critic rounds | ≤3 |

## Next executor

**AI Bridge** — `C-live-gen-01` (round-1 live gen → Черновики).
