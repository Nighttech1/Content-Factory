# Chain — W-2026-10-15-sprint9-carousel-reels

> **ticket_limit:** `full-queue` (не резать на пачки по 3)  
> **shell_freeze:** `true`  
> **upgrade_only:** `true`  
> **no_pipeline_break:** `true`  
> **modules:** `carousel-engine` + `custom-reels` only  
> **no social publish**  
> Wave spec: `memory/waves/W-2026-10-15-sprint9-carousel-reels/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-15-sprint9-carousel-reels-grade.md`

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | Trainer | — | grade sprint9 | [x] | B — skill gaps closed |
| 1 | **Architect** | wave | `architect-spec.md` + this `chain.md` + tickets C-s9-* | [x] | Spec locked; **no product code** |
| 2 | **AI Bridge** | **C-s9-01** | inventory md only (+ read-only audit of lib/studio, agent-chat, agent-defaults). **Не** UI | [x] | Table live vs chrome carousel+reels; others → Sprint 23 |
| 3 | **AI Bridge** + **Backend** | **C-s9-02** | `memory/fixtures/sprint9/carousel/**` (+ optional `__fixtures__`); refs `generatedMedia/wave-visual-deconstructor/` **read**; words QA | [x] | 3–5 golden carousel (JSON + sliced refs + «что хорошо») |
| 4 | **AI Bridge** | **C-s9-03** | `memory/fixtures/sprint9/reels/**` | [x] | 2–3 golden reels scripts IG+YT Shorts |
| 5 | **AI Bridge** | **C-s9-04** | `create-carousel-prompts.ts`, `agent-defaults.ts` **carousel-engine copywriter only**, `workers/script-writer/SKILL.md`, notes | [x] | Hook/CTA 1–4/swipe meta upgrade in place |
| 6 | **AI Bridge** | **C-s9-05** | `create-carousel-prompts.ts` designer overlays, `agent-defaults` **carousel designer only**, `workers/designer-carousel/SKILL.md` | [x] | Brandbook + panorama→slice + anti-slop in place |
| 7 | **AI Bridge** | **C-s9-06** | `agent-defaults` **custom-reels only**, `reels-script-contract.ts` (upgrade parse), reels skill notes | [x] | Live generate path stronger; not HeyGen |
| 8 | **AI Bridge** + **Backend** | **C-s9-07** | `carousel-json-contract.ts`, `reels-script-contract.ts`, `agent-chat/route.ts` fail mapping — **no** soft-mock | [x] | Parse fail = fail job; thresholds doc in memory |
| 9 | **AI Bridge** | **C-s9-08** | prompt packs + few-shots from golden + `*-quality-critic.ts` plug **before Draft**; agent-start inject | [x] | Claude-Code packs; critic rejects weak hook/CTA/slop |
| 10 | **Tester** (+ AI Bridge) | **C-s9-09** | guards + Playwright smoke Razbor→Create→Draft + reels→Draft @1440 | [x] | **PASS WITH GAPS** — fixtures+assert+Create Scriptwriter @1440 OK; live Draft LLM skipped; S44/S45 sibling smokes FAIL → Fixer. Guards: `memory/tickets/C-s9-09-smoke/guards.md` |
| 11 | **Tester** + **AI Bridge** | **C-s9-10** | `scorecard-9.10.md` numbers vs Architect thresholds | [x] | Scorecard filled → **NOT GREEN** Sprint 22 (`scorecard-9.10.md`). Open 9.11 F-s9-11-a/b/c |
| 12 | **AI Bridge → Tester → Fixer** | **9.11** | only failing paths from scorecard/S44–S46 | [x] | **F-s9-11-a/b PASS**. **F-s9-11-c** live STRICT/likeness — open (Client remarks) |
| 13 | **Deployer** | localhost | update local API if present | [x] | Live localhost for Client — see `deployer.md` (3001 Ready, smokes ALL_OK) |
| 14 | **Client** | accept | Playwright S44–S46 + quality words @1440 | [x] | **ПРИНЯТО С ЗАМЕЧАНИЯМИ** — `client-verdict.md` |

## Path locks (no overlap writers)

1. **C-s9-01** — docs-only inventory first (baseline before prompt churn).  
2. **Golden 02 → 03** before prompt upgrades 04–06 (few-shots need fixtures).  
3. **C-s9-04 → C-s9-05** sequential on `create-carousel-prompts.ts` / carousel agent-defaults (один writer).  
4. **C-s9-06** после 04 или без overlap (только `custom-reels` keys) — OK parallel **после** 01; **не** parallel с 04/05 на том же `agent-defaults.ts` файле → sequential **04 → 05 → 06**.  
5. **C-s9-07** после schema-touching upgrades 04–06.  
6. **C-s9-08** critic + packs **после** 07 (fail semantics stable).  
7. **C-s9-09 → C-s9-10** sequential.  
8. **Shell / Create chrome / mesh graph:** **0** edits.  
9. **Не** параллелить два AI Bridge на overlapping prompt files.

## Out of chain

Frontend (default) · Motion · social publish · HeyGen/cartoon/aesthetic/articles · Apify cost · Auth UI.

## Next executor

Wave closed Client **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (2026-10-15).  
Tail: **F-s9-11-c** live eye-pass before Sprint 22 green. Next plan: Sprint **10** or user Create quality pass on localhost:3001.
