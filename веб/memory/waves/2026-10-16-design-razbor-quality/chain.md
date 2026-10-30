# Chain — 2026-10-16-design-razbor-quality (S52)

> **ticket_limit:** default ≤3 (exact pack: C-design-tokens-only → C-razbor-draft-edit → C-carousel-quality-etalon)  
> **shell_freeze:** `true` (AppShell / left Studio nav)  
> **UI in scope:** Settings Design + Razbor modal only  
> **upgrade_only:** `true`  
> **no_pipeline_break:** `true` — Razbor/Create agent shape preserved  
> **validation_budget_png:** `9` (3×3, with images)  
> **etalon_folder:** `generatedMedia/эталон карусели/`  
> **no social publish**  
> Wave plan: `memory/waves/2026-10-16-design-razbor-quality/plan.md`  
> Trainer: `memory/trainer/2026-10-16-design-razbor-quality-grade.md` (grade **B**)  
> Plugin: `plugins/trainer/s52-design-razbor-quality.md`

## Strict role order

| Step | Role | Ticket | Paths (lock) | Status | Done when |
|------|------|--------|--------------|--------|-----------|
| 0 | **Trainer** | — | grade + S52 skills/rules | [x] | Grade **B** |
| 1 | **Architect** | wave | `plan.md` + this `chain.md` + three `architect-spec.md` | [x] | Spec locked; **no product code** |
| 2 | **Frontend** | **C-design-tokens-only** | `components/settings/DesignLibraryCarousel.tsx`, `BrandbookBoard.tsx`, `SlicedSlotPreview.tsx` (remove from Settings use), `QuickThemeTuner.tsx`, `SettingsShell.tsx` (comment only if needed — **no** nav chrome rewrite), `DesignPreviewPanel.tsx` (eye path only) | [ ] | No COVER/BODY/CTA strip; tokens cards; toolbar LEFT; no button kits; Doctrine deduped |
| 3 | **AI Bridge** | **C-design-tokens-only** | `lib/settings/design-library.ts` (`formatActiveDesignMdForPrompt` + seed dedupe if seeds duplicate), `lib/studio/create-carousel-prompts.ts` (designer inject wording), `lib/studio/agent-start-bundle.ts` (designer branch) | [ ] | Agent payload = tokens only (colors+type+text-block+small-element); no layout markup |
| 4 | **Frontend** | **C-razbor-draft-edit** | `components/studio/workspace/RazborModal.tsx`, `components/studio/workspace/RazborCarouselToggle.tsx` (or sibling), `components/studio/StudioModuleWorkspace.tsx` (openDraftPreview wire only) | [ ] | Draft RIGHT preview; hide «Начать разбор» on existing draft; «Выбрать»+square; Create-parity chat usable |
| 5 | **AI Bridge** | **C-razbor-draft-edit** | Razbor/Create chat context inject paths used by modal (`lib/studio/agent-chat-client.ts` callers / system builders; `razbor-pipeline` context helpers if any; prompt notes) | [ ] | LLM receives carousel JSON + slide URLs on draft-edit turns |
| 6 | **Backend** | **C-razbor-draft-edit** | `app/api/studio/drafts/route.ts`, `app/api/studio/drafts/[id]/route.ts`, `lib/db/drafts-repository.ts`, `lib/studio/carousel-drafts-store.ts`, `lib/studio/sprint8-client.ts`, `lib/studio/razbor-pipeline.ts` (`buildCarouselDraft` id stable) | [ ] | Upsert by **`draft.id`**; overwrite same row; no spam duplicates on redraw |
| 7 | **AI Bridge** | **C-carousel-quality-etalon** | `lib/mesh/agent-defaults.ts` (COMBAT carousel theme unlock), `lib/studio/create-carousel-prompts.ts`, `scripts/live-gen-*.ts` / new smoke script for 3×3 Armenian + image-2 bg | [ ] | No coffee/club product theme lock; random Armenian pool; image model `openai/gpt-5.4-image-2` for bg |
| 8 | **Backend** | **C-carousel-quality-etalon** | Draft upsert path used by smoke (same drafts API); optional budget JSON writer under `generatedMedia/` | [ ] | Smoke drafts overwrite stable ids; ≤9 PNG recorded |
| 9 | **Tester** | all three | guards under each ticket; S52.A–C contract asserts | [x] | Guards + smoke PASS (all 3); LIVE 9-PNG → Deployer; report `tester-report.md` |
| 10 | **Fixer** | failing only | same paths as failing ticket — surgical | [ ] | Same-command rerun green |
| 11 | **Deployer** | localhost | update local API if present; create `generatedMedia/эталон карусели/`; no VPS | [ ] | Live localhost + etalon folder for Client |
| 12 | **Client** | accept | Playwright **S52.A–C** @1440 | [x] | FINAL: **ПРИНЯТО С ЗАМЕЧАНИЯМИ** — P0 preview closed; P1 craft open; `client-verdict.md` |

## Path locks (no overlap writers)

1. **C-design-tokens-only:** Frontend Settings UI **before** AI Bridge payload (same semantic tokens). Do **not** parallel two writers on `DesignLibraryCarousel.tsx`.  
2. **C-razbor-draft-edit:** Frontend modal **before** AI Bridge context inject **before** Backend upsert hardening (sequential). Do **not** parallel RazborModal + drafts API writers overlapping the same PR without order.  
3. **C-carousel-quality-etalon:** after draft upsert key locked (step 6) — theme/prompt + smoke use same overwrite semantics.  
4. **Shell freeze:** **0** edits to `AppShell`, `SidebarNavigation` / left Studio nav IA.  
5. **Motion / WebGL / social publish / VPS:** out.  
6. Shared file `create-carousel-prompts.ts`: AI Bridge owns it across tickets **sequentially** (tokens inject in step 3 → draft context notes in step 5 → theme unlock in step 7) — **one writer at a time**.

## Upsert identity lock (Architect → implementers)

| Field | Value |
|-------|--------|
| Primary key | **`draft.id`** (Prisma upsert `where: { id }`) |
| API module | **`moduleId: "carousel-engine"`** (always on client API map) |
| Razbor id formula | **`draft-razbor-${post.id}`** (`buildCarouselDraft`) — keep stable across edit/redraw |
| Create id | Stable **`draftIdRef`** for session (`draft-create-…`); do not mint new id per redraw |
| Secondary | `sourceCompetitorId`, `competitorId`, `slides`, `scenario`, `status`, `brand`, `title`, timestamps |
| Forbidden | `sourcePostId`; insert-new-row-per-iteration; spam Черновики |

## Out of chain

Motion · Mesh static rewrite · Apify · Prisma schema change (unless Backend finds missing column — escalate to Architect) · prod/VPS.

## Next executor

**Frontend** on **C-design-tokens-only** (`memory/tickets/C-design-tokens-only/architect-spec.md`).
